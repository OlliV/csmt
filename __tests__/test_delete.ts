import { createHash } from 'crypto';
import { createTree } from '../lib';

describe('Node deletion funcionality', () => {
	test('two trees are no longer equal after deleting a key', () => {
		const tree1 = createTree(() => createHash('sha256'));
		const tree2 = createTree(() => createHash('sha256'));

		tree1.insert(1n, Buffer.from('a'));
		tree1.insert(2n, Buffer.from('b'));
		tree1.insert(3n, Buffer.from('c'));
		tree1.insert(4n, Buffer.from('d'));
		tree1.insert(7n, Buffer.from('g'));
		tree1.insert(8n, Buffer.from('h'));
		tree1.insert(9n, Buffer.from('i'));

		tree2.insert(1n, Buffer.from('a'));
		tree2.insert(2n, Buffer.from('b'));
		tree2.insert(3n, Buffer.from('c'));
		tree2.insert(4n, Buffer.from('d'));
		tree2.insert(7n, Buffer.from('g'));
		tree2.insert(8n, Buffer.from('h'));
		tree2.insert(9n, Buffer.from('i'));

		expect(tree1.getRoot()).toEqual(tree2.getRoot());

		tree1.delete(7n);
		expect(tree1.getRoot()).not.toEqual(tree2.getRoot());
	});

	test('delete rebalances the tree properly', () => {
		const tree1 = createTree(() => createHash('sha256'));
		const tree2 = createTree(() => createHash('sha256'));

		tree1.insert(1n, Buffer.from('a'));
		tree1.insert(2n, Buffer.from('b'));
		tree1.insert(3n, Buffer.from('c'));
		tree1.insert(4n, Buffer.from('d'));
		tree1.insert(5n, Buffer.from('e'));
		tree1.insert(6n, Buffer.from('f'));
		tree1.insert(7n, Buffer.from('g'));
		tree1.insert(8n, Buffer.from('h'));
		tree1.insert(9n, Buffer.from('i'));
		tree1.insert(10n, Buffer.from('j'));
		tree1.insert(11n, Buffer.from('k'));
		tree1.insert(12n, Buffer.from('l'));
		tree1.insert(13n, Buffer.from('m'));
		tree1.insert(14n, Buffer.from('n'));
		tree1.insert(15n, Buffer.from('p'));
		tree1.insert(16n, Buffer.from('q'));
		tree1.insert(17n, Buffer.from('r'));
		tree1.insert(18n, Buffer.from('s'));
		tree1.insert(19n, Buffer.from('t'));

		tree2.insert(1n, Buffer.from('a'));
		tree2.insert(2n, Buffer.from('b'));
		tree2.insert(3n, Buffer.from('c'));
		tree2.insert(4n, Buffer.from('d'));
		tree2.insert(5n, Buffer.from('e'));
		tree2.insert(6n, Buffer.from('f'));
		tree2.insert(7n, Buffer.from('g'));
		tree2.insert(9n, Buffer.from('i'));
		tree2.insert(10n, Buffer.from('j'));
		tree2.insert(11n, Buffer.from('k'));
		tree2.insert(12n, Buffer.from('l'));
		tree2.insert(13n, Buffer.from('m'));
		tree2.insert(14n, Buffer.from('n'));
		tree2.insert(15n, Buffer.from('p'));
		tree2.insert(16n, Buffer.from('q'));
		tree2.insert(17n, Buffer.from('r'));
		tree2.insert(18n, Buffer.from('s'));
		tree2.insert(19n, Buffer.from('t'));

		expect(tree1.getRoot()).not.toEqual(tree2.getRoot());

		tree1.delete(8n);
		expect(tree1.getRoot()).toEqual(tree2.getRoot());
	});

	test('delete rebalances the tree properly (upped boundary)', () => {
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
		tree2.insert(5n, Buffer.from('e'));

		expect(tree1.getRoot()).not.toEqual(tree2.getRoot());

		tree2.delete(5n);
		expect(tree1.getRoot()).toEqual(tree2.getRoot());
	});

	test('delete rebalances the tree properly (lower boundary)', () => {
		const tree1 = createTree(() => createHash('sha256'));
		const tree2 = createTree(() => createHash('sha256'));

		tree1.insert(1n, Buffer.from('a'));
		tree1.insert(4n, Buffer.from('b'));
		tree1.insert(3n, Buffer.from('b'));
		tree1.insert(5n, Buffer.from('c'));
		tree1.insert(2n, Buffer.from('b'));

		tree2.insert(2n, Buffer.from('b'));
		tree2.insert(3n, Buffer.from('b'));
		tree2.insert(4n, Buffer.from('b'));
		tree2.insert(5n, Buffer.from('c'));

		expect(tree1.getRoot()).not.toEqual(tree2.getRoot());

		tree1.delete(1n);
		expect(tree1.getRoot()).toEqual(tree2.getRoot());
	});
});
