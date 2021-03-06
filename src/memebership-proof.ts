import { TreeNode } from './types';
import { minInSubtree, maxInSubtree } from './tree-utils';
import match from './match';

export enum Direction {
	Left = 'L',
	Right = 'R'
}

export type Proof =
	| [bigint | null, bigint | null]
	| [bigint | Buffer, bigint | Direction][];

function reverse(direction: Direction): Direction {
	switch (direction) {
		case Direction.Left:
			return Direction.Right;
		case Direction.Right:
			return Direction.Left;
		default:
			throw new TypeError('"direction" is not type of Direction');
	}
}

function aeq(arr: any[]) {
	return (x: any[]) => x.every((y, i) => y === arr[i]);
}

function isList(x: any): boolean {
	return Array.isArray(x) && x.length > 0 && Array.isArray(x[0]);
}

function nonMembershipProof(
	k: bigint,
	key: bigint,
	direction: Direction,
	sibling: TreeNode
) {
	return match([k > key, direction])
		.on(aeq([true, Direction.Left]), () => [key, minInSubtree(sibling)])
		.on(aeq([true, Direction.Right]), () => [key, null])
		.on(aeq([false, Direction.Left]), () => [null, key])
		.on(aeq([false, Direction.Right]), () => [maxInSubtree(sibling), key])
		.otherwise(() => {
			throw new TypeError('"direction" is not type of Direction');
		});
}

function membershipProofR(
	sibling: TreeNode | null,
	direction: Direction | null,
	node: TreeNode,
	k: bigint
): Proof {
	const left = node.left;
	const right = node.right;

	if (k === undefined || k === null) {
		throw new TypeError('k is not a bigint');
	}

	// && would be more accurate here but there is never a case where only one
	// would be set and thus this way we save on error handling later on.
	if (!left || !right) {
		if (!direction) {
			throw new Error('"direction" must be set');
		}
		if (!sibling) {
			throw new Error('"sibling" must be set');
		}

		// This is a leaf node
		if (node.key === k) {
			return [
				[sibling.hash, reverse(direction)],
				[node.hash, node.key]
			];
		} else {
			// Find the non-membership proof otherwise
			return nonMembershipProof(k, node.key, direction, sibling);
		}
	}

	let result;
	if (k <= left.key) {
		// Going towards left child
		result = membershipProofR(right, Direction.Left, left, k);
	} else if (k <= right.key) {
		// Going towards right child
		result = membershipProofR(left, Direction.Right, right, k);
	} else {
		if (k > right.key) {
			// The given key `k` is greater than any key in this tree.
			// Trigger a proof for the largest key
			return [right.key, null];
		}

		if (!direction) {
			// TODO How should we set direction?
			throw new TypeError('"Direction" must be set');
		}
		if (!sibling) {
			throw new Error('"sibling" must be set');
		}

		// Find the non-membership proof otherwise
		return nonMembershipProof(k, node.key, direction, sibling);
	}

	if (sibling) {
		if (isList(result) && direction) {
			// @ts-ignore the array thing is confusing for TS
			return [[sibling.hash, reverse(direction)], ...result];
		} else if (result[1] === null && direction === Direction.Left) {
			return [node.key, minInSubtree(sibling)];
		} else if (result[0] === null && direction === Direction.Right) {
			return [maxInSubtree(sibling), node.key];
		}
	}

	return result;
}

export default function membershipProof(
	root: TreeNode | null,
	k: bigint
): Proof {
	if (!root) {
		return [];
	}

	// Root has no sibling or direction so null is used
	return (
		match(membershipProofR(null, null, root, k))
			// The key is present in the tree
			// Provide the proof in reverse order
			.on(
				x => isList(x),
				r => r.reverse()
			)
			// The key is greater than the largest element in the tree
			// Provide a proof for the largest key
			.on(
				([_, y]) => y === null,
				([x, _]) => [...membershipProof(root, x), null]
			)
			// The key is smaller than the smallest element in the tree
			// Provide a proof for the smallest key
			.on(
				([x, _]) => x === null,
				([_, y]) => [null, ...membershipProof(root, y)]
			)
			// The key is bounded by by two keys in the case of non-membership proff
			// provide a proof for the bounding keys to exist
			.otherwise(([x, y]) => [
				membershipProof(root, x),
				membershipProof(root, y)
			])
	);
}
