require('source-map-support').install();
const { createHash } = require('crypto');
const { createTree, drawDot } = require('../lib/index');

const tree1 = createTree(() => createHash('sha256'));
const tree2 = createTree(() => createHash('sha256'));

tree1.insert(1n, Buffer.from('a'));
tree1.insert(4n, Buffer.from('b'));
tree1.insert(3n, Buffer.from('b'));
tree1.insert(5n, Buffer.from('b'));

tree2.insert(1n, Buffer.from('a'));
tree2.insert(4n, Buffer.from('b'));
tree2.insert(3n, Buffer.from('b'));
tree2.insert(5n, Buffer.from('c')); // hash changed
tree2.insert(2n, Buffer.from('b'));
//tree2.insert(7n, Buffer.from('b'));

console.log(`Tree1:\n${drawDot(tree1)}`);
console.log(`Tree2\n${drawDot(tree2)}`);
console.log('Diff between the trees:\n', tree1.diff(tree2));
