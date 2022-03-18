const { ACNode, Automaton } = require('./index.js');

/* ACNode Testing */

test('ACNode defaults parent to null', () => {
    const node = new ACNode();
    expect(node.getParent()).toBeNull();
});

test('ACNode defaults data to null', () => {
    const node = new ACNode();
    expect(node.getData()).toBeNull();
});

test('ACNode defaults failureLink to null', () => {
    const node = new ACNode();
    expect(node.getFailureLink()).toBeNull();
});

test('ACNode starts with no children nodes', () => {
    const node = new ACNode();
    expect(node.getChildren()).toEqual([]);
});

test('addChild adds correct child', () => {
    const parent = new ACNode();
    const newChild = parent.addChild('a');
    expect(parent.getChildren().length).toBe(1);
    const child = parent.getChildren()[0];
    expect(child).toEqual(newChild);
});

test('ACNode parent is set correctly when using addChild', () => {
    const parent = new ACNode();
    const child = parent.addChild('a');
    expect(child.getParent()).toEqual(parent);
});


/* Automaton Testing */
test('ACTree getDictionary returns full set of words', () => {
    const wordList = [
        'this',
        'is',
        'a',
        'test',
        'isnt',
        'it'
    ]
    const trie = new Automaton(wordList);
    const dictionary = trie.getDictionary(trie.root);
    expect(dictionary.length).toBe(wordList.length);
    wordList.forEach(word => {
        expect(dictionary).toContain(word);
    });
});

test('Double entries in dictionary are handled by trie', () => {
    const wordList = [
        'january',
        'january',
        'february',
        'march',
        'april'
    ];
    const trie = new Automaton(wordList);
    const dictionary = trie.getDictionary(trie.root);
    expect(dictionary.length).toBe(wordList.length - 1);
});

test('mergeTrie results in combined dictionary', () => {
    const wordList = ['one', 'two', 'three'];
    const otherList = ['four', 'five'];
    const merged = wordList.concat(otherList);
    const trie = new Automaton(wordList);
    const otherTrie = new Automaton(otherList);
    const mergedTrie = trie.mergeTrie(otherTrie);
    const dictionary = mergedTrie.getDictionary(mergedTrie.root);
    merged.forEach(word => {
        expect(dictionary).toContain(word);
    });
})