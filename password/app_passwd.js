console.log("App")

window.onload = () => {
    new Vue({
        el: "#app",
        data() {
            return {
                passwordList: "",
                passwordLength: 35,
                includeSymbolsFlag: true,
                symbolsList: "- = # $ & % ! @"
            }
        },

        created: function () {
            this.recreateList();
        },

        methods: {
            recreateList() {
                let count = 1;
                let list = "";
                let symbols = this.symbolsList.replace(/ /ig, '');
                do {
                    let random = this.generatePassword(this.passwordLength, symbols, this.includeSymbolsFlag);
                    list += random + "\r\n";
                    count++;
                } while (count <= 10);

                this.passwordList = list;

            },

            generatePassword(length, customSymbols, includeSymbols) {
                let uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                let lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
                let numberChars = "0123456789";
                // let defaultSymbols = "!@#$%^&*()-_=+[]{}|;:,.<>?";
            
                let characters = "";
                characters += uppercaseChars;
                characters += lowercaseChars;
                characters += numberChars;
                if (includeSymbols) characters += customSymbols;
            
                let password = "";
                for (let i = 0; i < length; i++) {
                    const randomIndex = this.getRandomInt(0, characters.length - 1);
                    password += characters.charAt(randomIndex);
                }
            
                return password;
            },

            getRandomInt(min, max) {
                const randomBuffer = new Uint32Array(1);
                window.crypto.getRandomValues(randomBuffer);
            
                let randomNumber = randomBuffer[0] / (0xffffffff + 1);
            
                min = Math.ceil(min);
                max = Math.floor(max);
                return Math.floor(randomNumber * (max - min + 1)) + min;
            }
        }
    });
};
