interface TreeNode {
	hash: Buffer;
	key: bigint;
	left: TreeNode | null;
	right: TreeNode | null;
}

type KeyHashPair = [bigint, Buffer];

interface TreeDiff {
	left: KeyHashPair[];
	right: KeyHashPair[];
}

interface Csmt {
	/**
	 * Get the root node.
	 */
	getRoot: () => TreeNode | null;

	/**
	 * Insert a new key-hash pair.
	 */
	insert: (k: bigint, h: Buffer) => void;

	/**
	 * Delete a key-hash pair from the tree.
	 */
	delete: (k: bigint) => void;

	membershipProof: (k: bigint) => void;

	/**
	 * Compute the diff between this and a given tree.
	 */
	diff: (tree: Csmt) => TreeDiff;
}

function distance(x: bigint, y: bigint): bigint {
	let v = x ^ y;
	let r = 0n;

	while ((v >>= 1n)) {
		r++;
	}

	return r;
}

function min(x: TreeNode | null, y: TreeNode | null) {
	const a = (x && x.key) || 0n;
	const b = (y && y.key) || 0n;

	return a < b ? a : b;
}

function max(x: TreeNode | null, y: TreeNode | null) {
	const a = (x && x.key) || 0n;
	const b = (y && y.key) || 0n;

	return a > b ? a : b;
}

export function createTree(createHash: () => any): Csmt {
	let root: TreeNode | null = null;

	function genHash(s: Buffer) {
		return createHash()
			.update(s)
			.digest();
	}

	function genNodeHash(lHash: Buffer, rHash: Buffer) {
		return createHash()
			.update(lHash)
			.update(rHash)
			.digest();
	}

	function createNode(
		left: TreeNode | null,
		right: TreeNode | null
	): TreeNode {
		const hash =
			left && right
				? genNodeHash(left.hash, right.hash)
				: genHash(Buffer.from(''));

		return {
			hash,
			key: max(left, right),
			left,
			right
		};
	}

	function createLeaf(k: bigint, h: Buffer): TreeNode {
		return {
			hash: h,
			key: k,
			left: null,
			right: null
		};
	}

	/**
	 * Update node properties.
	 */
	function updateNode(node: TreeNode) {
		if (node.left || node.right) {
			node.key = max(node.left, node.right);
			if (node.left && node.right) {
				node.hash = genNodeHash(node.left.hash, node.right.hash);
			}
		}
	}

	function insert(node: TreeNode, newLeaf: TreeNode) {
		const { key: k } = newLeaf;
		let left = node.left;
		let right = node.right;

		// Check if this is a leaf
		if (!left && !right) {
			const nodeKey = node.key;

			if (nodeKey < k) {
				return createNode(node, newLeaf);
			} else if (nodeKey > k) {
				return createNode(newLeaf, node);
			} else {
				throw new Error('Key exist');
			}
		}

		const lDist = distance(k, (left && left.key) || 0n);
		const rDist = distance(k, (right && right.key) || 0n);
		if (lDist < rDist) {
			if (left) {
				node.left = insert(left, newLeaf);
			} else {
				node.left = newLeaf;
			}
		} else if (lDist > rDist) {
			if (right) {
				node.right = insert(right, newLeaf);
			} else {
				node.right = newLeaf;
			}
		} else {
			const minKey = min(left, right);

			if (k < minKey) {
				return createNode(newLeaf, node);
			} else {
				return createNode(node, newLeaf);
			}
		}

		updateNode(node);
		return node;
	}

	function deleteNode(k: bigint) {
		// TODO
		console.log(k);
	}

	function diffAB(
		diffA: Map<bigint, Buffer>,
		diffB: Map<bigint, Buffer>,
		nodeA: TreeNode | null,
		nodeB: TreeNode | null
	) {
		console.log(
			`visit: left ${nodeA && nodeA.key}, right ${nodeB && nodeB.key}`
		);
		if (
			nodeA &&
			nodeB &&
			nodeA.key === nodeB.key &&
			nodeA.hash.compare(nodeB.hash) === 0
		) {
			return;
		}
		const nodeToString = (node: TreeNode | null) =>
			node ? `[${node.key}, ${node.hash.toString('base64')}]` : '<null>';
		console.log('No hash match', nodeToString(nodeA), nodeToString(nodeB));

		const leftA = nodeA && nodeA.left;
		const leftB = nodeB && nodeB.left;
		const rightA = nodeA && nodeA.right;
		const rightB = nodeB && nodeB.right;

		// Check if this is a leaf that is missing from the right tree
		if (nodeA && !leftA && !rightA) {
			const bHash = diffB.get(nodeA.key);

			if (bHash && bHash.compare(nodeA.hash) === 0) {
				// The same leaf appears to exist in both trees
				diffB.delete(nodeA.key);
			} else {
				// The leaf doesn't exist or differs from the right tree
				diffA.set(nodeA.key, nodeA.hash);
			}
		}

		// Check if this is a leaf that is missing from the left tree
		if (nodeB && !leftB && !rightB) {
			const aHash = diffA.get(nodeB.key);

			if (aHash && aHash.compare(nodeB.hash) === 0) {
				diffA.delete(nodeB.key);
			} else {
				diffB.set(nodeB.key, nodeB.hash);
			}
		}

		if (leftA || leftB) {
			// Recurse to the left branch
			diffAB(diffA, diffB, leftA, leftB);
		}
		if (rightA || rightB) {
			// Recurese to the right branch
			diffAB(diffA, diffB, rightA, rightB);
		}
	}

	function diff(tree: Csmt) {
		const leftMap = new Map<bigint, Buffer>();
		const rightMap = new Map<bigint, Buffer>();
		const nodeA = root;
		const nodeB = tree.getRoot();

		diffAB(leftMap, rightMap, nodeA, nodeB);

		return {
			left: [...leftMap],
			right: [...rightMap]
		};
	}

	function membershipProof(k: bigint) {
		// TODO
		console.log(k);
	}

	return {
		getRoot: () => root,
		insert: (k: bigint, h: Buffer) => {
			if (!(h instanceof Buffer)) {
				throw new TypeError('`h` must be a Buffer');
			}

			const newLeaf = createLeaf(k, h);

			if (root) {
				root = insert(root, newLeaf);
			} else {
				root = newLeaf;
			}
		},
		delete: deleteNode,
		diff,
		membershipProof
	};
}
