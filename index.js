class ACNode {
    constructor(data = null, parent=null, isWordNode=false) {
        this.data = data;
        this.parent = parent;
        this.children = [] // List of ACNodes
        this.failureLink = null; // Each ACNode should only have one failure link
        this.isWordNode = isWordNode;
    }

    hasChild(data) {
        let result = false;
        this.children.forEach(child => {
            if (child.data === data) {
                result = true;
            }
        });
        return result;
    }

    getChild(data) {
        // TODO: Handle failure to find
        return this.children.find(child => child.data == data);
    }

    getParent() {
        return this.parent;
    }

    getData() {
        return this.data;
    }

    addChild(data, isWordNode=false) {
        let child = new ACNode(data, this, isWordNode);
        this.children.push(child);
        return child;
    }

    printChildren() {
        this.children.forEach(child => {
            console.log(child.data);
        })
    }

}

class ACTrie {
    constructor(wordList) {
        this.root = new ACNode("");
        let curr = this.root;
        wordList.forEach(word => {
            let isWordNode = false;
            for (let i = 0; i < word.length; i++) {
                let char = word[i];
                if (i === word.length - 1) {
                    isWordNode = true;
                }
                if (!curr.hasChild(char)) {
                    let newChild = curr.addChild(char, isWordNode);
                    curr = newChild;
                } else {
                    curr = curr.getChild(char);
                }
            }
            curr = this.root;
        })
    }

    printTree(root) {
        if (root == null) {
            return;
        }
        for (let i = 0; i < root.children.length; i++) {
            console.log(root.children[i].data);
        }
        for (let i = 0; i < root.children.length; i++) {
            this.printTree(root.children[i]);
        }
    }

    printDictionary(root) {
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
            console.log(word);
        }
        for (let i = 0; i < root.children.length; i++) {
            this.printDictionary(root.children[i]);
        }
    }
}

/**
 * If current node children does not have char,
 * Add char to children, advance current to child, move on
 * Else, move on to next letter, advance current
 * to the child
 */


// Testing
let ac = new ACTrie([
    'january', 
    'february', 
    'march', 
    'april', 
    'may', 
    'june', 
    'july', 
    'august', 
    'september',
    'october',
    'november',
    'december'
]);

ac.printDictionary(ac.root);
