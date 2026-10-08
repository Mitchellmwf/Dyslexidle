const VirtualKeyboard = {
	discoveredMap: {},
	labelByKey: {},

	rows: [
		["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
		["a", "s", "d", "f", "g", "h", "j", "k", "l"],
		["enter", "z", "x", "c", "v", "b", "n", "m", "backspace"],
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
			this.revealMapping(key);
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
	},

	revealMapping(physicalKey) {
		if (!/^[a-z]$/.test(physicalKey)) {
			return;
		}

		if (typeof keyboardScrambleMap !== "function") {
			return;
		}

		const mappedKey = keyboardScrambleMap(physicalKey).toLowerCase();
		if (!/^[a-z]$/.test(mappedKey)) {
			return;
		}

		if (this.discoveredMap[physicalKey] === mappedKey) {
			return;
		}

		this.discoveredMap[physicalKey] = mappedKey;
		const label = this.labelByKey[physicalKey];
		const keyButton = document.getElementById(physicalKey);

		if (label) {
			label.textContent = mappedKey;
		}

		if (keyButton) {
			keyButton.classList.add("key--discovered", "key--reveal");
			setTimeout(() => {
				keyButton.classList.remove("key--reveal");
			}, 260);
		}
	},
};

//pop up to ask if the user wants to enable the scrambled keyboard
window.addEventListener("DOMContentLoaded", () => {
    const enableScramble = confirm("Do you want to enable the scrambled keyboard?");
    if (enableScramble) {
        VirtualKeyboard.init();
    }
});
