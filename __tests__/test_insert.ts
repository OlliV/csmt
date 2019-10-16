// @ts-nocheck
import { createHash } from 'crypto';
import { Csmt, createTree } from '../lib';

const shortHash = (buf: Buffer) => buf.toString('base64').substring(0, 5);

describe('Basic tree building functionality with insert()', () => {
	let tree: Csmt;

	beforeEach(() => {
		tree = createTree(() => createHash('sha256'));
	});

	test('A basic tree is formed correctly', () => {
		tree.insert(1n, Buffer.from('a'));
		tree.insert(2n, Buffer.from('b'));
		tree.insert(3n, Buffer.from('c'));
		tree.insert(4n, Buffer.from('d'));

		const root = tree.getRoot();
		expect(root).not.toBeNull();
		expect(root.hash).toBeInstanceOf(Buffer);
		expect(shortHash(root.hash)).toBe('jq/kE');
		expect(root.key).toBe(4n);

		expect(root.left).not.toBeNull();
		expect(shortHash(root.left.hash)).toBe('8AS3E');
		expect(root.left.key).toBe(3n);

		expect(root.left.left).not.toBeNull();
		expect(shortHash(root.left.left.hash)).toBe('YQ==');
		expect(root.left.left.key).toBe(1n);
		expect(root.left.left.left).toBeNull();
		expect(root.left.left.right).toBeNull();

		expect(root.left.right).not.toBeNull();
		expect(shortHash(root.left.right.hash)).toBe('Hgu9b');
		expect(root.left.right.key).toBe(3n);

		expect(root.left.right.left).not.toBeNull();
		expect(shortHash(root.left.right.left.hash)).toBe('Yg==');
		expect(root.left.right.left.key).toBe(2n);
		expect(root.left.right.left.left).toBeNull();
		expect(root.left.right.left.right).toBeNull();

		expect(root.left.right.right).not.toBeNull();
		expect(shortHash(root.left.right.right.hash)).toBe('Yw==');
		expect(root.left.right.right.key).toBe(3n);
		expect(root.left.right.right.left).toBeNull();
		expect(root.left.right.right.right).toBeNull();

		expect(root.right).not.toBeNull();
		expect(shortHash(root.right.hash)).toBe('ZA==');
		expect(root.right.key).toBe(4n);
		expect(root.right.left).toBeNull();
		expect(root.right.right).toBeNull();
	});

	test('The root hash is recomputed on every insert', () => {
		tree.insert(1n, Buffer.from('a'));
		expect(shortHash(tree.getRoot().hash)).toBe('YQ==');

		tree.insert(2n, Buffer.from('b'));
		expect(shortHash(tree.getRoot().hash)).toBe('+44g/');

		tree.insert(5n, Buffer.from('c'));
		expect(shortHash(tree.getRoot().hash)).toBe('OvuAS');
	});

	test('Trees are reproducible regardless of the insertion order', () => {
		const tree1 = createTree(() => createHash('sha256'));
		const tree2 = createTree(() => createHash('sha256'));

		tree1.insert(1n, Buffer.from('a'));
		tree1.insert(2n, Buffer.from('b'));
		tree1.insert(3n, Buffer.from('c'));
		tree1.insert(4n, Buffer.from('d'));

		tree2.insert(2n, Buffer.from('b'));
		tree2.insert(4n, Buffer.from('d'));
		tree2.insert(3n, Buffer.from('c'));
		tree2.insert(1n, Buffer.from('a'));

		expect(tree1.getRoot()).toEqual(tree2.getRoot());
	});

	test('Difference in a single node causes the root hash to differ', () => {
		const tree1 = createTree(() => createHash('sha256'));
		const tree2 = createTree(() => createHash('sha256'));

		tree1.insert(1n, Buffer.from('a'));
		tree1.insert(2n, Buffer.from('b'));
		tree1.insert(3n, Buffer.from('c'));
		tree1.insert(4n, Buffer.from('d'));

		tree2.insert(1n, Buffer.from('a'));
		tree2.insert(2n, Buffer.from('b'));
		tree2.insert(3n, Buffer.from('x'));
		tree2.insert(4n, Buffer.from('d'));

		expect(tree2.getRoot().hash).not.toBe(tree1.getRoot().hash);
	});
});
