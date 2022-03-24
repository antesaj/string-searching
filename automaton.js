class ACNode {
    constructor(data = null, parent = null, isWordNode = false) {
        this.data = data;
        this.fullString = null;
        this.parent = parent;
        this.children = []
        this.failureLink = null;
        this.suffixLink = null;
        this.isWordNode = isWordNode;
    }

    hasChild(data) {
        let result = false;
        this.getChildren().forEach(child => {
            if (child.data === data) {
                result = true;
            }
        });
        return result;
    }

    getChild(data) {
        // TODO: Handle failure to find
        return this.getChildren().find(child => child.data == data);
    }

    getChildren() {
        return this.children;
    }

    getParent() {
        return this.parent;
    }

    setFullString(value) {
        this.fullString = value;
    }

    getFullString() {
        return this.fullString;
    }

    setSuffixLink(node) {
        this.suffixLink = node;
    }

    getSuffixLink() {
        return this.suffixLink;
    }

    getData() {
        return this.data;
    }

    getFailureLink() {
        return this.failureLink;
    }

    setFailureLink(targetNode) {
        this.failureLink = targetNode;
    }

    setIsWordNode() {
        this.isWordNode = true;
    }

    addChild(data, isWordNode = false, isFirstChar = false) {
        let fullString = this.fullString + data;
        let child = new ACNode(data, this, isWordNode);
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
    constructor(wordList) {
        this.root = Automaton.buildTrie(new ACNode(""), wordList);
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
     * @returns root node of the built trie 
     */
    static buildTrie(root, wordList) {
        root.setFullString("");
        let curr = root;
        wordList.forEach(word => {
            let isWordNode = false;
            let isFirstChar = false;
            for (let i = 0; i < word.length; i++) {
                let char = word[i];
                isWordNode = (i === word.length - 1);
                isFirstChar = (i === 0);
                if (!curr.hasChild(char)) {
                    let newChild = curr.addChild(char, isWordNode, isFirstChar);
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
        let queue = [root];
        while (queue.length > 0) {
            let curr = queue.shift();
            // Handle setting curr's failure link here
            if (curr.getFailureLink() === null) {
                let node = curr.getParent();
                node = node.getFailureLink();
                let data = curr.getData();
                while (!node.hasChild(data) && node.getParent() !== null) {
                    node = node.getFailureLink();
                }
                if (node.hasChild(data)) {
                    curr.setFailureLink(node.getChild(data));
                } else if (node.getParent() == null) {
                    curr.setFailureLink(node);
                }
            }
            curr.getChildren().forEach(child => {
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
        let queue = [root];
        while (queue.length > 0) {
            let curr = queue.shift();
            let node = curr;
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
            node.getChildren().forEach(child => {
                queue.push(child);
            })
        }
    }

    /**
     * Primary Aho-Corasick search algorithm.
     * 
     * This will check for all dictionary matches within the input string.
     * 
     * @param {*} inputString The string to search for dictionary matches 
     * @returns An array of dictionary matches from the search string
     */
    getMatches(inputString) {
        let curr = this.root;
        let matches = [];
        for (let i = 0; i < inputString.length; i++) {
            let char = inputString[i];
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
                let word = curr.getFullString();
                matches.push(word);
            }
            // Always traverse suffix links
            let temp = curr;
            while (temp.getSuffixLink() !== null) {
                temp = temp.getSuffixLink();
                if (temp.isWordNode) {
                    let word = temp.getFullString();
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
     * @returns list of words with the provided prefix
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

        let result = [];
        let queue = [curr];
        while (queue.length > 0) {
            curr = queue.shift();
            if (curr.isWordNode) {
                result.push(curr.getFullString());
            }
            curr.getChildren().forEach(child => {
                queue.push(child);
            })
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
     * @returns boolean indicating whether word exists or not
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
    Automaton
}