import { createHash } from 'crypto';
import { createTree } from '../lib';

describe('Node deletion funcionality', () => {
	test('delete rebalances the node properly', () => {
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
});
