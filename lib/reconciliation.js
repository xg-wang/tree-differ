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
	    	changes.push({ 'action': 'replaceText',
                           'baseValue': base.nodeValue,
	    				   'targetValue': target.nodeValue})
	    }
	}

	// compare node attribute
    if (base.attributes && target.attributes) {
        let attributes = base.attributes, value, name
        let len = attributes.length
        for(let i = 0; i < len; i++) {
            value = attributes[i].nodeValue
            name = attributes[i].nodeName

            let val = target.getAttribute(name);
            if(val === null) {
                changes.push({ 'action': 'setAttribute',
                               'name' : name,
                               '_inserted': value})
            } else if (val !== value) {
                changes.push({ 'action': 'setAttribute',
                               'name' : name,
                               '_deleted': val,
                               '_inserted': value})
            }
        }

        attributes = target.attributes;
        for(let i = 0; i < attributes.length; i++) {
            name = attributes[i].nodeName
            if (base.getAttribute(name) === null) {
                changes.push({ 'action': 'removeAttribute',
                               'name' : name,
                               '_deleted': target.getAttribute(name)})
            }
        }
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
