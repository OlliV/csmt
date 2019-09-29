//     treeify.js
//     Luke Plaster <notatestuser@gmail.com>
//     https://github.com/notatestuser/treeify/blob/master/treeify.js
//
//     The MIT License (MIT)
//
//     Copyright (c) 2016 Luke Plaster <notatestuser@gmail.com>
//
//     Permission is hereby granted, free of charge, to any person obtaining a copy
//     of this software and associated documentation files (the "Software"), to deal
//     in the Software without restriction, including without limitation the rights
//     to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//     copies of the Software, and to permit persons to whom the Software is
//     furnished to do so, subject to the following conditions:
//
//     The above copyright notice and this permission notice shall be included in all
//     copies or substantial portions of the Software.
//
//     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//     IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//     FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//     AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//     LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//     SOFTWARE.

// do the universal module definition dance
(function(root, factory) {
	if (typeof exports === 'object') {
		module.exports = factory();
	} else if (typeof define === 'function' && define.amd) {
		define(factory);
	} else {
		root.treeify = factory();
	}
})(this, function() {
	function makePrefix(key, last) {
		var str = last ? '└' : '├';
		if (key) {
			str += '─ ';
		} else {
			str += '──┐';
		}
		return str;
	}

	function filterKeys(obj, hideFunctions) {
		const keys = [];

		for (let branch in obj) {
			// always exclude anything in the object's prototype
			if (!obj.hasOwnProperty(branch)) {
				continue;
			}
			// ... and hide any keys mapped to functions if we've been told to
			if (hideFunctions && typeof obj[branch] === 'function') {
				continue;
			}

			keys.push(branch);
		}
		return keys;
	}

	function growBranch(
		key,
		root,
		last,
		lastStates,
		showValues,
		hideFunctions,
		callback
	) {
		let line = '',
			index = 0,
			lastKey,
			circular,
			lastStatesCopy = lastStates.slice(0);
		const isSpecialObj = o =>
			typeof o === 'object' && (o instanceof Date || o instanceof Buffer);

		if (lastStatesCopy.push([root, last]) && lastStates.length > 0) {
			// based on the "was last element" states of whatever we're nested within,
			// we need to append either blankness or a branch to our line
			lastStates.forEach(function(lastState, idx) {
				if (idx > 0) {
					line += (lastState[1] ? ' ' : '│') + '  ';
				}
				if (!circular && lastState[0] === root) {
					circular = true;
				}
			});

			// the prefix varies based on whether the key contains something to show and
			// whether we're dealing with the last element in this collection
			line += makePrefix(key, last) + key;

			// append values and the circular reference indicator
			if (
				showValues &&
				(typeof root !== 'object' || isSpecialObj(root))
			) {
				if (root instanceof Buffer) {
					line += ': ' + root.toString('base64');
				} else {
					line += ': ' + root;
				}
			}
			if (circular) {
				line += ' (circular ref.)';
			}

			callback(line);
		}

		// can we descend into the next item?
		if (!circular && typeof root === 'object' && !isSpecialObj(root)) {
			var keys = filterKeys(root, hideFunctions);
			keys.forEach(function(branch) {
				// the last key is always printed with a different prefix, so we'll need to know if we have it
				lastKey = ++index === keys.length;

				// hold your breath for recursive action
				growBranch(
					branch,
					root[branch],
					lastKey,
					lastStatesCopy,
					showValues,
					hideFunctions,
					callback
				);
			});
		}
	}

	// --------------------

	var Treeify = {};

	// Treeify.asLines
	// --------------------
	// Outputs the tree line-by-line, calling the lineCallback when each one is available.

	Treeify.asLines = function(obj, showValues, hideFunctions, lineCallback) {
		/* hideFunctions and lineCallback are curried, which means we don't break apps using the older form */
		var hideFunctionsArg =
			typeof hideFunctions !== 'function' ? hideFunctions : false;
		growBranch(
			'.',
			obj,
			false,
			[],
			showValues,
			hideFunctionsArg,
			lineCallback || hideFunctions
		);
	};

	// Treeify.asTree
	// --------------------
	// Outputs the entire tree, returning it as a string with line breaks.

	Treeify.asTree = function(obj, showValues, hideFunctions) {
		var tree = '';
		growBranch('.', obj, false, [], showValues, hideFunctions, function(
			line
		) {
			tree += line + '\n';
		});
		return tree;
	};

	// --------------------

	return Treeify;
});
