const { ACNode, ACTrie } = require('./index.js');

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


/* ACTrie Testing */
