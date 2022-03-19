'use strict';


let inputString = '';
let currentLine = 0;

const fs = require('fs');
fs.readFile('./test2.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err)
        return
    }
    inputString = data;
    inputString = inputString.split('\n');
    main();
})




function readLine() {
    return inputString[currentLine++];
}

class ACNode {
    constructor(data = null, parent = null, isWordNode = false) {
        this.data = data;
        this.fullString = null;
        this.parent = parent;
        this.children = [] // List of ACNodes
        this.failureLink = null; // Each ACNode should only have one failure link
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

    getData() {
        return this.data;
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


class Automaton {
    constructor(wordList) {
        this.root = Automaton.buildTree(new ACNode(""), wordList);
        this.root.setFailureLink(this.root); // Root failure link should be itself
        Automaton.buildFailureLinks(this.root);
        Automaton.buildSuffixLinks(this.root);
    }

    static buildTree(root, wordList) {
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

    static buildFailureLinks(root) {
        let queue = [root];
        while (queue.length > 0) {
            let curr = queue.shift();
            // Handle setting curr's failure link here
            if (curr.getFailureLink() == null) {
                let node = curr.getParent();
                node = node.getFailureLink();
                let data = curr.getData();
                while (!node.hasChild(data) && node.getParent() != null) {
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

    getWordFromCurrentNode(currentNode) {
        let tracer = currentNode;
        let word = "";
        while (tracer.getParent() != null) {
            word = tracer.getData() + word;
            tracer = tracer.getParent();
        }
        return word;
    }

    getScore(inputString, scoreDict) {
        let score = 0;
        let curr = this.root;
        for (let i = 0; i < inputString.length; i++) {
            let char = inputString[i];
            if (curr.hasChild(char)) {
                curr = curr.getChild(char);
            } else {
                while (!curr.hasChild(char) && curr.getParent() !== null) {
                    curr = curr.getFailureLink();
                    if (curr.isWordNode) {
                        let word = curr.getFullString();
                        if (scoreDict[word]) {
                            score += scoreDict[word];
                        }
                        let temp = curr;
                        while (temp.getSuffixLink() !== null) {
                            temp = temp.getSuffixLink();
                            if (temp.isWordNode) {
                                word = temp.getFullString();
                                if (scoreDict[word]) {
                                    score += scoreDict[word];
                                }
                            }
                        }

                    }
                }
                if (curr.getParent() == null && curr.hasChild(char)) {
                    // is root and root has child
                    curr = curr.getChild(char);
                } else if (curr.hasChild(char)) {
                    // is not root but has child
                    curr = curr.getChild(char);
                }
            }
            if (curr.isWordNode) {
                // Emit word
                let word = curr.getFullString();
                if (scoreDict[word]) {
                    score += scoreDict[word];
                }
                let temp = curr;
                while (temp.getSuffixLink() !== null) {
                    temp = temp.getSuffixLink();
                    if (temp.isWordNode) {
                        word = temp.getFullString();
                        if (scoreDict[word]) {
                            score += scoreDict[word];
                        }
                    }
                }
            }

        }
        return score;
    }

}


function main() {
    const n = parseInt(readLine().trim(), 10);
    const genes = readLine().replace(/\s+$/g, '').split(' ');
    const health = readLine().replace(/\s+$/g, '').split(' ').map(healthTemp => parseInt(healthTemp, 10));
    const s = parseInt(readLine().trim(), 10);

    let min = Number.MAX_VALUE
    let max = 0
    let ac = new Automaton(genes);
    for (let sItr = 0; sItr < s; sItr++) {
        const firstMultipleInput = readLine().replace(/\s+$/g, '').split(' ');
        const first = parseInt(firstMultipleInput[0], 10);
        const last = parseInt(firstMultipleInput[1], 10);
        const d = firstMultipleInput[2];
        let scoreDict = {};
        for (let i = first; i < last + 1; i++) {
            scoreDict[genes[i]] = scoreDict[genes[i]] ? scoreDict[genes[i]] + health[i] : health[i];
        }
        //let wordList = genes.slice(first, last+1);

        let score = ac.getScore(d, scoreDict);
        if (score >= max) {
            max = score
        }
        if (score <= min) {
            min = score
        }
    }
    console.log(min, max);
}
