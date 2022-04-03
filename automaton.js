/**
* A trie node used for building automatons. Each node
* conveys information about its preceding nodes,
* and whether or not itself represents a full word.
*/
class ACNode {
  /**
     * Builds a node for the automaton trie
     *
     * @param {*} data Should be a single character from a dictionary word
     * @param {ACNode} parent The current node's parent node
     * @param {Boolean} isWordNode whether this represents a full dict word
     */
  constructor(data = null, parent = null, isWordNode = false) {
    this.data = data;
    this.fullString = null;
    this.parent = parent;
    this.children = [];
    this.failureLink = null;
    this.suffixLink = null;
    this.isWordNode = isWordNode;
  }

  /**
   * Returns whether or not the provided node is a child of this node 
   *
   * @param {Character} data the data of the child being searched for 
   * @return {Boolean} whether child exists
   */
  hasChild(data) {
    let result = false;
    this.getChildren().forEach((child) => {
      if (child.data === data) {
        result = true;
      }
    });
    return result;
  }

  /**
   * Retrieves the ACNode child of this ACNode with provided data
   *
   * @param {Character} data which child to get based on character
   * @return {ACNode} the child containing the provided character
   */
  getChild(data) {
    // TODO: Handle failure to find
    return this.getChildren().find((child) => child.data === data);
  }

  /**
   * Retrieves all of this node's children
   *
   * @return {Array<ACNode>} all of this node's children nodes
   */
  getChildren() {
    return this.children;
  }

  /**
   * Retrieves this node's parent node
   *
   * @return {ACNode}
   */
  getParent() {
    return this.parent;
  }

  /**
   * Sets this node's full string value to the provided value
   *
   * @param {String} value what to set this node's full string to
   */
  setFullString(value) {
    this.fullString = value;
  }

  /**
   * Retrieves this node's full string representation, which
   * is based on the values of its parents up to the root
   *
   * @return {String} this node's full string
   */
  getFullString() {
    return this.fullString;
  }

  /**
   * Sets this node's suffix link to the provided node
   *
   * @param {ACNode | null} node target node for the link, if exists
   */
  setSuffixLink(node) {
    this.suffixLink = node;
  }

  /**
   * Retrieves this node's suffix link node, which is not
   * guaranteed to exist
   *
   * @return {ACNode | null} this node's suffix link, if exists
   */
  getSuffixLink() {
    return this.suffixLink;
  }

  /**
   * Retrieves this node's stored character
   *
   * @return {Character} this node's character
   */
  getData() {
    return this.data;
  }

  /**
   * Retrieves this node's failure link node, if exists
   *
   * @return {ACNode | null}
   */
  getFailureLink() {
    return this.failureLink;
  }

  /**
   * Sets this node's failure link, if any
   *
   * @param {ACNode | null} targetNode the node to set this node's failure to
   */
  setFailureLink(targetNode) {
    this.failureLink = targetNode;
  }

  /**
   * Sets this node as a word node, meaning it and it's ancestors represent
   * a full word in the dictionary
   */
  setIsWordNode() {
    this.isWordNode = true;
  }

  /**
   * Adds a node to this node's set of children. Children will
   * maintain awareness of their parent.
   *
   * @param {*} data
   * @param {*} isWordNode
   * @param {*} isFirstChar
   * @return {ACNode} the created child node
   */
  addChild(data, isWordNode = false, isFirstChar = false) {
    const fullString = this.fullString + data;
    const child = new ACNode(data, this, isWordNode);
    child.setFullString(fullString);
    // Every first prefix character failure-links back to root
    if (isFirstChar) {
      child.setFailureLink(this);
    }
    this.getChildren().push(child);
    return child;
  }
}

/**
 * This class is used to build an Aho-Corasick automaton data structure
 * that can be used for implementing the Aho-Corasick matching algorithm
 * as well as other related uses.
 */
class Automaton {
  /**
     * Takes a list of words and builds an automaton from them
     *
     * @param {*} wordList words used to build automaton
     */
  constructor(wordList) {
    this.root = Automaton.buildTrie(new ACNode(''), wordList);
    this.root.setFailureLink(this.root); // Root failure link should be itself

    // Order of these two calls matters, suffix links depend on failure links
    // Might be possible to build suffix links during failure links, because
    // they always point up.
    Automaton.buildFailureLinks(this.root);
    Automaton.buildSuffixLinks(this.root);
  }

  /**
     * Builds the trie using the list of words.
     *
     * Words with a common prefix will be on the same path until
     * their suffixes diverge.
     *
     * Each node is marked with information about whether it represents
     * a word in the dictionary, as well as the entire prefix to that
     * point in the trie.
     *
     * @param {*} root root ACNode from which to start building the trie
     * @param {*} wordList the list of words used to build the trie
     * @return {ACNode} root node of the built trie
     */
  static buildTrie(root, wordList) {
    root.setFullString('');
    let curr = root;
    wordList.forEach((word) => {
      let isWordNode = false;
      let isFirstChar = false;
      for (let i = 0; i < word.length; i++) {
        const char = word[i];
        isWordNode = (i === word.length - 1);
        isFirstChar = (i === 0);
        if (!curr.hasChild(char)) {
          const newChild = curr.addChild(char, isWordNode, isFirstChar);
          curr = newChild;
        } else {
          curr = curr.getChild(char);
          if (isWordNode) {
            curr.setIsWordNode();
          }
        }
      }
      curr = root;
    });
    return root;
  }

  /**
     * This takes a constructed trie and builds links between nodes
     * that are used when Aho-Corasick encounters a character not
     * in its current path in the trie.
     *
     * The links help the algorithm transition states efficiently.
     *
     * @param {*} root ACNode to start building from
     */
  static buildFailureLinks(root) {
    const queue = [root];
    while (queue.length > 0) {
      const curr = queue.shift();
      // Handle setting curr's failure link here
      if (curr.getFailureLink() === null) {
        let node = curr.getParent();
        node = node.getFailureLink();
        const data = curr.getData();
        while (!node.hasChild(data) && node.getParent() !== null) {
          node = node.getFailureLink();
        }
        if (node.hasChild(data)) {
          curr.setFailureLink(node.getChild(data));
        } else if (node.getParent() == null) {
          curr.setFailureLink(node);
        }
      }
      curr.getChildren().forEach((child) => {
        queue.push(child);
      });
    }
  }

  /**
     * Takes a constructed trie with failure links already built and
     * adds the necessary suffix links needed by the Aho-Corasick matching
     * algorithm.
     *
     * Suffix links are used to find matches that are contained within other
     * matches. An example is 'ebullient'. When this word is found,
     * suffix links will lead the algorithm to also find 'bull'.
     *
     * @param {*} root ACNode to start building from
     */
  static buildSuffixLinks(root) {
    const queue = [root];
    while (queue.length > 0) {
      let curr = queue.shift();
      const node = curr;
      if (curr.getParent() !== null && curr.getParent().getParent() !== null) {
        // Follow blue arcs until hitting a dictionary node
        curr = curr.getFailureLink();
        while (!curr.isWordNode && curr.getParent() !== null) {
          curr = curr.getFailureLink();
        }
        if (curr.isWordNode) {
          node.setSuffixLink(curr);
        }
      }
      node.getChildren().forEach((child) => {
        queue.push(child);
      });
    }
  }

  /**
     * Primary Aho-Corasick search algorithm.
     *
     * This will check for all dictionary matches within the input string.
     *
     * @param {*} inputString The string to search for dictionary matches
     * @return {Array} An array of dictionary matches from the search string
     */
  getMatches(inputString) {
    let curr = this.root;
    const matches = [];
    for (let i = 0; i < inputString.length; i++) {
      const char = inputString[i];
      if (curr.hasChild(char)) {
        curr = curr.getChild(char);
      } else {
        while (!curr.hasChild(char) && curr.getParent() !== null) {
          curr = curr.getFailureLink();
        }
        if (curr.hasChild(char)) {
          curr = curr.getChild(char);
        }
      }
      if (curr.isWordNode) {
        // Emit word(s)
        const word = curr.getFullString();
        matches.push(word);
      }
      // Always traverse suffix links
      let temp = curr;
      while (temp.getSuffixLink() !== null) {
        temp = temp.getSuffixLink();
        if (temp.isWordNode) {
          const word = temp.getFullString();
          matches.push(word);
        }
      }
    }
    return matches;
  }

  /**
     * This is an auxiliary method to find all words in the dictionary
     * with a common prefix to the provided input.
     *
     * Example: an input "plan" will result in "planned", "planning", etc.
     *
     * The algorithm first traverses the trie path of the prefix, then
     * does a BFS on the remaining sub-trie to find all suffixes of that prefix.
     *
     * @param {*} prefix the input to check
     * @return {Array} list of words with the provided prefix
     */
  getEntriesWithCommonPrefix(prefix) {
    let curr = this.root;
    for (let i = 0; i < prefix.length; i++) {
      if (curr.hasChild(prefix[i])) {
        curr = curr.getChild(prefix[i]);
      } else {
        return [];
      }
    }

    const result = [];
    const queue = [curr];
    while (queue.length > 0) {
      curr = queue.shift();
      if (curr.isWordNode) {
        result.push(curr.getFullString());
      }
      curr.getChildren().forEach((child) => {
        queue.push(child);
      });
    }
    return result;
  }

  /**
     * This auxiliary method will tell whether a specific word
     * is in the dictionary.
     *
     * It is very fast because instead of traversing the entire word
     * list, a single trie path is traversed.
     *
     * @param {*} entry the word to check the dictionary for
     * @return {Boolean} boolean indicating whether word exists or not
     */
  containsUniqueEntry(entry) {
    let foundWord = true;
    let curr = this.root;
    for (let i = 0; i < entry.length; i++) {
      if (curr.hasChild(entry[i])) {
        curr = curr.getChild(entry[i]);
      } else {
        foundWord = false;
      }
    }
    if (!curr.isWordNode) {
      foundWord = false;
    }
    return foundWord;
  }
}

module.exports = {
  ACNode,
  Automaton,
};
