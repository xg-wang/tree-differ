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
                targetValue: target.nodeValue
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

    const baseHasChildren = base.hasChildNodes()
        , targetHasChildren = target.hasChildNodes()
    // end here if both no children
    if (!baseHasChildren && !targetHasChildren) {
        return changes
    }
    let childrenChanges = null
    // recursion if both have children
    if (baseHasChildren && targetHasChildren) {
        childrenChanges = {
            action: 'handleChildren',
            baseNode: base,
            childChanges: []
        }
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
                childrenChanges.childChanges.push({
                    action: existing === bound ? 'holdChildElement' : 'moveChildElement',
                    element: existing,
                    targetElement: targetNode,  // need to check equal
                    parentElement: base,
                    index: i,
                    recursiveChanges: diff(targetNode, existing)
                })
            } else {
                childrenChanges.childChanges.push({
                    action: 'insertChildElement',
                    element: targetNode,
                    parentElement: base,
                    index: i
                })
            }
            processed[id] = true
        }
        // remove unprocessed nodes
        for (let i = 0; i < base.childNodes.length; i++) {
            const node = base.childNodes[i]
            // TODO: is it like this?
            if (!processed[node._id]) {
                childrenChanges.childChanges.push({
                    action: 'removeChildElement',
                    element: node,
                    parentElement: base,
                    index: i
                })
            }
            delete node._i
            delete node._id
        }
        // sort childChanges based on index
        childrenChanges.childChanges.sort((a, b) => a.index - b.index)
    } else { // else just remove all base children and add from target
        childrenChanges = {
            action: 'moveChildren',
            baseNode: base,
            targetChildren: target.childNodes
        }
    }
    changes.push(childrenChanges)
    return changes
}

/**
 * @param {Array<Change>} changes
 * @returns {}
 */
function apply(change) {
    if (!change) {
        throw 'Input change is null!'
    } else if (Array.isArray(change)) {
        change.forEach(apply)
    }
    // now change is a single object: <Change>
    const action = change['action']
    if (action === 'setAttribute') {
        change['baseNode'].setAttribute(change['name'], change['targetValue'])
    }
    else if (action === 'removeAttribute') {
        change['baseNode'].removeAttribute(change['name'])
    }
    else if (action === 'replaceText') {
        change['baseNode'].textContent = (change['name'], change['targetValue'])
    }
    else if (action === 'handleChildrens') {
        apply(change['childChanges'])
    }
    else if (action === 'holdChildElement') {

    }
    else if (action === 'removeChildElement') {
        change['parentElement'].removeChild(change['element'])
    }
    else if (action === 'insertChildElement') {
        var nodeAfter = change['parentElement'].childNodes[change['index']]
        change['parentElement'].insertBefore(change['element'], nodeAfter)
    }
    else if (action === 'moveChildElement') {
        var nodeAfter = change['parentElement'].childNodes[change['index']]
        change['parentElement'].insertBefore(change['element'], nodeAfter)
        change['parentElement'].removeChild(change['element'])
    }
    if ('recursiveChanges' in change) {
        apply(childChange['recursiveChanges'])
    }
}

/**
 * base.action is among these:
 * - replaceNode, replaceText
 * - setAttribute, removeAttribute
 * - handleChildren:
 *   (holdChildElement, moveChildElement, insertChildElement, removeChildElement)
 * - moveChildren
 *
 * @param {Node|Element|DocumentFragment} base
 * @param {Change|Array<Change>} change
 * @returns {Node|Element|DocumentFragment}
 */
function anotherApply(base, change) {
    if (!change || !base) {
        throw 'Input error!'
    } else if (Array.isArray(change)) {
        change.forEach(c => {
            base = anotherApply(base, c)
        })
    }
    // now change is a single object: <Change>
    const action = change.action
    if (action === 'replaceNode') {
        change.baseNode = change.targetNode.cloneNode(true)
    } else if (action === 'replaceText') {
        change.baseNode.textContent = (change.name, change.targetValue)
    } else if (action === 'setAttribute') {
        change.baseNode.setAttribute(change.name, change.targetValue)
    } else if (action === 'removeAttribute') {
        change.baseNode.removeAttribute(change.name)
    } else if (action === 'moveChildren') {
        // first clear base's childNodes,
        while (base.firstChild) {
            base.removeChild(base.firstChild)
        }
        // then append recursively one by one
        for (let i = 0; i < change.targetChildren.length; i++) {
            base.appendChild(change.targetChildren[i].cloneNode(true))
        }
    } else if (action === 'handleChildren') {
        // TODO:
        // change.baseNode = apply(change.baseNode, change.childChanges)i
    } else if (action === 'removeChildElement') {
        // change['parentElement'].removeChild(change['element'])
    } else if (action === 'insertChildElement') {
        // var nodeAfter = change['parentElement'].childNodes[change['index']]
        // change['parentElement'].insertBefore(change['element'], nodeAfter)
    } else if (action === 'holdChildElement') {

    } else if (action === 'moveChildElement') {
        // handleRecursive(change)
    return base
}
/**
 * For holdChildElement and moveChildElement
 *
 * @param {Change} change
 * @returns
 */
function handleRecursive(change) {
    if (change.recursiveChanges) {
        return change. = apply(childChange['recursiveChanges'])
    }
}

module.exports = {
    diff: diff,
    apply: apply
}
