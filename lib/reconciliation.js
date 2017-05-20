nodeTypeEnum = {
    TEXT_NODE: 3,
    COMMENT_NODE: 8
}

function mapElements(nodes) {
    var map = {};
    var tags = {};
    var node;

    var indices = [];
    for (var i = 0, len=nodes.length; i<len; i++) {
        node = nodes[i];
        var id = (node.id) ? node.id : generateId(node, tags);
        map[id] = node;
        node._i = i;
        node._id = id;
        indices.push(i);
    }

    return map;
}

function generateId(node, tags) {
    // get the tag or create one from the other node types
    var tag = (node.tagName) ? node.tagName : 'x' + node.nodeType;

    // set the counter to zero
    if (!tags[tag]) {
        tags[tag] = 0;
    }

    // increment the counter for that tag
    tags[tag]++;

    return tag + tags[tag];
}

function diff(base, target) {
    let changes = []
    console.log('reconciliation diff')

    // compare node type
    if (base.nodeType !== target.nodeType || base.tagName !== target.tagName) {
        changes.push({
            'action': 'replaceNode',
            '_deleted': target,
            '_inserted': base
        })
        return changes
    }

    // exclude text node
    if (base.nodeType === nodeTypeEnum.TEXT_NODE ||
        base.nodeType === nodeTypeEnum.COMMENT_NODE) {
        if (base.nodeValue !== target.nodeValue) {
            changes.push({
                'action': 'replaceText',
                'baseValue': base.nodeValue,
                'targetValue': target.nodeValue
            })
        }
        return changes
    }

    // compare node attribute
    if (base.attributes && target.attributes) {
        let attributes = base.attributes, value, name
        let len = attributes.length
        for (let i = 0; i < len; i++) {
            value = attributes[i].nodeValue
            name = attributes[i].nodeName

            let val = target.getAttribute(name);
            // add
            if (val === null) {
                changes.push({
                    'action': 'setAttribute',
                    'name': name,
                    '_inserted': value
                })
            // replace
            } else if (val !== value) {
                changes.push({
                    'action': 'setAttribute',
                    'name': name,
                    '_deleted': val,
                    '_inserted': value
                })
            }
        }

        // remove
        attributes = target.attributes;
        for (let i = 0; i < attributes.length; i++) {
            name = attributes[i].nodeName
            if (base.getAttribute(name) === null) {
                changes.push({
                    'action': 'removeAttribute',
                    'name': name,
                    '_deleted': target.getAttribute(name)
                })
            }
        }
    }

    if (base.childNodes && target.childNodes) {
        var map = mapElements(target.childNodes),
            tags = {},
            nodes = base.childNodes;

        var moves = [];
        for (var i = 0, len = nodes.length; i < len; i++) {
            var node = nodes[i],
                bound = target.childNodes[i],
                id = (node.id) ? node.id : generateId(node, tags);

            var existing = map[id];
            if (existing) {
                if (existing !== bound) {
                    changes.push({
                        'action': 'moveChildElement',
                        'element': existing,
                        'targetIndex': existing._i,
                        'sourceIndex': i});
                    target.insertBefore(existing, bound);
                }
            } else {
                var inserted = node.cloneNode(true);
                changes.push({ 'action': 'insertChildElement',
                    'element': inserted,
                    'targetIndex': i,
                    'sourceIndex': i});
                target.insertBefore(inserted, bound);
            }
        }

        while (target.childNodes.length > base.childNodes.length) {
            var remove = target.childNodes[target.childNodes.length - 1];
            changes.push({ 'action': 'removeChildElement',
                'element': remove,
                'targetIndex': remove._i,
                'sourceIndex': null});
            target.removeChild(remove);
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
