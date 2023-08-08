console.log("App")

window.onload = () => {
    new Vue({
        el: "#app",
        data() {
            return {
                passwordList: [],
                passwordLength: 40,
                includeSymbolsFlag: true,
                symbolsList: "+ - = # $ & % ! @ ; [ ]"
            }
        },

        created: function () {
            this.recreateList();
        },

        methods: {
            recreateList() {
                const symbols = this.symbolsList.replace(/ /ig, '');
                this.passwordList = [];
                let count = 1;
                do {
                    let random = this.generatePassword(this.passwordLength, symbols, this.includeSymbolsFlag);
                    this.passwordList.push(random);
                    count++;
                } while (count <= 15);

            },

            generatePassword(length, customSymbols, includeSymbols) {
                const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
                const numberChars = "0123456789";
                // const defaultSymbols = "!@#$%^&*()-_=+[]{}|;:,.<>?";
            
                let alphabetsOnly = "";
                alphabetsOnly += uppercaseChars;
                alphabetsOnly += lowercaseChars;

                let allCharacters = "";
                allCharacters += uppercaseChars;
                allCharacters += lowercaseChars;
                allCharacters += numberChars;
                if (includeSymbols) allCharacters += customSymbols;
            
                const boundary = 5; // first # letters are alphabets only
                let password = "";
                let lastRandom = { index: -1 }; // create object to pass by reference

                for (let i = 0; i < boundary; i++) {
                    password += this.getRandomLetter(alphabetsOnly, lastRandom);
                }
                
                for (let i = boundary; i < length; i++) {
                    password += this.getRandomLetter(allCharacters, lastRandom);
                }
            
                return password;
            },

            getRandomLetter(charactersList, lastRandom) {
                // Ensure that random index is not the same as generated previously.
                let randomIndex = -1;
                do {
                    randomIndex = this.getRandomInt(0, charactersList.length - 1);
                    // if (lastRandom.index == randomIndex) 
                    //      console.log("randomIndex", lastRandom.index == randomIndex, randomIndex, lastRandom.index);
                } while (lastRandom.index > -1 && lastRandom.index == randomIndex);

                lastRandom.index = randomIndex;
                return charactersList.charAt(randomIndex);
            },

            getRandomInt(min, max) {
                const randomBuffer = new Uint32Array(1);
                window.crypto.getRandomValues(randomBuffer);
            
                const randomNumber = randomBuffer[0] / (0xffffffff + 1);
            
                min = Math.ceil(min);
                max = Math.floor(max);
                return Math.floor(randomNumber * (max - min + 1)) + min;
            }
        }
    });
};
