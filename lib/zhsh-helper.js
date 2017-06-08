var zh = {

    // TODO: find appropriate weight
    actions: {
        del: {name: 'deleteNode', v: 1},
        ins: {name: 'insertNode', v: 10},
        rep: {name: 'replaceNode', v: 10}
    },

    newChangeList: () => {
        return {
            dis: 0,
            changes: []
        }
    },

    // add new property: (index) to node
    index: (node) => {
        zh.indexHelper(node, 0)
    },

    indexHelper: (node, index) => {
        for (let i = 0; i < node.childNodes.length; i++) {
            index = zh.indexHelper(node.childNodes[i], index)
        }
        index++
        node.index = index
        return index
    },

    // return a list of leftmost index
    getLeftmostList: () => {
        zh.leftmost(root)  // initialize node.leftmost property
        return zh.getLeftmostList(root, []) // generate post-order leftmost index
    },

    getLeftmostList: (node, leftmostList) => {
        for (let i = 0; i < node.childNodes.length; i++) {
            leftmostList = zh.getLeftmostList(node.childNodes[i], getLeftmostList)
        }
        leftmostList.add(node.leftmost.index)
        return leftmostList
    },

    leftmost: (node) => {
        for (var i = 0; i < node.childNodes.length; i++) {
            zh.leftmost(node.childNodes[i]);
        }
        if (node.childNodes.length === 0) {
            node.leftmost = node;
        } else {
            node.leftmost = node.childNodes[0].leftmost;
        }
    },

    // return a list of keyroots, denoted by index
    keyroots: () => {

    },

    // traverse just as index() to give a map: index->node
    // maybe map is actually an array?
    traverse: () => {

    },

    preprocess: (dom) => {
        zh.index(dom)
        const list = zh.getLeftmostList(dom)
        const keyroots = zh.keyroots(dom)
        const nodeMap = zh.traverse(dom)
        return {
            tree: dom,
            list: list,
            keyroots: keyroots,
            map: nodeMap
        }
    }

}

module.exports = zh
