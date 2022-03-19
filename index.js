class ACNode {
    constructor(data=null, parent=null, isWordNode=false) {
        this.data = data;
        this.fullString = null;
        this.parent = parent;
        this.children = [] // List of ACNodes
        this.failureLink = null; // Each ACNode should only have one failure link
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

    addChild(data, isWordNode=false, isFirstChar=false) {
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

    printChildren() {
        this.getChildren().forEach(child => {
            console.log(child.data);
        })
    }

}


class Automaton {
    constructor(wordList) {
        this.root = Automaton.buildTree(new ACNode(""), wordList);
        this.root.setFailureLink(this.root); // Root failure link should be itself
        Automaton.buildFailureLinks(this.root);
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

    /**
     * Failure Links
     * 
     * All first children of root automatically have theirs set to root
     * Root failure link is itself
     * 
     * BFS trie
     * if current node doesn't have failure link
     * get current's parent's failureLink
     * if parent's failureLink has current's suffix as a child, set target to that child
     * otherwise, follow parents failureLink's failureLink
     * repeat until root is reached, if root children doesnt contain suffix, set target to root
     */
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

    mergeTrie(trie) {
        const newDict = trie.getDictionary(trie.root);
        Automaton.buildTree(this.root, newDict);
        return this;
    }

    printTree(root) {
        if (root == null) {
            return;
        }
        for (let i = 0; i < root.getChildren().length; i++) {
            console.log(root.getChildren()[i].data);
        }
        for (let i = 0; i < root.getChildren().length; i++) {
            this.printTree(root.getChildren()[i]);
        }
    }

    printDictionary() {
        const dict = this.getDictionary(this.root);
        dict.forEach(word => {
            console.log(word);
        });
    }

    getDictionary(root, result=[]) {
        if (root == null) {
            return;
        }
        if (root.isWordNode) {
            let word = "";
            let curr = root;
            while (curr.getParent() != null) {
                word = curr.getData() + word;
                curr = curr.getParent();
            }
            result.push(word);
        }
        for (let i = 0; i < root.getChildren().length; i++) {
            this.getDictionary(root.getChildren()[i], result);
        }
        return result;
    }

    getMatches(inputString) {
        // TODO: Cleanup this function
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
                        console.log(`Found word: ${word}`);
                    }
                }
                if (curr.hasChild(char)) {
                    curr = curr.getChild(char);
                }
            }
            if (curr.isWordNode) {
                // Emit word
                let word = curr.getFullString();
                console.log(`Found word: ${word}`);
            }
            
        }
    }
    
}

// Testing
let ac = new Automaton(['ACC', 'ATC', 'CAT', 'GCG', 'JDF']);
let testString = "GCATCGACCJKFJDLFHSJDHFSDFJDFCATGCGACCJKJFDJJFACCAT";
// let ac = new Automaton(['andrew', 'and', 'rew']);
// let ac = new Automaton(['and', 'rew', 'andrew', 'a', 'an', 'andr', 'drew', 'ndrew']);
// let testString = "andrewantes"
ac.getMatches(testString);


module.exports = {
    ACNode,
    Automaton
}