// The below section grabs a random 4 letter word from four-letter words and displays it with letter boxes. https://github.com/getify/dwordly-game/blob/main/four-letter-words.json
const wordElement = document.getElementById("word");

let word = "";
// Fetch a random word from words.txt and display it with letter boxes
    fetch('four-letter-words.json')
        .then(response => response.json())
        .then(words => {
            //select random word from the list, log it to the console
            word = words[Math.floor(Math.random() * words.length)].trim();
            console.log("Selected word:", word);
            //create letter boxes for the selected word
            // wordBoxes = word.split('').map(letter => `<span class="letter-box">${letter}</span>`).join('');
            // wordElement.innerHTML = wordBoxes;
        })
        .catch(error => console.error('Error fetching words:', error));


// The below section scrambles the keyboard inputs 
const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
let keyboardMap = {};

function keyboardScrambleMap(key = "") {
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

keyboardScrambleMap();



// The below section handles the keyboard input 
const inputDiv = document.getElementById("inputDiv");
let inputWord = "";

const inputBoxes = '<span class="letter-box"></span>'.repeat(4);
inputDiv.innerHTML = inputBoxes;
let play = false;

fetch("four-letter-words.json")
    .then(response => response.json())
    .then(data => {
        fourLetterWords = data;
    })
    .catch(error => console.error('Error fetching four-letter words:', error));


document.addEventListener("keydown", (event) => {
    const mappedKey = keyboardScrambleMap(event.key);
    const key = mappedKey.toLowerCase();

    //All keyboard inputs are handled within this loop
    while (play === true) { 
        // Character input handling
        if (key.length === 1 && /[a-z]/.test(key)) {
            inputWord = inputWord.substring(0, inputBoxes.length - 1) + key;
            const updatedBoxes = inputWord.split('').map(letter => `<span class="letter-box">${letter}</span>`).join('');
            inputDiv.innerHTML = updatedBoxes;
        }
        // Backspace handling
        else if (key === "backspace") { 
            inputWord = inputWord.substring(0, inputWord.length - 1);
            const updatedBoxes = inputWord.split('').map(letter => `<span class="letter-box">${letter}</span>`).join('');
            inputDiv.innerHTML = updatedBoxes;
        } 
        // Enter key handling
        else if (key === "enter") { 
            if (inputWord.length === 4) { // Check if input is 4 letters and a word in the four-letter-words.json
                if (fourLetterWords.includes(inputWord.toUpperCase())) {
                    moveToNextWord();
                } else {
                    alert("Not a valid four-letter word!");
                    return;
                }
            }
        }
        // Fill the remaining boxes with empty letter boxes
        if (inputWord.length < 4) {
            const emptyBoxes = Array(4 - inputWord.length).fill('<span class="letter-box"style="color: #333333;">.</span>').join('');
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

// The below section moves the current input word to the previous guesses and adds colours based on how closely it matches the target word
const prevGuessesDiv = document.getElementById("prevGuesses");
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
    prevGuessesDiv.innerHTML += `<div class="prev-guess">${inputDiv.innerHTML}</div>`;

    //make each letter that matches the target word green
    const prevGuessBoxes = prevGuessesDiv.lastElementChild.querySelectorAll(".letter-box");
    prevGuessBoxes.forEach((box, index) => {
        if (box.textContent.toUpperCase() === word[index]) {
            box.style.backgroundColor = "#076a07";
        }
        //make each letter that exists in the target word but in the wrong position yellow
        else if (word.includes(box.textContent.toUpperCase())) {
            box.style.backgroundColor = "#6a6a07";
        }
    });

    // Check if the input word matches the target word
    if (inputWord === word) {
        // If the input word matches the target word, stop the game
        play = false;
        // Delete the inputDiv content
        inputDiv.innerHTML = "";
        
    }
    else {
        // Reset the input word and inputDiv for the next attempt
        inputWord = "";
        inputDiv.innerHTML = '<span class="letter-box"></span>'.repeat(4);
        //scroll to the inputDiv
        inputDiv.scrollIntoView({ behavior: "smooth" });
    }
}




