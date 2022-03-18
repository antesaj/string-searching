const { ACNode, ACTrie } = require('./index.js');


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
})
