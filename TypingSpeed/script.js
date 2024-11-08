const quoteDisplayElement = document.getElementById('quote-display');
const quoteInputElement = document.getElementById("quote-input");
const wpmElement = document.getElementById("wpm");

async function getRandomQuote() {
    const response = await fetch("https://baconipsum.com/api/?type=meat-and-filler&paras=1");
    const data = await response.json();
    console.log(data[0]);
    return data[0];
}

let timerInterval;
let startTime;

function startTimer() {
    const el = document.getElementById('timer');
    let val = 0;
    el.innerHTML = val;
    if (timerInterval) clearInterval(timerInterval);

    startTime = new Date();
    timerInterval = setInterval(() => {
        val++;
        el.innerHTML = val;
    }, 1000);
}

async function renderNewQuote() {
    quoteDisplayElement.innerHTML = '';
    quoteInputElement.value = '';
    wpmElement.innerHTML = "0 WPM";
    
    const text = await getRandomQuote();
    const characters = text.split("");
    
    characters.forEach(char => {
        const span = document.createElement('span');
        span.innerHTML = char;
        quoteDisplayElement.append(span);
    });
    
    quoteInputElement.focus();
    startTimer();
}

renderNewQuote();

function cleanChar(char, isNextCharSpace = false) {
    if (isNextCharSpace && char === ".") {
        return ".  ";  // Keep single space after period
    }
    return char.replace(/[^\w\s]/g, ""); // Removes other punctuation
}

quoteInputElement.addEventListener("input", () => {
    const curr = quoteInputElement.value;
    const allSpan = document.querySelectorAll("span");
    let correct = true;

    wpmElement.innerHTML = getWPM() + " WPM";

    allSpan.forEach((span, index) => {
        const char = curr[index];

        if (char == null) {
            // No input for this character yet, reset styles
            span.classList.remove('correct', 'incorrect');
            correct = false;
        } else if (cleanChar(char) === cleanChar(span.innerText)) {
            // Correct character
            span.classList.add('correct');
            span.classList.remove('incorrect');
        } else {
            // Incorrect character
            span.classList.add('incorrect');
            span.classList.remove('correct');
            correct = false;
        }
    });

    // If the entire input is correct, render a new quote
    if (correct && curr.length === allSpan.length) {
        renderNewQuote();
    }
});

function getWPM() {
    let words = quoteInputElement.value.trim().split(/\s+/).length; 
    let time = (new Date() - startTime) / 60000; // time in minutes
    let wpm = words / time;
    return wpm.toFixed(2);
}
