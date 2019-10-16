import { createHash } from 'crypto';
import { createTree } from '../lib';

describe('Tree diffing funcionality', () => {
	test('Equal trees have zero diff', () => {
		const tree1 = createTree(() => createHash('sha256'));
		const tree2 = createTree(() => createHash('sha256'));

		tree1.insert(1n, Buffer.from('a'));
		tree1.insert(2n, Buffer.from('b'));
		tree1.insert(3n, Buffer.from('c'));
		tree1.insert(4n, Buffer.from('d'));

		tree2.insert(1n, Buffer.from('a'));
		tree2.insert(2n, Buffer.from('b'));
		tree2.insert(3n, Buffer.from('c'));
		tree2.insert(4n, Buffer.from('d'));

		const diff = tree1.diff(tree2);

		expect(diff.left).toHaveLength(0);
		expect(diff.right).toHaveLength(0);
	});

	test('Equal trees have zero diff both ways', () => {
		const tree1 = createTree(() => createHash('sha256'));
		const tree2 = createTree(() => createHash('sha256'));

		tree1.insert(1n, Buffer.from('a'));
		tree1.insert(2n, Buffer.from('b'));
		tree1.insert(3n, Buffer.from('c'));
		tree1.insert(4n, Buffer.from('d'));

		tree2.insert(1n, Buffer.from('a'));
		tree2.insert(2n, Buffer.from('b'));
		tree2.insert(3n, Buffer.from('c'));
		tree2.insert(4n, Buffer.from('d'));

		const diff1 = tree1.diff(tree2);
		const diff2 = tree2.diff(tree1);

		expect(diff1.left).toHaveLength(0);
		expect(diff1.right).toHaveLength(0);
		expect(diff2.left).toHaveLength(0);
		expect(diff2.right).toHaveLength(0);
	});

	test('A tree has no diff against itself', () => {
		const tree = createTree(() => createHash('sha256'));

		tree.insert(1n, Buffer.from('a'));
		tree.insert(2n, Buffer.from('b'));

		const diff = tree.diff(tree);

		expect(diff.left).toHaveLength(0);
		expect(diff.right).toHaveLength(0);
	});

	test('Right tree has one new node', () => {
		const tree1 = createTree(() => createHash('sha256'));
		const tree2 = createTree(() => createHash('sha256'));

		tree1.insert(1n, Buffer.from('a'));
		tree1.insert(4n, Buffer.from('b'));
		tree1.insert(3n, Buffer.from('b'));
		tree1.insert(5n, Buffer.from('b'));

		tree2.insert(1n, Buffer.from('a'));
		tree2.insert(4n, Buffer.from('b'));
		tree2.insert(3n, Buffer.from('b'));
		tree2.insert(5n, Buffer.from('b'));
		tree2.insert(2n, Buffer.from('b'));

		const { left, right } = tree1.diff(tree2);

		expect(left).toHaveLength(0);
		expect(right).toHaveLength(1);
		expect(right[0][0]).toBe(2n);
		expect(right[0][1]).toEqual(Buffer.from('b'));
	});

	test('The same key is marked as a diff in both because the hash has changed', () => {
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

		const { left, right } = tree1.diff(tree2);

		expect(left).toHaveLength(1);
		expect(left[0][0]).toBe(5n);
		expect(left[0][1]).toEqual(Buffer.from('b'));

		expect(right).toHaveLength(1);
		expect(right[0][0]).toBe(5n);
		expect(right[0][1]).toEqual(Buffer.from('c'))
	});
});
