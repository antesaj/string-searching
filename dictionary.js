const wordListPath = require('word-list');
const {Automaton} = require('./automaton.js');


/**
 * Wraps Automaton to provide higher-level methods for
 * searching for words in a dictionary
 */
class Dictionary {
  /**
     * Creates a Dictionary object using provided word list, but
     * will default to word-list package if none provided.
     *
     * @param {*} wordFile file containing the words for the dictionary
     */
  constructor(wordFile = wordListPath) {
    this.dict = null;
    this.wordFile = wordFile;
  }

  /**
   * Builds the automaton using the Dictionary wordlist
   */
  init() {
    const fs = require('fs');
    const wordList = fs.readFileSync(this.wordFile, 'utf8').split('\n');
    this.dict = new Automaton(wordList);
  }

  /**
   * Checks dictionary for this entry. Much faster than
   * iterating entire word list.
   *
   * @param {String} word word to check dictionary for
   * @return {Boolean} Whether the word was found or not
   */
  foundWord(word) {
    const hasWord = this.dict.containsUniqueEntry(word);
    return hasWord;
  }

  /**
   * Gets all matches from the dictionary that this word
   * contains, including itself.
   *
   * @param {String} word Word to search for in the dictionary
   * @return {Array<String>} all of the matches
   */
  getAllMatches(word) {
    const matches = this.dict.getMatches(word);
    return matches;
  }

  /**
   * Gets all words from the dictionary that have the provided
   * word as a prefix.
   *
   * TODO: This can be extended to take the length of the prefix desired
   * @param {String} word Word to check for
   * @return {Array<String>} all dictionary entries with common prefix
   */
  getSimilarMatches(word) {
    const similarMatches = this.dict.getEntriesWithCommonPrefix(word);
    return similarMatches;
  }
}

module.exports = {
  Dictionary,
};
