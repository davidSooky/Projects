const loader = document.querySelector(".loader");
const leftArrow = document.getElementById("left-arrow");
const rightArrow = document.getElementById("right-arrow");

function getUIItems() {
    const items = {
        weatherDescription: document.querySelectorAll(".description"),
        cityName: document.querySelectorAll(".card-title"),
        temp: document.querySelectorAll(".temperature"),
        country: document.querySelectorAll(".country"),
        icon: document.querySelectorAll(".weather-icon"),
        forecast: document.querySelectorAll(".card-content"),
        currentTemp: document.querySelectorAll(".current-temperature"),
        currentDate: document.querySelectorAll(".current-date"),
        numOfCards: document.querySelectorAll(".cards").length - 1,
        content: document.querySelector(".content"),
        switch: document.querySelector(".toggle-switch"),
        searchForm: document.querySelector("#search-form")
    };

    return items;
}

const weatherDataCtrl = (function() {
    let weatherData = {
        actualWeather: [],
        weatherForecast: []
    };

    return {
        addActualWeather: function(data) {
            weatherData.actualWeather.push(data);
        },
        addForecast: function(data) {
            weatherData.weatherForecast.push(data);
        },
        getItems: function() {
            return weatherData;
        }
    }
})();

class ActualWeather {
    constructor(description, actualTemp, minTemp, maxTemp, humidity, city, country, weatherIcon, pressure) {
        this.description = description;
        this.actualTemp = this.convertToCelsius(actualTemp);
        this.minTemp = this.convertToCelsius(minTemp);
        this.maxTemp = this.convertToCelsius(maxTemp);
        this.humidity = humidity;
        this.city = city;
        this.country = country;
        this.weatherIcon = weatherIcon;
        this.pressure = pressure;
        this.unit = "°C"
    }

    convertToCelsius(degree) {
        return parseFloat(degree - 273.15).toFixed(1);
    }

    convertFromFtoCelsius(degree) {
        return parseFloat((degree - 32) / 1.8).toFixed(1);
    }

    convertToFahrenheit(degree) {
        return parseFloat(degree * 1.8 + 32).toFixed(1);
    }

    changeUnit() {
        if (this.unit === "°C") {
            this.actualTemp = this.convertToFahrenheit(this.actualTemp);
            this.minTemp = this.convertToFahrenheit(this.minTemp);
            this.maxTemp = this.convertToFahrenheit(this.maxTemp);
            this.unit = "°F";
        } else {
            this.actualTemp = this.convertFromFtoCelsius(this.actualTemp);
            this.minTemp = this.convertFromFtoCelsius(this.minTemp);
            this.maxTemp = this.convertFromFtoCelsius(this.maxTemp);
            this.unit = "°C";
        }
    }
}

class WeatherForecast extends ActualWeather {
    constructor(minTemp, maxTemp, humidity, windSpeed, date) {
        super();
        this.minTemp = super.convertToCelsius(minTemp);
        this.maxTemp = super.convertToCelsius(maxTemp);
        this.humidity = humidity;
        this.windSpeed = windSpeed;
        this.date = this.assignTime(date);
    }

    assignTime(date) {
        let newDate = date.split(" ")[1];
        newDate = newDate.slice(0, -3);
        return newDate;
    }
}

document.addEventListener("DOMContentLoaded", main);

document.querySelector("#search-form").addEventListener("submit", (e) => {
    const input = e.target.querySelector("#city-input");
    const cityName = input.value;
    fetchWeatherData(selectApiUrl(null, null, cityName))
        .catch(err => {});
    fetchForecastData(selectApiUrl(null, null, cityName, true))
        .catch(err => {handleInputError(input)});
    e.preventDefault();
});

function handleInputError(input) {
    input.value = "Invalid input";
    setTimeout(() => {
        input.value = "";
        input.blur();
    }, 2000);
}

document.querySelector(".btn-change").addEventListener("click", (e) => {
    e.target.dataset.unit = rebuildHeader();
    rebuildContent();
});

leftArrow.addEventListener("click", () => {
    swipeToLeft();
});

rightArrow.addEventListener("click", () => {
    swipeToLeft(false);
});

function createNewCard() {
    loader.classList.remove("inactive");
    const content = document.querySelector(".content");
    const newCard = document.createElement("div");
    newCard.classList.add("cards");
    let html = `
        <div class="card-header">
            <h1 class="card-title">Hello</h1>
            <h4 class="current-date"></h4>
            <div class="main-flex">
                <div class="column">
                    <h5 class="description"></h5>
                    <img src="" class="weather-icon">
                    <h5 class="current-temperature"></h5>
                </div>
                <div class="column">
                    <p class="temperature"></p>
                </div>
            </div>
        </div>
        <div class="card-content flex">
        </div>  
    `;
    newCard.innerHTML = html;
    content.appendChild(newCard);
}

function main() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            let [lat, lon] = getCoords(position);

            fetchWeatherData(selectApiUrl(lat, lon));
            fetchForecastData(selectApiUrl(lat, lon, null, true));
        })
    } else {
        console.log("Something went wrong!");
    }
}

function getCoords(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    return [lat, lon];
}

function selectApiUrl(latitude, longitude, city = null, forecast = false) {
    const apiKey= "d6d4ff6204707d151f75d646cf7398c1";
    if (city && forecast) {
        return `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;
    } else if (city) {
        return `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    } else if (forecast) {
        return `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
    }   
    return `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
}

async function fetchWeatherData(url) {
    const response = await fetch(url);
    const data = await response.json();
    let weather = new ActualWeather(data.weather[0].description, data.main.temp, data.main.temp_min, data.main.temp_max, 
        data.main.humidity, data.name, data.sys.country, data.weather[0].icon, data.main.pressure);
    buildHeader(weather);
    weatherDataCtrl.addActualWeather(weather);
}

async function fetchForecastData(url) {
    const response = await fetch(url);
    const data = await response.json();

    for(let i = 1; i <= 4; i++) {
        let weather = new WeatherForecast(data.list[i].main.temp_min, data.list[i].main.temp_max, 
            data.list[i].main.humidity, data.list[i].wind.speed, data.list[i].dt_txt);
        weatherDataCtrl.addForecast(weather);
        buildContent(weather);
    }
    swipeToLeft();
    loader.classList.add("inactive");
}

function buildHeader(weather) {
    let UIItems = getUIItems();
    let numOfCards = UIItems.numOfCards;
    if(UIItems.currentDate[numOfCards].textContent) {
        createNewCard();
        numOfCards++;
        UIItems = getUIItems();
    }
    const newDate = new Date().toString().split(" ");
    UIItems.currentDate[numOfCards].textContent = `${newDate[0]} ${newDate[1]} ${newDate[2]}`;
    UIItems.cityName[numOfCards].innerHTML = `${weather.city}<span class="country">${weather.country}</span>`;
    UIItems.icon[numOfCards].setAttribute("src", `http://openweathermap.org/img/wn/${weather.weatherIcon}@2x.png`);
    UIItems.temp[numOfCards].innerHTML = `<p>Min / Max</p>${weather.minTemp}° / ${weather.maxTemp}°<span class="humidity">Humidity: ${weather.humidity}%</span>
                                            <span class="pressure">Pressure: ${weather.pressure} hPa</span>`;
    UIItems.weatherDescription[numOfCards].textContent = weather.description;
    UIItems.currentTemp[numOfCards].textContent = `${weather.actualTemp}°`;
}

function rebuildHeader() {
    let UIItems = getUIItems();
    let cardHeaders = document.querySelectorAll(".card-header");
    cardHeaders = Array.from(cardHeaders);
    let weatherData = weatherDataCtrl.getItems().actualWeather;

    cardHeaders.forEach((item, index) => {
        weather = weatherData[index];
        weather.changeUnit();
        UIItems.temp[index].innerHTML = `<p>Min / Max</p>${weather.minTemp}° / ${weather.maxTemp}°<span class="humidity">Humidity: ${weather.humidity}%</span>
                                        <span class="pressure">Pressure: ${weather.pressure} hPa</span>`;
        UIItems.currentTemp[index].textContent = `${weather.actualTemp}°`;
    });
    return weatherDataCtrl.getItems().actualWeather[0].unit;
}

function buildContent(weather) {
    const newDiv = document.createElement("div");
    const UIItems = getUIItems();
    const numOfCards = UIItems.numOfCards;
    newDiv.className = "data-card";
    newDiv.innerHTML = `
        <div>${weather.date}</div>
        <div><p><i class="fas fa-temperature-low"></i> / <i class="fas fa-temperature-high"></i></p> ${weather.minTemp}° / ${weather.maxTemp}°</div>
        <div><p><i class="fas fa-tint"></i></p>${weather.humidity}%</div>
        <div><p><i class="fas fa-wind"></i></p>${weather.windSpeed} km/h</div>
    `;
    UIItems.forecast[numOfCards].appendChild(newDiv);
}

function rebuildContent() {
    let dataCards = document.querySelectorAll(".data-card");
    dataCards = Array.from(dataCards);
    let weatherData = weatherDataCtrl.getItems().weatherForecast;

    dataCards.forEach((item, index) => {
        weather = weatherData[index];
        weather.changeUnit();
        item.innerHTML = `
            <div>${weather.date}</div>
            <div><p><i class="fas fa-temperature-low"></i> / <i class="fas fa-temperature-high"></i></p> ${weather.minTemp}° / ${weather.maxTemp}°</div>
            <div><p><i class="fas fa-tint"></i></p>${weather.humidity}%</div>
            <div><p><i class="fas fa-wind"></i></p>${weather.windSpeed} km/h</div>
        `;
    });
}

function swipeToLeft(toLeft = true) {
    const UIItems = getUIItems();
    const numberOfCards = UIItems.numOfCards;
    const margin = parseInt(getComputedStyle(UIItems.content).marginLeft);
    const condition = toLeft ? -1 : 0;
    const addition = toLeft ? -100 : 100;

    if(((margin / 600) / numberOfCards) != condition && numberOfCards != 0) {
        UIItems.switch.style.opacity = 0;
        UIItems.searchForm.style.opacity = 0;
        UIItems.searchForm.querySelector("#city-input").blur();
        UIItems.searchForm.querySelector("#city-input").value = "";
        let newMargin = (margin / 600) * 100 + addition;

        UIItems.content.setAttribute("style", `margin-left:${newMargin}%`);
        setTimeout(() => {
            UIItems.switch.style.opacity = 1;
            UIItems.searchForm.style.opacity = 1;
        }, 400);
    }
}