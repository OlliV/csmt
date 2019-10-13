require('source-map-support').install();
const chalk = require('chalk');
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

console.error(chalk.red('Tree1:'));
console.log(drawDot(tree1));

console.error(chalk.red('\nTree2:'));
console.log(drawDot(tree2));

console.error(chalk.red('\nDiff between the trees:'));
console.log(tree1.diff(tree2));
