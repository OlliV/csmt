require('source-map-support').install();
const { createHash } = require('crypto');
const { createTree } = require('../lib/index');
const treeify = require('./lib/treeify');

const tree = createTree(() => createHash('sha256'));

tree.insert(1n, Buffer.from('a'));
console.log(treeify.asTree(tree.getRoot(), true));

tree.insert(4n, Buffer.from('b'));
console.log(treeify.asTree(tree.getRoot(), true));

tree.insert(3n, Buffer.from('b'));
console.log(treeify.asTree(tree.getRoot(), true));

tree.insert(5n, Buffer.from('b'));
console.log(treeify.asTree(tree.getRoot(), true));
