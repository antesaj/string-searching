const { ACNode, Automaton } = require('./automaton.js');

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
test('Automaton getDictionary returns full set of words', () => {
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
});

describe('basic dictionary search and structure', () => {
    let ac;
    let testString;

    beforeAll(() => {
        ac = new Automaton(['ACC', 'ATC', 'CAT', 'GCG']);
        testString = "GCATCG";
    })

    test('basic dictionary search yields correct matches', () => {
        const matches = ac.getMatches(testString);
        expect(matches.length).toBe(2);
        expect(matches).toContain("CAT");
        expect(matches).toContain("ATC");
    });

    test('basic dictionary has correct structure', () => {
        expect(ac.root.getFailureLink()).toEqual(ac.root);

        // Root children
        expect(ac.root.getChildren().length).toBe(3);
        ac.root.getChildren().forEach(child => {
            expect(['A', 'C', 'G']).toContain(child.getData());
            expect(child.getFailureLink()).toEqual(ac.root);
        });

        // Root -> A
        let rootChildA = ac.root.getChild('A');
        expect(rootChildA.getChildren().length).toBe(2);
        rootChildA.getChildren().forEach(child => {
            expect(['C', 'T']).toContain(child.getData());
        });

        // Root -> C
        let rootChildC = ac.root.getChild('C');
        expect(rootChildC.getChildren().length).toBe(1);
        rootChildC.getChildren().forEach(child => {
            expect(['A']).toContain(child.getData());
        });

        // Root -> G
        let rootChildG = ac.root.getChild('G');
        expect(rootChildG.getChildren().length).toBe(1);
        rootChildG.getChildren().forEach(child => {
            expect(['C']).toContain(child.getData());
        });

        // Root -> A -> C
        let root_A_C = ac.root.getChild('A').getChild('C');
        expect(root_A_C.getFailureLink()).toEqual(ac.root.getChild('C'));
        expect(root_A_C.getChildren().length).toBe(1);
        root_A_C.getChildren().forEach(child => {
            expect(['C']).toContain(child.getData());
        });

        // Root -> A -> T
        let root_A_T = ac.root.getChild('A').getChild('T');
        expect(root_A_T.getFailureLink()).toEqual(ac.root);
        expect(root_A_T.getChildren().length).toBe(1);
        root_A_T.getChildren().forEach(child => {
            expect(['C']).toContain(child.getData());
        });

        // Root -> C -> A
        let root_C_A = ac.root.getChild('C').getChild('A');
        expect(root_C_A.getFailureLink()).toEqual(ac.root.getChild('A'));
        expect(root_C_A.getChildren().length).toBe(1);
        root_C_A.getChildren().forEach(child => {
            expect(['T']).toContain(child.getData());
        });

        // Root -> G -> C
        let root_G_C = ac.root.getChild('G').getChild('C');
        expect(root_G_C.getFailureLink()).toEqual(ac.root.getChild('C'));
        expect(root_G_C.getChildren().length).toBe(1);
        root_G_C.getChildren().forEach(child => {
            expect(['G']).toContain(child.getData());
        });

        // Root -> A -> C -> C
        let root_A_C_C = ac.root.getChild('A').getChild('C').getChild('C');
        expect(root_A_C_C.isWordNode).toBeTruthy();
        expect(root_A_C_C.getFailureLink()).toEqual(ac.root.getChild('C'));
        expect(root_A_C_C.getChildren().length).toBe(0);

        // Root -> A -> T -> C
        let root_A_T_C = ac.root.getChild('A').getChild('T').getChild('C');
        expect(root_A_T_C.isWordNode).toBeTruthy();
        expect(root_A_T_C.getFailureLink()).toEqual(ac.root.getChild('C'));
        expect(root_A_T_C.getChildren().length).toBe(0);

        // Root -> C -> A -> T
        let root_C_A_T = ac.root.getChild('C').getChild('A').getChild('T');
        expect(root_C_A_T.isWordNode).toBeTruthy();
        expect(root_C_A_T.getFailureLink()).toEqual(ac.root.getChild('A').getChild('T'));
        expect(root_C_A_T.getChildren().length).toBe(0);

        // Root -> G -> C -> G
        let root_G_C_G = ac.root.getChild('G').getChild('C').getChild('G');
        expect(root_G_C_G.isWordNode).toBeTruthy();
        expect(root_G_C_G.getFailureLink()).toEqual(ac.root.getChild('G'));
        expect(root_G_C_G.getChildren().length).toBe(0);
    });
});

describe("dictionary structure edge case one", () => {
    let ac;
    let testString;

    beforeAll(() => {
        ac = new Automaton(['a', 'aa', 'aaa', 'aaaa', 'aaaaa', 'aaaaab']);
        testString = "caaaaab";
    })

    test('basic dictionary search yields correct matches', () => {
        const matches = ac.getMatches(testString);
        expect(matches.length).toBe(16);
    });
});

describe("dictionary structure edge case two", () => {
    let ac;
    let testString;

    beforeAll(() => {
        ac = new Automaton(['andrew', 'and', 'rew']);
        testString = "andrewantes";
    });

    test('basic dictionary search yields correct matches', () => {
        const matches = ac.getMatches(testString);
        expect(matches.length).toBe(3);
    });

    test('case two has correct structure', () => {
        expect(ac.root.getFailureLink()).toEqual(ac.root);
        expect(ac.root.getSuffixLink()).toBeNull();

        // BFS Counting
        let temp = ac.root;
        let queue = [temp];
        let totalFailureLinks = 0;
        let totalSuffixLinks = 0;
        let totalWordNodes = 0;
        let nodeCount = 0;
        while (queue.length > 0) {
            let curr = queue.shift();
            nodeCount++;
            if (curr.isWordNode) {
                totalWordNodes++;
            }
            if (curr.getSuffixLink()) {
                totalSuffixLinks++;
            }
            if (curr.getFailureLink()) {
                totalFailureLinks++;
            }
            curr.getChildren().forEach(child => {
                queue.push(child);
            })
        }
        expect(nodeCount).toBe(10);
        expect(totalFailureLinks).toBe(10);
        expect(totalSuffixLinks).toBe(1);
        expect(totalWordNodes).toBe(3);

        // Root children
        expect(ac.root.getChildren().length).toBe(2);
        ac.root.getChildren().forEach(child => {
            expect(ac.root.getChild('a')).toBeTruthy();
            expect(ac.root.getChild('r')).toBeTruthy();
            ac.root.getChildren().forEach(child => {
                expect(child.getFailureLink()).toEqual(ac.root);
                expect(child.getSuffixLink()).toBeNull();
            });
        });

        // Root -> a
        let root_a = ac.root.getChild('a');
        expect(root_a.getFailureLink()).toEqual(ac.root);
        expect(root_a.getSuffixLink()).toBeNull();
        expect(root_a.getChildren().length).toBe(1);
        expect(root_a.hasChild('n')).toBeTruthy();

        // Root -> a -> n -> d -> r -> e -> w && Root -> r -> e -> w
        let root_andre_w = ac.root.getChild('a')
                                  .getChild('n')
                                  .getChild('d')
                                  .getChild('r')
                                  .getChild('e')
                                  .getChild('w');
        let root_re_w = ac.root.getChild('r').getChild('e').getChild('w');
        expect(root_re_w.getFailureLink()).toEqual(ac.root);
        expect(root_re_w.getSuffixLink()).toBeNull();
        expect(root_andre_w.getFailureLink()).toEqual(root_re_w);
        expect(root_andre_w.getSuffixLink()).toEqual(root_re_w);
    });
});

describe('dictionary structure edge case three', () => {
    // This is an edge case because it requires the suffix traversal
    // portion of the algorithm to be correct, and to be in the correct
    // point in time
    let ac;
    let testString;

    beforeAll(() => {
        ac = new Automaton(['ebullient', 'bull', 'b']);
        testString = "ebull";
    });

    test('yields correct matches', () => {
        const matches = ac.getMatches(testString);
        expect(matches.length).toBe(2);
        expect(matches).toContain('b');
        expect(matches).toContain('bull');
    })
})
