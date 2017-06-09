var zh = {

  // TODO: find appropriate weight
  actions: {
    del: {name: 'deleteNode', v: 1},
    ins: {name: 'insertNode', v: 10},
    rep: {name: 'replaceNode', v: 10},
    mod: {name: 'modifyNode', v: 0}
  },

    newChangeList: () => {
        return {
            dis: 0,
            changes: []
        }
    },

    // add new property: (index) to node
    index: (root) => {
        zh.indexHelper(root, 0)
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
    getLeftmostList: (root) => {
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
    getKeyroots: () => {
        let keyroots = []
        for (let i = 0; i < zh.list.length; i++) {
            let flag = 0;
            for (let j = i + 1; j < zh.list.length; j++) {
                if (zh.list[j] === zh.list[i]) {
                    flag = 1;
                }
            }
            if (flag === 0) {
                this.keyroots.add(i + 1);
            }
        }
        return keyroots
    },

    // traverse just as index() to give a map: index->node
    // maybe map is actually an array?
    traverse: (root) => {
        let labels = []
        return zh.traverseHelper(root, labels)
    },

    traverseHelper: (node, labels) => {
        for (let i = 0; i < node.childNodes.length; i++) {
            labels = zh.traverseHelper(node.childNodes[i], labels)
        }
        labels.add(node.label)
        return labels
    },

    preprocess: (dom) => {
        zh.index(dom)
        const list = zh.getLeftmostList(dom)
        const keyroots = zh.getKeyroots()
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
