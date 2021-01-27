// Storage contoller
const StorageCtrl = (function() {
    return {
        storeItem: function(item) {
            let items;
            // Check LS if it is empty
            if(localStorage.getItem("items") === null) {
                // Set new item
                items = [];
                items.push(item);
                localStorage.setItem("items", JSON.stringify(items));
            } else {
                // Get values from LS
                items = JSON.parse(localStorage.getItem("items"));

                // Push new item
                items.push(item);

                // Reset LS
                localStorage.setItem("items", JSON.stringify(items));
            }
        },
        getItemsFromStorage: function() {
            let items;
            if(localStorage.getItem("items") === null) {
                items = [];
            } else {
                items = JSON.parse(localStorage.getItem("items"));
            }
            return items;
        },
        updateItemStorage: function(updatedItem) {
            let items = JSON.parse(localStorage.getItem("items"));

            items.forEach(function(item, index) {
                if(updatedItem.id === item.id) {
                    items.splice(index, 1, updatedItem);
                }
            });
            localStorage.setItem("items", JSON.stringify(items));
        },
        deleteItemFromStorage: function(id) {
            let items = JSON.parse(localStorage.getItem("items"));

            items.forEach(function(item, index) {
                if(id === item.id) {
                    items.splice(index, 1);
                }
            });
            localStorage.setItem("items", JSON.stringify(items));
        },
        clearItemsFromStorage: function() {
            localStorage.removeItem("items");
        },
        getLang: function() {
            return localStorage.getItem("lang");
        },
        setUpLang: function(lang=null) {
            if(!this.getLang()) {
                localStorage.setItem("lang", "en");
            } else if(lang && this.getLang() !== lang) {
                localStorage.setItem("lang", lang);
            }
        }
    }
})();

// Item controller
const ItemCtrl = (function() {
    // Item constructor
    const Item = function(id, name, calories, date) {
        this.id = id;
        this.name = name;
        this.calories = calories;
        this.date = date;
    } 
    // Data structure / state
    const data = {
        items: StorageCtrl.getItemsFromStorage(),
        currentItem: null,
        totalCalories: 0
    }

    // Public methods
    return {
        getItems: function(date) {
            if(date !== "") {
                return data.items.filter((item) => item.date === date);
            }
            return data.items;
        },
        addItem: function(name, calories, date) {
            let ID;
            // Create ID
            if(data.items.length > 0) {
                ID = data.items[data.items.length -1].id +1;
            } else {
                ID = 0;
            }

            // Calories to number
            calories = parseInt(calories);

            //Create new item
            newItem = new Item(ID, name, calories, date);

            // Add to items array
            data.items.push(newItem);

            return newItem;
        },
        getItemById: function(id) {
            let found = null;
            // Loop through items
            data.items.forEach(function(item) {
                if(item.id === id) {
                    found = item;
                }
            });
            return found;
        },
        updateItem: function(name, calories, date) {
            // Calories to number
            calories = parseInt(calories);
            let found = null;

            data.items.forEach(function(item){
                if(item.id === data.currentItem.id) {
                    item.name = name;
                    item.calories = calories;
                    item.date = date;
                    found = item;
                }
            });
            return found;
        },
        deleteItem: function(id) {
            ids = data.items.map(function(item){
                return item.id;
            });

            const index = ids.indexOf(id);

            data.items.splice(index, 1);
        },
        clearAllItems: function() {
            data.items = [];
        },
        setCurrentItem: function(item) {
            data.currentItem = item;
        },
        getCurrentItem: function() {
            return data.currentItem;
        },
        getTotalCalories: function() {
            let total = 0;
            data.items.forEach(function(item) {
                total += item.calories;
            });

            data.totalCalories = total;

            return data.totalCalories;
        },
        getTotalCaloriesByDate: function(date) {
            const totalCalories = this.getTotalCalories();
            let total = 0;
            data.items.forEach(function(item) {
                if(item.date !== date) {
                    total += item.calories;
                }
            });

            data.totalCalories = totalCalories - total;
            return data.totalCalories;
        },
        logData: function() {
            return data;
        }
    };
})();

// Chart controller
const ChartCtrl = (function() {
    let myChart;

    function getLabels(date) {
        let labels;
        labels = ItemCtrl.getItems(date);
        if(date) {
            return labels.map(label => label.name);
        }
        // Remove duplicate dates from array from LS and sort by date
        return [...new Set(labels.map(label => label.date))].sort();
    }

    function getData(date) {
        let data;
        if(date) {
            data = ItemCtrl.getItems(date);
            return data.map(item => item.calories);
        } else {
            let result = [];
            const labels = getLabels(date);
            labels.forEach(label => {
                let sum = 0;
                data = ItemCtrl.getItems(label);
                data.forEach(item => {
                    sum += item.calories;
                });
                result.push(sum);       
            });
            return result;
        }  
    }

    function getChartType(date) {
        return date ? "pie" : "bar"
    }

    function getColors(date) {
        // Get array of random colors for pie chart
        if(date) {
            const numOfLabels = getLabels(date).length;
            let result = [];
            let letters = '0123456789ABCDEF';
    
            for(let i = 0; i < numOfLabels; i++) {
                let color = '#';
                for (let j = 0; j < 6; j++) {
                    color += letters[Math.floor(Math.random() * 16)];
                }
                result.push(color);
            }
            return result;
        }
        // Default color for bar chart
        return "#EDB845";
    }

    // Public methods
    return {
        buildChart: function(date) {
            const ctx = document.getElementById('myChart').getContext('2d');
            if (myChart) {myChart.destroy();}
            myChart = new Chart(ctx, {
                type: getChartType(date),
                data: {
                    labels: getLabels(date),
                    datasets: [{
                        label: '# of Calories',
                        data: getData(date),
                        backgroundColor: getColors(date),
                        // borderColor: getColors(date),
                        borderAlign: "center",
                        borderWidth: 5
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    },
                    responsive: false
                }
            });
        }
    }
})();

// UI controller
const UICtrl = (function() {
    const UISelectors = {
        itemList: "#item-list",
        addBtn: ".add-btn",
        listItems: "#item-list li",
        updateBtn: ".update-btn",
        backBtn: ".back-btn",
        clearBtn: ".clear-btn",
        deleteBtn: ".delete-btn",
        itemNameInput: ".item-name",
        itemCaloriesInput: ".item-calories",
        itemDateInput: ".item-date",
        totalCalories: ".total-calories",
        langSelect: ["#lang-en", "#lang-hu", "#lang-sk"]
    };

    // var languages;
    // async function fetchData(url) {
    //     let data = await fetch(url, {
    //                 method: "GET",
    //                 headers: {"Content-Type":"application/json"}
    //             });
    //     let result = await data.json();
    //     console.log(result);
    //     return result;
    // }

    // fetchData("dictionary.json");

    const languages = {
        calories:{"en":"calories", "hu":"kalória", "sk":"kalórie"},
        en:{
            "brand-logo":"Calorie tracker",
            "delete-all":"Clear All",
            "form-head": "Add Meal / Food Item",
            "item-name":"Meal",
            "item-calories":"Calories",
            "item-date":"Select date",
            "add-btn":"Add meal",
            "update-btn":"Update meal",
            "delete-btn":"Delete meal",
            "back-btn":"Back",
            "calories-text": "Total calories:"
        },
        hu:{
            "brand-logo":"Kalória számláló",
            "delete-all":"Összes törlése",
            "form-head": "Étel hozzáadása",
            "item-name":"Étel",
            "item-calories":"Kalória",
            "item-date":"Dátum kiválasztása",
            "add-btn":"Hozzáadás",
            "update-btn":"Módosítás",
            "delete-btn":"Törlés",
            "back-btn":"Vissza",
            "calories-text": "Kalória összesen:"
        },
        sk:{
            "brand-logo":"Kalorická kalkulačka",
            "delete-all":"Vymazať všetko",
            "form-head": "Pridať jedlo",
            "item-name":"Jedlo",
            "item-calories":"Kalória",
            "item-date":"Vyberte si dátum",
            "add-btn":"Pridať",
            "update-btn":"Zmeniť",
            "delete-btn":"Vymazať",
            "back-btn":"Späť",
            "calories-text": "Celková kalorická hodnota:"
        }
    };

    // Public methods
    return {
        populateItemList: function(items, lang, date) {
            let html = "";
            if(date === "") {
                items.forEach(function(item) {
                    html += `<li id="item-${item.id}" class="collection-item">
                        <strong>${item.name}: </strong> <em>${item.calories} ${languages["calories"][lang]}</em> (${item.date})
                        <a href="#" class="secondary-content">
                            <i class="edit-item fa fa-pencil"></i>
                        </a>
                    </li>`;
                });
            } else {
                items.forEach(function(item) {
                    if(item.date === date) {
                        html += `<li id="item-${item.id}" class="collection-item">
                        <strong>${item.name}: </strong> <em>${item.calories} ${languages["calories"][lang]}</em>
                        <a href="#" class="secondary-content">
                            <i class="edit-item fa fa-pencil"></i>
                        </a>
                    </li>`;
                    }
                });
            }
 
            // Insert list items
            document.querySelector(UISelectors.itemList).innerHTML = html;
        },
        getItemInput: function() {
            return {
                name: document.querySelector(UISelectors.itemNameInput).value,
                calories: document.querySelector(UISelectors.itemCaloriesInput).value,
                date: document.querySelector(UISelectors.itemDateInput).value
            };
        },
        addListItem: function(item, lang) {
            // Show the list
            // document.querySelector(UISelectors.itemList).style.display = "block";
            this.showList();
            // Create li elemnt
            const li = document.createElement("li");
            li.className = "collection-item";
            li.id = `item-${item.id}`;

            // Add HTML to list item
            li.innerHTML = `<strong>${item.name}: </strong> <em>${item.calories} ${languages["calories"][lang]}</em>
                            <a href="#" class="secondary-content">
                                <i class="edit-item fa fa-pencil"></i>
                            </a>`;

            // Insert item
            document.querySelector(UISelectors.itemList).insertAdjacentElement("beforeend", li);
        },
        updateListItem: function(item, lang) {
            let listItems = document.querySelectorAll(UISelectors.listItems);

            // Convert nodelist into array
            listItems = Array.from(listItems);

            listItems.forEach(function(listItem) {
                const itemID = listItem.getAttribute("id");
                if(itemID === `item-${item.id}`) {
                    document.querySelector(`#${itemID}`).innerHTML = `<strong>${item.name}: </strong> <em>${item.calories} ${languages["calories"][lang]}</em>
                    <a href="#" class="secondary-content">
                        <i class="edit-item fa fa-pencil"></i>
                    </a>`;
                }
            });
        },
        deleteListItem: function(id) {
            const itemID = `#item-${id}`;
            const item = document.querySelector(itemID);
            item.remove();
        },
        clearInput: function() {
            document.querySelector(UISelectors.itemNameInput).value = "";
            document.querySelector(UISelectors.itemCaloriesInput).value = "";
        },
        addItemToForm: function() {
            document.querySelector(UISelectors.itemCaloriesInput).focus();
            document.querySelector(UISelectors.itemNameInput).focus();
            document.querySelector(UISelectors.itemNameInput).value = ItemCtrl.getCurrentItem().name;
            document.querySelector(UISelectors.itemCaloriesInput).value = ItemCtrl.getCurrentItem().calories;
            document.querySelector(UISelectors.itemDateInput).value = ItemCtrl.getCurrentItem().date;
            UICtrl.showEditState();
        },
        hideList: function() {
            document.querySelector(UISelectors.itemList).style.display = "none";
        },
        showList: function() {
            document.querySelector(UISelectors.itemList).style.display = "";
        },
        removeItems: function() {
            let listItems = document.querySelectorAll(UISelectors.listItems);

            listItems = Array.from(listItems);
            listItems.forEach(function(item) {
                item.remove();
            });
        },
        showTotalCalories: function(totalCalories) {
            document.querySelector(UISelectors.totalCalories).textContent = totalCalories;
        },
        clearEditState: function() {
            UICtrl.clearInput();
            document.querySelector(UISelectors.updateBtn).style.display = "none";
            document.querySelector(UISelectors.deleteBtn).style.display = "none";
            document.querySelector(UISelectors.backBtn).style.display = "none";
            document.querySelector(UISelectors.addBtn).style.display = "inline";
        },
        showEditState: function() {
            document.querySelector(UISelectors.updateBtn).style.display = "inline";
            document.querySelector(UISelectors.deleteBtn).style.display = "inline";
            document.querySelector(UISelectors.backBtn).style.display = "inline";
            document.querySelector(UISelectors.addBtn).style.display = "none";
        },
        isEditStateActive: function() {
            return document.querySelector(UISelectors.updateBtn).style.display === "inline";
        },
        getSelectors: function() {
            return UISelectors;
        },
        setActiveLangBtn: function(lang) {
            for(const item of UISelectors.langSelect) {
                const btn = document.querySelector(item);
    
                if(btn.getAttribute("id") === `lang-${lang}`) {
                    btn.classList.replace("lighten-2", "darken-2");
                    
                } else {
                    btn.classList.replace("darken-2", "lighten-2");
                }
            }
        },
        populateLang: function(initialLang) {
            for(const lang in languages[initialLang]){
                document.getElementById(lang).textContent = languages[initialLang][lang];
            }
            
        },
        populateItemListByDate: function(items, lang, date) {
            if(items.length === 0) {
                this.hideList();
            } else {
                this.showList();
                this.populateItemList(items, lang, date);
            }
        }
    }
})();

// App controller
const App = (function(ItemCtrl, StorageCtrl, UICtrl, ChartCtrl) {

    const initialLang = StorageCtrl.getLang();
    // Load event listeners
    const loadEventListeners = function() {
        // Get UI Selectors
        const UISelectors = UICtrl.getSelectors();

        // Add item event
        document.querySelector(UISelectors.addBtn).addEventListener("click", itemAddSubmit);

        // Disable submit on enter
        document.addEventListener("keypress", function(e){
            if(e.keyCode === 13 || e.which === 13){
                e.preventDefault();
                return false;
            }
        });

        // edit icon click event
        document.querySelector(UISelectors.itemList).addEventListener("click", itemEditClick);

        // Update item click event
        document.querySelector(UISelectors.updateBtn).addEventListener("click", itemUpdateSubmit);

        // Delete item click event
        document.querySelector(UISelectors.deleteBtn).addEventListener("click", itemDeleteSubmit);

        // Back button event
        document.querySelector(UISelectors.backBtn).addEventListener("click", backBtnClick);

        // Clear Items event
        document.querySelector(UISelectors.clearBtn).addEventListener("click", clearAllItems);

        // Change date
        document.querySelector(UISelectors.itemDateInput).addEventListener("change", dateSelect);

        // Change language event
        for(const item of UISelectors.langSelect) {
            const btn = document.querySelector(item);
            btn.addEventListener("click", changeLang);
        }
    };

    const backBtnClick = function(e) {
        e.preventDefault();
        UICtrl.clearEditState();
    }

    // Add item submit
    const itemAddSubmit = function(e) {
        // Get form input from UI Contoller
        const input = UICtrl.getItemInput();

        // Check for name and calories input
        if(input.name !== "" && input.calories !== "" && input.date !== "") {
            const newItem = ItemCtrl.addItem(input.name, input.calories, input.date);

            // Add item to UI list
            UICtrl.addListItem(newItem, initialLang);

            // Get total calories
            const totalCalories = !input.date ? ItemCtrl.getTotalCalories() : ItemCtrl.getTotalCaloriesByDate(input.date);
    
            // Add total calories to UI
            UICtrl.showTotalCalories(totalCalories);

            // Build chart
            ChartCtrl.buildChart(input.date);

            // Store in local storage
            StorageCtrl.storeItem(newItem);

            //Clear input
            UICtrl.clearInput();
        }

        e.preventDefault();
    };

    // Edit item
    const itemEditClick = function(e) {
        if(e.target.classList.contains("edit-item")) {
            // Get list item id
            const listId = e.target.parentNode.parentNode.id;
            
            // Break parent id into an array
            const listIdArr = listId.split("-");
            // Get actual id
            const id = parseInt(listIdArr[1]);

            // Get item
            const itemToEdit = ItemCtrl.getItemById(id);
            
            // Set current item
            ItemCtrl.setCurrentItem(itemToEdit);

            // Add item to form
            UICtrl.addItemToForm();
        }

        e.preventDefault();
    }

    // Item update
    const itemUpdateSubmit = function(e) {
        // Get item input
        const input = UICtrl.getItemInput();

        // Update item
        const updatedItem = ItemCtrl.updateItem(input.name, input.calories, input.date);

        // Update UI
        UICtrl.updateListItem(updatedItem, initialLang);

        // Get total calories
        const totalCalories = !input.date ? ItemCtrl.getTotalCalories() : ItemCtrl.getTotalCaloriesByDate(input.date);

        // Add total calories to UI
        UICtrl.showTotalCalories(totalCalories);

        // Update LS
        StorageCtrl.updateItemStorage(updatedItem);

        UICtrl.clearEditState();

        window.location.reload();

        e.preventDefault();
    }

    // Delete item
    const itemDeleteSubmit = function(e) {
        // Get current item
        const currentItem = ItemCtrl.getCurrentItem();

        // Delete from data structure
        ItemCtrl.deleteItem(currentItem.id);

        // Delete from UI
        UICtrl.deleteListItem(currentItem.id);

        const input = UICtrl.getItemInput().date;
        // Get total calories (if date is selected then show total calories for that date only)
        const totalCalories = !input ? ItemCtrl.getTotalCalories() : ItemCtrl.getTotalCaloriesByDate(input);

        // Add total calories to UI
        UICtrl.showTotalCalories(totalCalories);

        // Delete from LS
        StorageCtrl.deleteItemFromStorage(currentItem.id);

        UICtrl.clearEditState();

        // Build chart
        ChartCtrl.buildChart(input);

        e.preventDefault();
    }

    // Clear items event
    const clearAllItems = function() {
        ItemCtrl.clearAllItems();

        const input = UICtrl.getItemInput().date;
        // Get total calories
        const totalCalories = !input ? ItemCtrl.getTotalCalories() : ItemCtrl.getTotalCaloriesByDate(input);

        // Add total calories to UI
        UICtrl.showTotalCalories(totalCalories);

        UICtrl.removeItems();

         // Build chart
         ChartCtrl.buildChart(input);

        // Clear from LS
        StorageCtrl.clearItemsFromStorage();

        // Hide ul
        UICtrl.hideList();
    }

    // Change language
    const changeLang = function(e) {
        // Get selected language
        const lang = e.target.getAttribute("id").split("-")[1];

        // Save selected language to LS
        StorageCtrl.setUpLang(lang);
        // Change active language button
        UICtrl.setActiveLangBtn(lang);
        UICtrl.populateLang(lang);

        const input = UICtrl.getItemInput().date;
        const items = ItemCtrl.getItems(input);

        UICtrl.populateItemList(items, lang, input);

        e.preventDefault();
    }

    // Select date
    const dateSelect = function(e) {
        // Check if edit state is active to prevent list from changing when editng item
        if(!UICtrl.isEditStateActive()) {
            // Populate UI on date select
            const input = e.target.value
            const items = ItemCtrl.getItems(input);
    
            // Populate list with items
            UICtrl.populateItemListByDate(items, initialLang, input);

            // Get total calories
            const totalCalories = !input ? ItemCtrl.getTotalCalories() : ItemCtrl.getTotalCaloriesByDate(input);

            // Add total calories to UI
            UICtrl.showTotalCalories(totalCalories);

            // Build chart
            ChartCtrl.buildChart(input);
        }

        e.preventDefault();
    }

    // Public methods
    return {
        init: function() {
            // Set up language in LS
            StorageCtrl.setUpLang();

            // Set up active language button based on selected language in LS
            UICtrl.setActiveLangBtn(initialLang);

            // Language of UI
            UICtrl.populateLang(initialLang);

            // Clear edit state / set initial state
            UICtrl.clearEditState();

            //  Check if any items
            const input = UICtrl.getItemInput().date;
            const items = ItemCtrl.getItems(input);
            
            // Populate list with items
            UICtrl.populateItemListByDate(items, initialLang, input);

            // Get total calories
            const totalCalories = !input ? ItemCtrl.getTotalCalories() : ItemCtrl.getTotalCaloriesByDate(input);

            // Add total calories to UI
            UICtrl.showTotalCalories(totalCalories);

            // Build chart
            ChartCtrl.buildChart(input);

            // Load event listeners
            loadEventListeners();
        }
    };
})(ItemCtrl, StorageCtrl, UICtrl, ChartCtrl);

// Init app
App.init();