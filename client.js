const { Dictionary } = require('./dictionary.js');
const fs = require('fs');

const dict = new Dictionary();
dict.init();

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});


let recursiveReadline = function () {
    readline.question("\nWhat is your word? ", word => {
        if (word == "q") {
            return readline.close();
        }
        if (dict.foundWord(word)) {
            console.log(`\nFound word ${word}\n`);
        } else {
            console.log(`\n${word} is not in the dictionary\n`);
        }

        const similarEntries = dict.getSimilarMatches(word);
        similarEntries.forEach(entry => {
            console.log(`Similar word: ${entry}`);
        })

        const matchSet = new Set(dict.getAllMatches(word))
        matchSet.forEach(result => {
            console.log(`Substring word: ${result}`);
        });
        recursiveReadline();
    });
}

recursiveReadline();


// dict.getAllMatches('ann').forEach(match => {
//     console.log(match)
// })