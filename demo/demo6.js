require('source-map-support').install();
const { createHash } = require('crypto');
const { createTree } = require('../lib/index');
const treeify = require('./lib/treeify');

const tree = createTree(() => createHash('sha256'));

tree.insert(1n, Buffer.from('a'));
tree.insert(4n, Buffer.from('b'));
tree.insert(3n, Buffer.from('c'));
tree.insert(5n, Buffer.from('d'));

console.log(treeify.asTree(tree.getRoot(), true));
console.log(tree.membershipProof(2n).map((n) => {
		const a = n[0] instanceof Buffer ? n[0].toString('base64') : n[0];
		const b = n[1] instanceof Buffer ? n[1].toString('base64') : n[1];

		return [a, b];
	})
);
