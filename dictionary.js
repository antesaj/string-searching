const { Automaton } = require('./automaton.js');
const fs = require('fs');

class Dictionary {
    constructor(wordFile = "./words.txt") {
        this.wordFile = wordFile;
        this.dict = null;
    }

    async init() {
        var fs = require('fs');
        var wordList = fs.readFileSync(this.wordFile).toString().split("\n");
        this.dict = new Automaton(wordList)
    }

    foundWord(word) {
        const hasWord = this.dict.containsUniqueEntry(word);
        return hasWord;
    }

    getAllMatches(word) {
        const matches = this.dict.getMatches(word);
        return matches;
    }
}

module.exports = {
    Dictionary
}