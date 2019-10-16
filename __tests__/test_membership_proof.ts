import { createHash } from 'crypto';
import { Csmt, createTree } from '../lib';

function genNodeHash(lHash: Buffer, rHash: Buffer) {
	return createHash('sha256')
		.update(lHash)
		.update(rHash)
		.digest();
}

describe('Membership proofs', () => {
	let tree: Csmt;

	beforeEach(() => {
		tree = createTree(() => createHash('sha256'));
	});

	test('Prove that 3n is a member of the tree', () => {
		tree.insert(1n, Buffer.from('a'));
		tree.insert(4n, Buffer.from('b'));
		tree.insert(3n, Buffer.from('c'));
		tree.insert(5n, Buffer.from('d'));

		const proof = tree.membershipProof(3n);
		const rightHash = Buffer.from('XmV/9hWNPiptI+KlI5F6IwWs7pQjNl4mhpXEt7iRn0w=', 'base64');

		expect(proof).toHaveLength(3);
		proof.forEach((el: typeof proof[0]) => expect(el).toHaveLength(2));
		expect(proof[0]).toEqual([Buffer.from('c'), 3n]);
		expect(proof[1]).toEqual([Buffer.from('a'), 'L']);
		expect(proof[2]).toEqual([rightHash, 'R']);

		const leftHash = genNodeHash(Buffer.from('a'), Buffer.from('c'));
		const rootHash = genNodeHash(leftHash, rightHash);
		const root = tree.getRoot();

		expect(root).not.toBeNull();
		expect(rootHash).toEqual(root && root.hash);
	});

	test('Prove that 5n is a member of the tree (boundary)', () => {
		tree.insert(1n, Buffer.from('a'));
		tree.insert(4n, Buffer.from('b'));
		tree.insert(3n, Buffer.from('c'));
		tree.insert(5n, Buffer.from('d'));

		const proof = tree.membershipProof(5n);
		const leftHash = genNodeHash(Buffer.from('a'), Buffer.from('c'));

		expect(proof).toHaveLength(3);
		proof.forEach((el: typeof proof[0]) => expect(el).toHaveLength(2));
		expect(proof[0]).toEqual([Buffer.from('d'), 5n]);
		expect(proof[1]).toEqual([Buffer.from('b'), 'L']);
		expect(proof[2]).toEqual([leftHash, 'L']);

		const rightHash = genNodeHash(Buffer.from('b'), Buffer.from('d'));
		const rootHash = genNodeHash(leftHash, rightHash);
		const root = tree.getRoot();

		expect(root).not.toBeNull();
		expect(rootHash).toEqual(root && root.hash);
	});

	test('Fail to show a proof for a key that is greater than the max key in the tree', () => {
		const tree = createTree(() => createHash('sha256'));

		tree.insert(1n, Buffer.from('a'));
		tree.insert(3n, Buffer.from('b'));
		tree.insert(4n, Buffer.from('c'));
		tree.insert(5n, Buffer.from('d'));

		const proof = tree.membershipProof(6n);

		expect(proof).toHaveLength(0);
	});

	test('Fail to show a proof for a key that is greater than the max key in the tree (case 2)', () => {
		const tree = createTree(() => createHash('sha256'));

		tree.insert(1n, Buffer.from('a'));
		tree.insert(3n, Buffer.from('b'));
		tree.insert(4n, Buffer.from('c'));
		tree.insert(5n, Buffer.from('d'));

		const proof = tree.membershipProof(10n);

		expect(proof).toHaveLength(0);
	});
});
