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
        for (var i = 0; i < node.childNodes.length; i++) {
            index = zh.indexHelper(node.childNodes[i], index)
        }
        index++
        node.index = index
        return index
    },

    // return a list of leftmost index
    leftmost: () => {

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
        const list = zh.l(dom)
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
