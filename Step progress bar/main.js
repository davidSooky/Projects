// Defining global variables
const bullets = [...document.querySelectorAll(".bullet")];
const prevButton = document.querySelector("#btn-previous");
const nextButton = document.querySelector("#btn-next");
const finishButton = document.querySelector("#btn-finish");
const stepCounter = document.querySelector(".counter");
const max = bullets.length;
const duration = parseFloat(getComputedStyle(document.documentElement || document.body).getPropertyValue('--animation-time'))*1000;
let currentPos = 1;

// Call functions on page load
updateCounter();

// Event listeners to select a step by clicking on bullets
bullets.forEach(bullet => {
    bullet.addEventListener("click", e => {
        let selectedPos = parseInt(e.target.textContent);
        let posDifference = selectedPos - currentPos;
        let counter = Math.abs(posDifference);
        if(posDifference > 0) {
            for(let i = 1; i <= counter; i++) {
                setTimeout(increaseCurrentPos, (i - 1) * duration);
            }
        } else {
            for(let i = 1; i <= counter; i++) {
                setTimeout(decreaseCurrentPos, (i - 1) * duration);
            }
        }
    });
});

// Increase step by one by clicking the next button
nextButton.addEventListener("click", (e) => {
    increaseCurrentPos();

    e.preventDefault();
});

// Decrease step by one by clicking the previous button
prevButton.addEventListener("click", (e) => {
    decreaseCurrentPos();

    e.preventDefault();
});


// Helper functions

// Increase step
function increaseCurrentPos() {
    if(currentPos < max) {
        bullets[currentPos - 1].classList.add("active");
        currentPos++;
    }
    
    btnHandling();
    setCurrent();
    updateCounter();
}

// Decrease step
function decreaseCurrentPos() {
    if(currentPos !== 1) {
        bullets[currentPos - 2].classList.remove("active");
        currentPos--;
    }

    btnHandling();
    setCurrent();
    updateCounter();
}

// Disable/enable buttons based on current step
function btnHandling() {
    if(currentPos !== 1 && currentPos !== max) {
        prevButton.disabled = false;
        nextButton.disabled = false;
        finishButton.style.visibility = "hidden";
    }
    else if(currentPos === 1) {
        prevButton.disabled = true;
    }else if(currentPos === max) {
        nextButton.disabled = true;
        finishButton.style.visibility = "visible";
    }
}

// Update text of the current step
function updateCounter() {
    stepCounter.textContent = `Step ${currentPos.toString()} of ${max}`;
}

// Set the current step
function setCurrent() {
    bullets.forEach( bullet => {
        bullet.classList.remove("current");
    });

    bullets[currentPos - 1].classList.add("current");
}