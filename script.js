


// The below section grabs a random 4 letter word from four-letter words and displays it with letter boxes. https://github.com/getify/dwordly-game/blob/main/four-letter-words.json
const wordElement = document.getElementById("word");

let word = "";
// Fetch a random word from words.txt and display it with letter boxes
function fetchRandomWord() {
    fetch('four-letter-words.json')
        .then(response => response.json())
        .then(words => {
            //select random word from the list, log it to the console
            word = words[Math.floor(Math.random() * words.length)].trim();
            console.log("Selected word:", word);
        })
        .catch(error => console.error('Error fetching words:', error));
}

fetchRandomWord();


// The below section scrambles the keyboard inputs 
const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
let keyboardMap = {};

function keyboardScrambleMap(key = "") {
    if (normalKeyboardMode) {
        return key;
    }
    if (!Object.keys(keyboardMap).length) {
        const shuffled = [...alphabet];

        for (let i = shuffled.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
        }

        keyboardMap = alphabet.reduce((map, letter, index) => {
            const scrambledLetter = shuffled[index];
            map[letter] = scrambledLetter;
            map[letter.toUpperCase()] = scrambledLetter.toUpperCase();
            return map;
        }, {});
    }

    if (!key) {
        return keyboardMap;
    }

    return keyboardMap[key] ?? key;
}



// The below section handles the keyboard input 
const inputDiv = document.getElementById("inputDiv");
let inputWord = "";

const inputBoxes = '<span class="letterBox"></span>'.repeat(4);


inputDiv.innerHTML = inputBoxes;
let play = false;

fetch("four-letter-words.json")
    .then(response => response.json())
    .then(data => {
        fourLetterWords = data;
    })
    .catch(error => console.error('Error fetching four-letter words:', error));


document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" || event.key === "Enter") {
        if (invalidWordWindow.style.display === "block") {
            invalidWordWindow.style.display = "none";
            play = true;
            return;
        }
        else if (winWindow.style.display === "block") {
            winWindow.style.display = "none";
            resetGame();
            play = true;
            return;
        }
    }

    const mappedKey = keyboardScrambleMap(event.key);
    const key = mappedKey.toLowerCase();


    //All keyboard inputs are handled within this loop
    while (play === true) { 
        // Character input handling
        if (key.length === 1 && /[a-z]/.test(key)) {
            inputWord = inputWord.substring(0, inputBoxes.length - 1) + key;
            const updatedBoxes = inputWord.split('').map(letter => `<span class="letterBox">${letter}</span>`).join('');
            inputDiv.innerHTML = updatedBoxes;
        }
        // Backspace handling
        else if (key === "backspace") { 
            // if control key is pressed, delete all letters
            if (event.ctrlKey) {
                inputWord = "";
                animateInputBoxes(0, "deleteAll");
            }
            else {
                inputWord = inputWord.substring(0, inputWord.length - 1);
                animateInputBoxes(0, "delete");
            }
            const updatedBoxes = inputWord.split('').map(letter => `<span class="letterBox">${letter}</span>`).join('');
            inputDiv.innerHTML = updatedBoxes;
        } 
        // Enter key handling
        else if (key === "enter") { 
            if (inputWord.length === 4) { // Check if input is 4 letters and a word in the four-letter-words.json
                if (fourLetterWords.includes(inputWord.toUpperCase())) {
                    moveToNextWord();
                } else {
                    //Invalid input: word not in the list
                    invalidReason.textContent = "Not in Word List!";
                    animateInputBoxes(-1, "popdown");
                    invalidWordWindow.style.display = "block";
                    animateInputBoxes(0, "bad");
                    //play = false;
                    return;
                }
            }
            else {
                //Invalid input: word is not four letters
                invalidReason.textContent = "Please enter a four-letter word!";
                animateInputBoxes(-1, "popdown");
                invalidWordWindow.style.display = "block";
                animateInputBoxes(0, "bad");
                //play = false;
                return;
            }
        animateInputBoxes(1, "flip");
        }
        // Fill the remaining boxes with empty letter boxes
        if (inputWord.length < 4) {
            const emptyBoxes = Array(4 - inputWord.length).fill('<span class="letterBox"style="color: #333333;">.</span>').join('');
            inputDiv.innerHTML += emptyBoxes;
        }  
        // Cap the total number of boxes and characters at 4
        if (inputDiv.children.length > 4) {
            inputDiv.innerHTML = Array.from(inputDiv.children).slice(0, 4).map(child => child.outerHTML).join('');
            inputWord = inputWord.substring(0, 4);
        }
        break;
    }
});

function animateInputBoxes(index, direction) {
    let letterBoxes = document.querySelectorAll(".letterBox");
    let letterBoxRows = Array.from(document.querySelectorAll(".letterBoxRow")).reverse();
    const popdownWindow = document.querySelector("#invalidWordWindow");

    if (direction === "bad") {
        letterBoxRows[index].classList.add("wiggleBAD");
    } else if (direction === "delete") {
        letterBoxRows[index].classList.add("wiggleDelete");
    } else if (direction === "flip") {
        letterBoxRows[index].classList.add("flipSuccess");
    } else if (direction === "deleteAll") {
        letterBoxRows[index].classList.add("wiggleDeleteAll");
    } else if (direction === "popdown") {
        popdownWindow.style.display = "block";
        popdownWindow.classList.add("popdownAnimation");
        setTimeout(() => {
            popdownWindow.classList.remove("popdownAnimation");
            popdownWindow.style.display = "none";
        }, 1450);
        return;
    }


    setTimeout(() => {
        letterBoxRows[index].classList.remove("wiggleDelete");
        letterBoxRows[index].classList.remove("wiggleBAD");
        letterBoxRows[index].classList.remove("flipSuccess");
        letterBoxRows[index].classList.remove("wiggleDeleteAll");
    }, 500);
}

// The below section moves the current input word to the previous guesses and adds colours based on how closely it matches the target word
const prevGuessesDiv = document.getElementById("prevGuesses");
const winWindow = document.getElementById("winWindow");
const invalidWordWindow = document.getElementById("invalidWordWindow");
//function to move to the next word
function moveToNextWord() {
    //capitalize the input word
    inputWord = inputWord.toUpperCase();

    // Notify the virtual keyboard to reveal only letters from this submitted guess.
    document.dispatchEvent(
        new CustomEvent("guessSubmitted", {
            detail: { guess: inputWord },
        })
    );

    // Make div visible
    prevGuessesDiv.style.display = "block";

    // Append the current input word to the previous guesses section
    prevGuessesDiv.innerHTML += `<div class="prevGuess letterBoxRow">${inputDiv.innerHTML}</div>`;

    //make each letter that matches the target word green
    const prevGuessBoxes = prevGuessesDiv.lastElementChild.querySelectorAll(".letterBox");

    let wordCopy = word.split('');


    prevGuessBoxes.forEach((box, index) => {
        if (box.textContent.toUpperCase() === word[index]) {
            box.style.backgroundColor = "#076a07";
            wordCopy[index] = null; // Mark this letter as used
            console.log(`Letter ${box.textContent.toUpperCase()} is correct and in the right position.`);
        }
    });
    //make each letter that exists in the target word but in the wrong position yellow
    prevGuessBoxes.forEach((box, index) => {
        if (wordCopy.includes(box.textContent.toUpperCase()) && box.textContent.toUpperCase() !== word[index]) {
            box.style.backgroundColor = "#6a6a07";
            wordCopy[wordCopy.indexOf(box.textContent.toUpperCase())] = null; // Mark this letter as used
            console.log(`Letter ${box.textContent.toUpperCase()} is correct but in the wrong position.`);
        }
    });

    // Check if the input word matches the target word
    if (inputWord === word) {
        // If the input word matches the target word, stop the game
        play = false;
        // Delete the inputDiv content
        inputDiv.innerHTML = "";

        winWindow.style.display = "block";
    }
    else {
        // Reset the input word and inputDiv for the next attempt
        inputWord = "";
        inputDiv.innerHTML = '<span class="letterBox"></span>'.repeat(4);
        //scroll to the inputDiv
        inputDiv.scrollIntoView({ behavior: "smooth" });
    }
}



// Event listener for the "Play Again" button in the win window
document.getElementById("playAgainWin").addEventListener("click", () => {
    // Hide the win window
    document.getElementById("winWindow").style.display = "none";
    resetGame();
});

function resetGame() {
    // Reset the game state
    inputWord = "";
    fetchRandomWord();
    play = true;
    inputDiv.innerHTML = '<span class="letterBox"></span>'.repeat(4);
    prevGuessesDiv.innerHTML = "";
    prevGuessesDiv.style.display = "none";
}





