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
    var tags = {}
    var node

    var indices = []
    for (var i = 0, len=nodes.length; i<len; i++) {
        node = nodes[i]
        var id = (node.id) ? node.id : generateId(node, tags)
        map[id] = node
        node._i = i
        node._id = id
        indices.push(i)
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
    var tag = (node.tagName) ? node.tagName : 'x' + node.nodeType

    // set the counter to zero
    if (!tags[tag]) {
        tags[tag] = 0
    }

    // increment the counter for that tag
    tags[tag]++

    return tag + tags[tag]
}

/**
 * @param {Node|Element|DocumentFragment} source
 * @param {Node|Element|DocumentFragment} target
 * @returns {Array<Change>}
 */
function diff(base, target) {
    const changes = []

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
        for (const attribute of target.attributes) {
            const targetValue = attribute.value
            const name = attribute.name

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
            // remove
            for (const attribute of base.attributes) {
                const name = attribute.name
                if (target.getAttribute(name) === null) {
                    changes.push({
                        action: 'removeAttribute',
                        baseNode: base,
                        name: name
                    })
                }
            }
        }

    if (base.childNodes && target.childNodes) {
        var map = mapElements(target.childNodes),
            tags = {},
            nodes = base.childNodes

        for (var i = 0, len = nodes.length; i < len; i++) {
            var node = nodes[i],
                bound = target.childNodes[i],
                id = (node.id) ? node.id : generateId(node, tags)

            var existing = map[id]
            if (existing) {
                if (existing !== bound) {
                    changes.push({
                        'action': 'moveChildElement',
                        'element': existing,
                        'targetIndex': existing._i,
                        'sourceIndex': i})
                    target.insertBefore(existing, bound)
                }
            } else {
                var inserted = node.cloneNode(true)
                changes.push({ 'action': 'insertChildElement',
                    'element': inserted,
                    'targetIndex': i,
                    'sourceIndex': i})
                target.insertBefore(inserted, bound)
            }
        }

        while (target.childNodes.length > base.childNodes.length) {
            var remove = target.childNodes[target.childNodes.length - 1]
            changes.push({ 'action': 'removeChildElement',
                'element': remove,
                'targetIndex': remove._i,
                'sourceIndex': null})
            target.removeChild(remove)
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
