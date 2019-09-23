Compact Sparse Merkle Tree
==========================

This is a merkle tree implementation loosely based on the
[paper](https://eprint.iacr.org/2018/955.pdf) authored by
Faraz Haider describing a Compact Sparse Merkle Tree tree.

Usage
-----

```js
const { createHash } = require('crypto');
const { createTree } = require('./lib/index');

const tree = createTree(() => createHash('sha256'));

tree.insert(1n, Buffer.from('a'));
tree.insert(2n, Buffer.from('a'));
tree.insert(3n, Buffer.from('a'));
tree.insert(4n, Buffer.from('b'));
tree.insert(5n, Buffer.from('b'));
```

Results a tree like this:

![Image of a tree](doc/tree.png)
