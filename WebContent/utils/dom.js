/*!
* Aloha Editor
* Author & Copyright (c) 2010 Gentics Software GmbH
* aloha-sales@gentics.com
* Licensed unter the terms of http://www.aloha-editor.com/license.html
*/
if (typeof GENTICS == 'undefined' || !GENTICS) {
	var GENTICS = {};
}

if (typeof GENTICS.Utils == 'undefined' || !GENTICS.Utils) {
	GENTICS.Utils = {};
}

if (typeof GENTICS.Utils.Dom == 'undefined' || !GENTICS.Utils.Dom) {
	/**
	 * @namespace GENTICS.Utils
	 * @class Dom provides methods to get information about the DOM and to manipulate it
	 * @singleton
	 */
	GENTICS.Utils.Dom = function () {};
} 

/**
 * Tags which can safely be merged
 * @hide
 */
GENTICS.Utils.Dom.prototype.mergeableTags = ['b', 'code', 'del', 'em', 'i', 'ins', 'strong', 'sub', 'sup', '#text'];

/**
 * Tags which make up Flow Content or Phrasing Content, according to the HTML 5 specification,
 * @see http://dev.w3.org/html5/spec/Overview.html#flow-content
 * @see http://dev.w3.org/html5/spec/Overview.html#phrasing-content
 * @hide
 */
GENTICS.Utils.Dom.prototype.tags = {
	'flow' : [ 'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio',
			'b', 'bdo', 'blockquote', 'br', 'button', 'canvas', 'cite', 'code',
			'command', 'datalist', 'del', 'details', 'dfn', 'div', 'dl', 'em',
			'embed', 'fieldset', 'figure', 'footer', 'form', 'h1', 'h2', 'h3',
			'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'i', 'iframe', 'img',
			'input', 'ins', 'kbd', 'keygen', 'label', 'map', 'mark', 'math',
			'menu', 'meter', 'nav', 'noscript', 'object', 'ol', 'output', 'p',
			'pre', 'progress', 'q', 'ruby', 'samp', 'script', 'section',
			'select', 'small', 'span', 'strong', 'style', 'sub', 'sup', 'svg',
			'table', 'textarea', 'time', 'ul', 'var', 'video', 'wbr', '#text' ],
	'phrasing' : [ 'a', 'abbr', 'area', 'audio', 'b', 'bdo', 'br', 'button',
			'canvas', 'cite', 'code', 'command', 'datalist', 'del', 'dfn',
			'em', 'embed', 'i', 'iframe', 'img', 'input', 'ins', 'kbd',
			'keygen', 'label', 'map', 'mark', 'math', 'meter', 'noscript',
			'object', 'output', 'progress', 'q', 'ruby', 'samp', 'script',
			'select', 'small', 'span', 'strong', 'sub', 'sup', 'svg',
			'textarea', 'time', 'var', 'video', 'wbr', '#text' ]
};

/**
 * Possible children of tags (some of them), according to the HTML 5
 * specification. see http://dev.w3.org/html5/spec/Overview.html#elements-1
 * @hide
 */
GENTICS.Utils.Dom.prototype.children = {
	'a' : 'phrasing',
	'b' : 'phrasing',
	'blockquote' : 'flow',
	'br' : 'empty',
	'caption' : 'flow',
	'cite' : 'phrasing',
	'code' : 'phrasing',
	'col' : 'empty',
	'colgroup' : 'col',
	'del' : 'phrasing',
	'div' : 'flow',
	'h1' : 'phrasing',
	'h2' : 'phrasing',
	'h3' : 'phrasing',
	'h4' : 'phrasing',
	'h5' : 'phrasing',
	'h6' : 'phrasing',
	'hr' : 'empty',
	'i' : 'phrasing',
	'img' : 'empty',
	'ins' : 'phrasing',
	'li' : 'flow',
	'ol' : 'li',
	'p' : 'phrasing',
	'pre' : 'phrasing',
	'small' : 'phrasing',
	'span' : 'phrasing',
	'strong' : 'phrasing',
	'sub' : 'phrasing',
	'sup' : 'phrasing',
	'table' : ['caption', 'colgroup', 'thead', 'tbody', 'tfoot', 'tr'],
	'tbody' : 'tr',
	'td' : 'flow',
	'tfoot' : 'tr',
	'th' : 'phrasing',
	'thead' : 'tr',
	'tr' : ['th', 'td'],
	'ul' : 'li'
};

/**
 * List of nodenames of blocklevel elements
 * TODO: finish this list
 * @hide
 */
GENTICS.Utils.Dom.prototype.blockLevelElements = {
  'p' : true,
  'h1' : true,
  'h2' : true,
  'h3' : true,
  'h4' : true,
  'h5' : true,
  'h6' : true,
  'blockquote' : true,
  'div' : true,
  'pre' : true
};

/**
 * List of nodenames of list elements
 * @hide
 */
GENTICS.Utils.Dom.prototype.listElements = {
	'li' : true,
	'ol' : true,
	'ul' : true
};

/**
 * Splits a DOM element at the given position up until the limiting object(s), so that it is valid HTML again afterwards.
 * @param {RangeObject} range Range object that indicates the position of the splitting.
 * 				This range will be updated, so that it represents the same range as before the split.
 * @param {jQuery} limit Limiting node(s) for the split. 
 * 				The limiting node will not be included in the split itself.
 * 				If no limiting object is set, the document body will be the limiting object.
 * @param {boolean} atEnd If set to true, the DOM will be splitted at the end of the range otherwise at the start.
 * @method
 */
GENTICS.Utils.Dom.prototype.split = function (range, limit, atEnd) {
	var splitElement = jQuery(range.startContainer);
	var splitPosition = range.startOffset;
	
	if (atEnd) {
		splitElement = jQuery(range.endContainer);
		splitPosition = range.endOffset;
	}
	
	if (limit.length < 1) {
		limit = jQuery(document.body);
	}
	
	// we may have to update the range if it is not collapsed and we are splitting at the start
	var updateRange = (!range.isCollapsed() && !atEnd);
	
	// find the path up to the highest object that will be splitted
	var path;
	var parents = splitElement.parents().get();
	parents.unshift(splitElement.get(0));
		
	jQuery.each(parents, function(index, element) {
		var isLimit = limit.filter(
				function(){
					return this == element;
				}).length;
		if (isLimit) {
			if (index > 0) {
				path = parents.slice(0, index);
			}
			return false;
		}
	});
	
	// nothing found to split -> return here
	if (! path) {
		return;
	}
	
	path = path.reverse();
	var newDom;
	var insertElement;
	
	// iterate over the path, create new dom nodes for every element and move 
	// the contents right of the split to the new element 
	for(var i=0; i < path.length; i++) {
		var element = path[i];
		if (i === path.length -1) {
			// last element in the path -> we have to split it
			var secondPart;
			
			// split the last part into two parts
			if (element.nodeType === 3) {
				// text node
				secondPart = document.createTextNode(element.data.substring(splitPosition, element.data.length));
				element.data = element.data.substring(0, splitPosition);	
			} else {
				// other nodes
				var newElement = jQuery(document.createElement(element.nodeName));
				var children = $(element).contents();
				secondPart = newElement.append(children.slice(splitPosition, children.length)).get(0);
			}
			
			// update the range if necessary
			if (updateRange && range.endContainer === element) {
				range.endContainer = secondPart;
				range.endOffset -= splitPosition;
				range.clearCaches();
			}
			
			// add the second part
			if (insertElement) {
				insertElement.prepend(secondPart);
			} else {
				$(element).after(secondPart);
			}
		} else {
			// create the new element of the same type and prepend it to the previously created element
			var newElement = jQuery(document.createElement(element.nodeName));
			
			if (!newDom) {
				newDom = newElement;
				insertElement = newElement;
			} else {
				insertElement.prepend(newElement);
				insertElement = newElement;
			}
			
			// move all contents right of the split to the new element
			var next;
			while (next = path[i+1].nextSibling) {
				insertElement.append(next);
			}
			
			// update the range if necessary
			if (updateRange && range.endContainer === element) {
				range.endContainer = newElement.get(0);
				var prev = path[i+1];
				var offset = 0;
				while (prev = prev.previousSibling) {
					offset++;
				}
				range.endOffset -= offset;
				range.clearCaches();
			}
		}
	}
	
	// append the new dom
	jQuery(path[0]).after(newDom);
};

/**
 * Check whether the HTML 5 specification allows direct nesting of the given DOM
 * objects.
 * @param {object} outerDOMObject
 *            outer (nesting) DOM Object
 * @param {object} innerDOMObject
 *            inner (nested) DOM Object
 * @return {boolean} true when the nesting is allowed, false if not
 * @method
 */
GENTICS.Utils.Dom.prototype.allowsNesting = function (outerDOMObject, innerDOMObject) {
	if (!outerDOMObject || !outerDOMObject.nodeName || !innerDOMObject
			|| !innerDOMObject.nodeName) {
		return false;
	}

	var outerNodeName = outerDOMObject.nodeName.toLowerCase();
	var innerNodeName = innerDOMObject.nodeName.toLowerCase();

	if (!this.children[outerNodeName]) {
		return false;
	}

	// check whether the nesting is configured by node names (like for table)
	if (this.children[outerNodeName] == innerNodeName) {
		return true;
	}
	if (jQuery.isArray(this.children[outerNodeName])
			&& jQuery.inArray(innerNodeName, this.children[outerNodeName]) >= 0) {
		return true;
	}

	if (jQuery.isArray(this.tags[this.children[outerNodeName]])
			&& jQuery.inArray(innerNodeName,
					this.tags[this.children[outerNodeName]]) >= 0) {
		return true;
	}

	return false;
};

/**
 * Apply the given markup additively to the given range. The given rangeObject will be modified if necessary
 * @param {GENTICS.Utils.RangeObject} rangeObject range to which the markup shall be added
 * @param {jQuery} markup markup to be applied as jQuery object
 * @param {boolean} allownesting true when nesting of the added markup is allowed, false if not (default: false)
 * @method
 */
GENTICS.Utils.Dom.prototype.addMarkup = function (rangeObject, markup, nesting) {
	// split partially contained text nodes at the start and end of the range
	if (rangeObject.startContainer.nodeType == 3 && rangeObject.startOffset > 0
			&& rangeObject.startOffset < rangeObject.startContainer.data.length) {
		this.split(rangeObject, jQuery(rangeObject.startContainer).parent(),
			false);
	}
	if (rangeObject.endContainer.nodeType == 3 && rangeObject.endOffset > 0
			&& rangeObject.endOffset < rangeObject.endContainer.data.length) {
		this.split(rangeObject, jQuery(rangeObject.endContainer).parent(),
			true);
	}

	// get the range tree
	var rangeTree = rangeObject.getRangeTree();
	this.recursiveAddMarkup(rangeTree, markup, rangeObject, nesting);

	// cleanup DOM
	this.doCleanup({'merge' : true, 'removeempty' : true}, rangeObject);
};

/**
 * Recursive helper method to add the given markup to the range
 * @param rangeTree rangetree at the current level
 * @param markup markup to be applied
 * @param rangeObject range object, which eventually is updated
 * @param nesting true when nesting of the added markup is allowed, false if not
 * @hide
 */
GENTICS.Utils.Dom.prototype.recursiveAddMarkup = function (rangeTree, markup, rangeObject, nesting) {
	// iterate through all rangetree objects of that level
	for (var i = 0; i < rangeTree.length; ++i) {
		// check whether the rangetree object is fully contained and the markup may be wrapped around the object
		if (rangeTree[i].type == 'full' && this.allowsNesting(markup.get(0), rangeTree[i].domobj)) {
			// we wrap the object, when
			// 1. nesting of markup is allowed or the node is not of the markup to be added
			// 2. the node an element node or a non-empty text node
			if ((nesting || rangeTree[i].domobj.nodeName != markup.get(0).nodeName)
					&& (rangeTree[i].domobj.nodeType != 3 || jQuery
							.trim(rangeTree[i].domobj.data).length != 0)) {
				// wrap the object
				jQuery(rangeTree[i].domobj).wrap(markup);

				// TODO eventually update the range (if it changed)

				// when nesting is not allowed, we remove the markup from the inner element
				if (!nesting && rangeTree[i].domobj.nodeType != 3) {
					var innerRange = new GENTICS.Utils.RangeObject();
					innerRange.startContainer = innerRange.endContainer = rangeTree[i].domobj.parentNode;
					innerRange.startOffset = 0;
					innerRange.endOffset = innerRange.endContainer.childNodes.length;
					this.removeMarkup(innerRange, markup, jQuery(rangeTree[i].domobj.parentNode));
				}
			}
		} else {
			// TODO check whether the object may be replaced by the given markup
			if (false) {
				// TODO replace
			} else {
				// recurse into the children (if any), but not if nesting is not
				// allowed and the object is of the markup to be added
				if (nesting || rangeTree[i].domobj.nodeName != markup.get(0).nodeName) {
					if (rangeTree[i].children && rangeTree[i].children.length > 0) {
						this.recursiveAddMarkup(rangeTree[i].children, markup);
					}
				}
			}
		}
	}
};

/**
 * Find the highest occurrence of a node with given nodename within the parents
 * of the start. When limit objects are given, the search stops there.
 * The limiting object is of the found type, it won't be considered
 * @param {DOMObject} start start object
 * @param {String} nodeName name of the node to search for (case-insensitive)
 * @param {jQuery} limit Limiting node(s) as jQuery object (if none given, the search will stop when there are no more parents)
 * @return {DOMObject} the found DOM object or undefined
 * @method
 */
GENTICS.Utils.Dom.prototype.findHighestElement = function (start, nodeName, limit) {
	var testObject = start;
	nodeName = nodeName.toLowerCase();

	// helper function to stop when we reach a limit object
	var isLimit = limit ? function () {
		return limit.filter(
				function() {
					return testObject == this;
				}
		).length;
	} : function () {
		return false;
	};

	// this will be the highest found markup object (up to a limit object)
	var highestObject = undefined;

	// now get the highest parent that has the given markup (until we reached
	// one of the limit objects or there are no more parent nodes)
	while (!isLimit() && testObject) {
		if (testObject.nodeName.toLowerCase() == nodeName) {
			highestObject = testObject;
		}
		testObject = testObject.parentNode;
	};

	return highestObject;
};

/**
 * Remove the given markup from the given range. The given rangeObject will be modified if necessary
 * TODO: add parameter deep/shallow
 * @param {GENTICS.Utils.RangeObject} rangeObject range from which the markup shall be removed
 * @param {jQuery} markup markup to be removed as jQuery object
 * @param {jQuery} limit Limiting node(s) as jQuery object
 * @method
 */
GENTICS.Utils.Dom.prototype.removeMarkup = function (rangeObject, markup, limit) {
	var nodeName = markup.get(0).nodeName;
	var startSplitLimit = this.findHighestElement(rangeObject.startContainer, nodeName, limit);
	var endSplitLimit = this.findHighestElement(rangeObject.endContainer, nodeName, limit);
	var didSplit = false;

	if (startSplitLimit /* && rangeObject.startOffset > 0 */) {
		// when the start is in the start of its container, we don't split
		this.split(rangeObject, jQuery(startSplitLimit).parent(), false);
		didSplit = true;
	}

	if (endSplitLimit) {
		// when the end is in the end of its container, we don't split
//		if (rangeObject.endContainer.nodeType == 3 && rangeObject.endOffset < rangeObject.endContainer.data.length) {
			this.split(rangeObject, jQuery(endSplitLimit).parent(), true);
			didSplit = true;
//		}
//		if (rangeObject.endContainer.nodeType == 1 && rangeObject.endOffset < rangeObject.childNodes.length) {
//			this.split(rangeObject, jQuery(endSplitLimit).parent(), true);
//			didSplit = true;
//		}
	}

	// when we split the DOM, we maybe need to correct the range
	if (didSplit) {
		rangeObject.correctRange();
	}

	// find the highest occurrence of the markup
	var highestObject = this.findHighestElement(rangeObject.getCommonAncestorContainer(), nodeName, limit);
	var root = highestObject ? highestObject.parentNode : undefined;

	// construct the range tree
	var rangeTree = rangeObject.getRangeTree(root);
	// remove the markup from the range tree
	this.recursiveRemoveMarkup(rangeTree, markup);
	
	// cleanup DOM
	this.doCleanup({'merge' : true, 'removeempty' : true}, rangeObject, root);
};

/**
 * TODO: pass the range itself and eventually update it if necessary
 * Recursive helper method to remove the given markup from the range
 * @param rangeTree rangetree at the current level
 * @param markup markup to be applied
 * @hide
 */
GENTICS.Utils.Dom.prototype.recursiveRemoveMarkup = function (rangeTree, markup) {
	// iterate over the rangetree objects of this level
	for (var i = 0; i < rangeTree.length; ++i) {
		// check whether the object is the markup to be removed and is fully into the range
		if (rangeTree[i].type == 'full' && rangeTree[i].domobj.nodeName == markup.get(0).nodeName) {
			// found the markup, so remove it
			var content = jQuery(rangeTree[i].domobj).contents();
			if (content.length > 0) {
				// when the object has children, we unwrap them
				content.first().unwrap();
			} else {
				// obj has no children, so just remove it
				jQuery(rangeTree[i].domobj).remove();
			}
		}

		// if the object has children, we do the recursion now
		if (rangeTree[i].children) {
			this.recursiveRemoveMarkup(rangeTree[i].children, markup);
		}
	}
};

/**
 * Cleanup the DOM, starting with the given startobject (or the common ancestor container of the given range)
 * Cleanup modes (given as properties in 'cleanup'):
 * <pre>
 * - merge: merges multiple successive nodes of same type, if this is allowed, starting at the children of the given node (defaults to false)
 * - removeempty: removes empty element nodes (defaults to false)
 * </pre>
 * Example for calling this method:<br/>
 * <code>GENTICS.Utils.Dom.doCleanup({merge:true,removeempty:false}, range)</code>
 * @param {object} cleanup type of cleanup to be done
 * @param {GENTICS.Utils.RangeObject} rangeObject range which is eventually updated
 * @param {DOMObject} start start object, if not given, the commonancestorcontainer is used as startobject insted
 * @return {boolean} true when the range (startContainer/startOffset/endContainer/endOffset) was modified, false if not
 * @method
 */
GENTICS.Utils.Dom.prototype.doCleanup = function(cleanup, rangeObject, start) {
	var that = this;

	if (typeof cleanup == 'undefined') {
		cleanup = {'merge' : true, 'removeempty' : true};
	}

	if (typeof start == 'undefined') {
		if (rangeObject) {
			start = rangeObject.getCommonAncestorContainer();
		}
	}
	// remember the previous node here (successive nodes of same type will be merged into this)
	var prevNode = false;
	// check whether the range needed to be modified during merging
	var modifiedRange = false;
	// get the start object
	var startObject = jQuery(start);

	// iterate through all sub nodes
	startObject.contents().each(function(index) {
		// decide further actions by node type
		switch(this.nodeType) {
		// found a non-text node
		case 1:
			if (prevNode && prevNode.nodeName == this.nodeName) {
				// found a successive node of same type

				// now we check whether the selection starts or ends in the mother node after the current node
				if (rangeObject.startContainer === startObject && rangeObject.startOffset > index) {
					// there will be one less object, so reduce the startOffset by one
					rangeObject.startOffset -= 1;
					// set the flag for range modification
					modifiedRange = true;
				}
				if (rangeObject.endContainer === startObject && rangeObject.endOffset > index) {
					// there will be one less object, so reduce the endOffset by one
					rangeObject.endOffset -= 1;
					// set the flag for range modification
					modifiedRange = true;
				}

				// merge the contents of this node into the previous one
				jQuery(prevNode).append(jQuery(this).contents());

				// remove this node
				jQuery(this).remove();
			} else {
				if (jQuery.inArray(this.nodeName.toLowerCase(), that.mergeableTags) >= 0) {
					prevNode = this;
				} else {
					prevNode = false;
				}
				// do the recursion step here
				modifiedRange |= that.doCleanup(cleanup, rangeObject, this);

				// eventually remove empty elements
				if (cleanup.removeempty) {
					if (GENTICS.Utils.Dom.isBlockLevelElement(this) && this.childNodes.length == 0) {
						jQuery(this).remove();
						prevNode = false;
					}
					if (jQuery.inArray(this.nodeName.toLowerCase(), that.mergeableTags) >= 0 && jQuery(this).text().length == 0) {
						jQuery(this).remove();
						prevNode = false;
					}
				}
			}

			break;
		// found a text node
		case 3:
			// found a text node
			if (prevNode && prevNode.nodeType == 3 && cleanup.merge) {
				// the current text node will be merged into the last one, so
				// check whether the selection starts or ends in the current
				// text node
				if (rangeObject.startContainer === this) {
					// selection starts in the current text node

					// update the start container to the last node
					rangeObject.startContainer = prevNode;

					// update the start offset
					rangeObject.startOffset += prevNode.length;

					// set the flag for range modification
					modifiedRange = true;
				}
				
				if (rangeObject.endContainer === this) {
					// selection ends in the current text node

					// update the end container to be the last node
					rangeObject.endContainer = prevNode;

					// update the end offset
					rangeObject.endOffset += prevNode.length;

					// set the flag for range modification
					modifiedRange = true;
				}

				// now we check whether the selection starts or ends in the mother node after the current node
				if (rangeObject.startContainer === startObject && rangeObject.startOffset > index) {
					// there will be one less object, so reduce the startOffset by one
					rangeObject.startOffset -= 1;
					// set the flag for range modification
					modifiedRange = true;
				}
				if (rangeObject.endContainer === startObject && rangeObject.endOffset > index) {
					// there will be one less object, so reduce the endOffset by one
					rangeObject.endOffset -= 1;
					// set the flag for range modification
					modifiedRange = true;
				}

				// now append the contents of the current text node into the previous
				prevNode.data += this.data;

				// remove this text node
				jQuery(this).remove();
			} else {
				// remember it as the last text node
				prevNode = this;
			}
			break;
		}
	});

	// eventually remove the startnode itself
	if (cleanup.removeempty
			&& GENTICS.Utils.Dom.isBlockLevelElement(start)
			&& (!start.childNodes || start.childNodes.length == 0)) {
		if (rangeObject.startContainer == start) {
			rangeObject.startContainer = start.parentNode;
			rangeObject.startOffset = GENTICS.Utils.Dom.getIndexInParent(start);
		}
		if (rangeObject.endContainer == start) {
			rangeObject.endContainer = start.parentNode;
			rangeObject.endOffset = GENTICS.Utils.Dom.getIndexInParent(start);
		}
		startObject.remove();
		modifiedRange = true;
	}

	if (modifiedRange) {
		rangeObject.clearCaches();
	}

	return modifiedRange;
};

/**
 * Get the index of the given node within its parent node
 * @param {DOMObject} node node to check
 * @return {Integer} index in the parent node or false if no node given or node has no parent
 * @method
 */
GENTICS.Utils.Dom.prototype.getIndexInParent = function (node) {
	if (!node) {
		return false;
	}
	var index = 0;
	var check = node.previousSibling;
	while(check) {
		index++;
		check = check.previousSibling;
	};

	return index;
};

/**
 * Check whether the given node is a blocklevel element
 * @param {DOMObject} node node to check
 * @return {boolean} true if yes, false if not (or null)
 * @method
 */
GENTICS.Utils.Dom.prototype.isBlockLevelElement = function (node) {
	if (!node) {
		return false;
	}
	if (node.nodeType == 1 && this.blockLevelElements[node.nodeName.toLowerCase()]) {
		return true;
	} else {
		return false;
	}
};

/**
 * Check whether the given node is a linebreak element
 * @param {DOMObject} node node to check
 * @return {boolean} true for linebreak elements, false for everything else
 * @method
 */
GENTICS.Utils.Dom.prototype.isLineBreakElement = function (node) {
	if (!node) {
		return false;
	}
	return node.nodeType == 1 && node.nodeName.toLowerCase() == 'br';
};

/**
 * Check whether the given node is a list element
 * @param {DOMObject} node node to check
 * @return {boolean} true for list elements (li, ul, ol), false for everything else
 * @method
 */
GENTICS.Utils.Dom.prototype.isListElement = function (node) {
	if (!node) {
		return false;
	}
	return node.nodeType == 1 && this.listElements[node.nodeName.toLowerCase()];
};

/**
 * This method checks, whether the passed dom object is a dom object, that would
 * be split in cases of pressing enter. This currently is true for paragraphs
 * and headings
 * @param {DOMObject} el
 *            dom object to check
 * @return {boolean} true for split objects, false for other
 * @method
 */
GENTICS.Utils.Dom.prototype.isSplitObject = function(el) {
	if (el.nodeType === 1){
		switch(el.nodeName.toLowerCase()) {
		case 'p':
		case 'h1':
		case 'h2':
		case 'h3':
		case 'h4':
		case 'h5':
		case 'h6':
		case 'li':
			return true;
		}
	}
	return false;
};

/**
 * Starting with the given position (between nodes), search in the given direction to an adjacent notempty text node
 * @param {DOMObject} parent parent node containing the position
 * @param {Integer} index index of the position within the parent node
 * @param {boolean} searchleft true when search direction is 'left' (default), false for 'right'
 * @param {object} stopat define at which types of element we shall stop, may contain the following properties
 * <pre>
 * - blocklevel (default: true)
 * - list (default: true)
 * - linebreak (default: true)
 * </pre>
 * @return {DOMObject} the found text node or false if none found
 * @method
 */
GENTICS.Utils.Dom.prototype.searchAdjacentTextNode = function (parent, index, searchleft, stopat) {
	if (!parent || parent.nodeType != 1 || index < 0 || index > parent.childNodes.length) {
		return false;
	}

	if (typeof stopat == 'undefined') {
		stopat = {'blocklevel' : true, 'list' : true, 'linebreak' : true};
	}

	if (stopat.blocklevel == 'undefined') {
		stopal.blocklevel = true;
	}
	if (stopat.list == 'undefined') {
		stopal.list = true;
	}
	if (stopat.linebreak == 'undefined') {
		stopal.linebreak = true;
	}

	if (typeof searchleft == 'undefined') {
		searchleft = true;
	}

	var nextNode = undefined;
	var currentParent = parent;

	// start at the node left/right of the given position
	if (searchleft && index > 0) {
		nextNode = parent.childNodes[index - 1];
	}
	if (!searchleft && index < parent.childNodes.length) {
		nextNode = parent.childNodes[index];
	}

	while (true) {
		if (!nextNode) {
			// no next node found, check whether the parent is a blocklevel element
			if (stopat.blocklevel && this.isBlockLevelElement(currentParent)) {
				// do not leave block level elements
				return false;
			} else if (stopat.list && this.isListElement(currentParent)) {
				// do not leave list elements
				return false;
			} else {
				// continue with the parent
				nextNode = searchleft ? currentParent.previousSibling : currentParent.nextSibling;
				currentParent = currentParent.parentNode;
			}
		} else if (nextNode.nodeType == 3 && jQuery.trim(nextNode.data).length > 0) {
			// we are lucky and found a notempty text node
			return nextNode;
		} else if (stopat.blocklevel && this.isBlockLevelElement(nextNode)) {
			// we found a blocklevel element, stop here
			return false;
		} else if (stopat.linebreak && this.isLineBreakElement(nextNode)) {
			// we found a linebreak, stop here
			return false;
		} else if (stopat.list && this.isListElement(nextNode)) {
			// we found a linebreak, stop here
			return false;
		} else if (nextNode.nodeType == 3) {
			// we found an empty text node, so step to the next
			nextNode = searchleft ? nextNode.previousSibling : nextNode.nextSibling;
		} else {
			// we found a non-blocklevel element, step into
			currentParent = nextNode;
			nextNode = searchleft ? nextNode.lastChild : nextNode.firstChild;
		}
	};
};

/**
 * Create the singleton object
 * @hide
 */
GENTICS.Utils.Dom = new GENTICS.Utils.Dom();
