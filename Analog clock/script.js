const hoursHand = document.querySelector(".hours");
const minutesHand = document.querySelector(".minutes");
const secondsHand = document.querySelector(".seconds");

function setTime() {
    const time = new Date();
    const seconds = time.getSeconds() / 60;
    const minutes = (seconds + time.getMinutes()) / 60;
    const hours = (minutes + time.getHours()) / 12;

    setRotation(secondsHand, seconds);
    setRotation(minutesHand, minutes);
    setRotation(hoursHand, hours);
}

function setRotation(element, value) {
    element.style.setProperty("--rotation", value * 360);
}

setTime();
setInterval(setTime, 1000);