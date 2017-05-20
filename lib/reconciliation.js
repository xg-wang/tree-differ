/**
 * @param {Node|Element|DocumentFragment} source
 * @param {Node|Element|DocumentFragment} target
 * @returns {Array<Change>}
 */
function diff(base, target) {
    // target = Object.clone(target);
    let changes = []
    console.log('reconciliation diff')

    // compare node type
    if (base.type != target.type) {
        changes.push({
            'action': 'replaceNode',
            '_deleted': target,
            '_inserted': base
        })
        return changes
    }

    // exclude text node
    	if ((base.nodeType === TEXT_NODE && target.nodeType === TEXT_NODE) ||
  		(base.nodeType === COMMENT_NODE && target.nodeType === COMMENT_NODE)) {
	    if (base.nodeValue !== target.nodeValue) {
	    	changes.push({ 'baseValue': base.nodeValue,
	    				   'targetValue': target.nodeValue})
	    }
	}

	// compare node attribute
    if (source.attributes && target.attributes) {
        
    }

    return changes
}

/**
 * @param {Node|Element|DocumentFragment} base
 * @param {Array<Change>} changes
 * @returns {}
 */
function apply(base, changes) {
    console.log('reconciliation apply')
}

module.exports = {
    diff: diff,
    apply: apply
}
