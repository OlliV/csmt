require('source-map-support').install();
const chalk = require('chalk');
const { createHash } = require('crypto');
const { createTree, drawDot } = require('../lib/index');

const tree = createTree(() => createHash('sha256'));
tree.insert(1n, Buffer.from('a'));
tree.insert(4n, Buffer.from('b'));
tree.insert(3n, Buffer.from('b'));
tree.insert(5n, Buffer.from('c'));
tree.insert(2n, Buffer.from('b'));

console.error(chalk.red('Initial state:'));
console.log(drawDot(tree));

tree.delete(1n);

console.error(chalk.red('\nAfter deleting k=1:'));
console.log(drawDot(tree));
