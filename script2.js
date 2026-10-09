//https://www.geeksforgeeks.org/html/build-a-virtual-keyboard-using-html-css-javascript/ modified by copilot
const VirtualKeyboard = {
	discoveredMap: {},
	labelByKey: {},

	rows: [
		["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
		["a", "s", "d", "f", "g", "h", "j", "k", "l"],
		["z", "x", "c", "v", "b", "n", "m"],
		["enter", "backspace"],
	],

	init() {
		const container = document.createElement("div");
		container.id = "scrambledKeyboard";

		const keyboard = document.createElement("div");
		keyboard.id = "keyboard";
		container.appendChild(keyboard);

		this.rows.forEach((row, rowIndex) => {
			const rowElement = document.createElement("ul");
			rowElement.classList.add("cf");
			rowElement.id = rowIndex === 0 ? "qwerty" : rowIndex === 1 ? "asdfg" : "zxcvb";

			row.forEach((key) => {
				const li = document.createElement("li");
				const keyButton = document.createElement("button");

				keyButton.type = "button";
				keyButton.classList.add("key");

				const label = document.createElement("span");

				if (key === "enter" || key === "backspace") {
					keyButton.dataset.key = key;
					keyButton.id = key;
					label.textContent = key;
					keyButton.classList.add("fn");
				} else {
					keyButton.id = key;
					label.textContent = key;
					this.labelByKey[key] = label;
				}

				keyButton.appendChild(label);

				keyButton.addEventListener("click", () => {
					const eventKey = key === "enter" ? "Enter" : key === "backspace" ? "Backspace" : key;
					document.dispatchEvent(
						new KeyboardEvent("keydown", {
							key: eventKey,
							bubbles: true,
						})
					);

					setTimeout(() => {
						document.dispatchEvent(
							new KeyboardEvent("keyup", {
								key: eventKey,
								bubbles: true,
							})
						);
					}, 60);
				});

				li.appendChild(keyButton);
				rowElement.appendChild(li);
			});

			keyboard.appendChild(rowElement);
		});

		document.body.appendChild(container);
		this.bindPressedState();
	},

	bindPressedState() {
		document.addEventListener("keydown", (event) => {
			const key = event.key.toLowerCase();
			const keyButton = document.getElementById(key);
			if (keyButton) {
				keyButton.classList.add("keydown");
			}
		});

		document.addEventListener("keyup", (event) => {
			const key = event.key.toLowerCase();
			const keyButton = document.getElementById(key);
			if (keyButton) {
				keyButton.classList.remove("keydown");
			}
		});

		document.addEventListener("guessSubmitted", (event) => {
			const guess = event?.detail?.guess;
			this.revealSubmittedGuess(guess);
		});
	},

	revealSubmittedGuess(guess) {
		if (typeof guess !== "string" || guess.length === 0) {
			return;
		}

		const guessLetters = [...new Set(guess.toLowerCase().split(""))].filter((letter) => /^[a-z]$/.test(letter));
		const map = typeof keyboardScrambleMap === "function" ? keyboardScrambleMap() : null;

		if (!map) {
			return;
		}

		guessLetters.forEach((scrambledLetter) => {
			const physicalKey = this.getPhysicalKeyForScrambledLetter(scrambledLetter, map);
			if (physicalKey) {
				this.revealMapping(physicalKey, scrambledLetter);
			}
		});
	},

	getPhysicalKeyForScrambledLetter(scrambledLetter, map) {
		for (const [physicalKey, mappedKey] of Object.entries(map)) {
			if (!/^[a-z]$/.test(physicalKey)) {
				continue;
			}

			if (mappedKey.toLowerCase() === scrambledLetter) {
				return physicalKey;
			}
		}

		return null;
	},

	revealMapping(physicalKey, mappedKey) {
		if (!/^[a-z]$/.test(physicalKey)) {
			return;
		}

		const normalizedMappedKey = mappedKey.toLowerCase();
		if (!/^[a-z]$/.test(normalizedMappedKey)) {
			return;
		}

		if (this.discoveredMap[physicalKey] === normalizedMappedKey) {
			return;
		}

		this.discoveredMap[physicalKey] = normalizedMappedKey;
		const label = this.labelByKey[physicalKey];
		const keyButton = document.getElementById(physicalKey);

		if (label) {
			label.textContent = normalizedMappedKey;
		}

		if (keyButton) {
			keyButton.classList.add("key--discovered", "key--reveal");
			setTimeout(() => {
				keyButton.classList.remove("key--reveal");
			}, 260);
		}
	},
};

const yesBtn = document.getElementById("enableHintKeyboard");
const noBtn = document.getElementById("disableHintKeyboard");
const gameWindow = document.getElementById("gameWindow");
const popupWindow = document.getElementById("popupWindow");

yesBtn.addEventListener("click", () => {
    VirtualKeyboard.init();
    popupWindow.style.display = "none";
    gameWindow.style.display = "inline-block";
	play = true;
});

noBtn.addEventListener("click", () => {
    popupWindow.style.display = "none";
	play = true;
    gameWindow.style.display = "inline-block";
	play = true;
});

