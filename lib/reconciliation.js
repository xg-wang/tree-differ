const nodeTypeEnum = {
    TEXT_NODE: 3,
    COMMENT_NODE: 8
}

/**
 * Maps a list of nodes by their id or generated id.
 * @param {NodeList} nodes
 * @returns {Object}
 */
function mapElements(nodes) {
    var map = {}
      , tags = {}
      , node

    for (var i = 0; i < nodes.length; i++) {
        node = nodes[i]
        var id = node.id || generateId(node, tags)
        map[id] = node
        node._i = i
        node._id = id
    }

    return map
}

/**
 * Generates a unique id for a given node by its tag name and existing
 * tags used for disambiguation as well as a given counter per tag use.
 * @param {Node|Element|DocumentFragment} node
 * @param {Object} tags
 * @returns {string}
 */
function generateId(node, tags) {
    // get the tag or create one from the other node types
    var tag = node.tagName || 'x' + node.nodeType
    // set the counter or increment
    tags[tag] = (tags[tag] || 0) + 1
    return tag + tags[tag]
}

/**
 * Generates a list of Change which could be applied to base DOM tree
 * @param {Node|Element|DocumentFragment} target
 * @param {Node|Element|DocumentFragment} base
 * @returns {Array<Change>}
 */
function diff(target, base) {
    var changes = []

    // compare node type
    if (base.nodeType !== target.nodeType || base.tagName !== target.tagName) {
        changes.push({
            action: 'replaceNode',
            baseNode: base,
            targetNode: target
        })
        return changes
    }

    // exclude text node
    if (base.nodeType === nodeTypeEnum.TEXT_NODE ||
        base.nodeType === nodeTypeEnum.COMMENT_NODE) {
        if (base.nodeValue !== target.nodeValue) {
            changes.push({
                action: 'replaceText',
                baseNode: base,
                targetNode: target
            })
        }
        return changes
    }

    // compare node attribute
    if (base.attributes && target.attributes) {
        let attributes = target.attributes
        for (let i = 0; i < attributes.length; i++) {
            const targetValue = attributes[i].value
            const name = attributes[i].name

            const baseValue = base.getAttribute(name)
            // add || replace
            if (baseValue === null || baseValue !== targetValue) {
                changes.push({
                    action: 'setAttribute',
                    baseNode: base,
                    name: name,
                    targetValue: targetValue
                })
            }
        }
        // remove
        attributes = base.attributes
        for (let i = 0; i < attributes.length; i++) {
            const name = attributes[i].name
            if (target.getAttribute(name) === null) {
                changes.push({
                    action: 'removeAttribute',
                    baseNode: base,
                    name: name
                })
            }
        }

    }

    if (base.hasChildNodes() && target.hasChildNodes()) {
        let baseMap = mapElements(base.childNodes)
          , processed = {}
          , tags = {}
          , taragetChildNodes = target.childNodes

        for (let i = 0; i < taragetChildNodes.length; i++) {
            let targetNode = taragetChildNodes[i]
              , bound = base.childNodes[i]
              , id = targetNode.id || generateId(targetNode, tags)

            const existing = baseMap[id]
            if (existing) {
                if (existing !== bound) {
                    changes.push({
                        action: 'moveChildElement',
                        element: existing,
                        targetElement: targetNode,  // need to check equal
                        toIndex: i
                    })
                }
                const recursiveChanges = diff(targetNode, existing)
                changes = changes.concat(recursiveChanges)
            } else {
                changes.push({
                    action: 'insertChildElement',
                    element: targetNode,
                    toIndex: i,
                })
            }
            processed[id] = true
        }
        // remove unprocessed nodes
        for (let i = 0; i < base.childNodes.length; i++) {
            const node = base.childNodes[i]
            // TODO: is it like this?
            if (!processed[node._id]) {
                changes.push({
                    action: 'removeChildElement',
                    element: node,
                    fromIndex: i
                })
            }
            delete node._i
            delete node._id
        }
    }

    return changes
}

/**
 * @param {Node|Element|DocumentFragment} base
 * @param {Array<Change>} changes
 * @returns {}
 */
function apply(changes) {
    console.log('reconciliation apply')
}

module.exports = {
    diff: diff,
    apply: apply
}
