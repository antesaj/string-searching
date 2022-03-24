const wordListPath = require('word-list');
const { Automaton } = require('./automaton.js');


class Dictionary {
    constructor(wordFile = wordListPath) {
        this.dict = null;
        this.wordFile = wordFile;
    }

    init() {
        const fs = require('fs');
        var wordList = fs.readFileSync(this.wordFile, 'utf8').split("\n");
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

    getSimilarMatches(word) {
        const similarMatches = this.dict.getEntriesWithCommonPrefix(word);
        return similarMatches;
    }
}

module.exports = {
    Dictionary
}