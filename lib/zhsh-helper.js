var zh = {

  // TODO: find appropriate weight
  operations: {
    delete: {name: 'delete', v: 1},
    insert: {name: 'insert', v: 10},
    replace: {name: 'replace', v: 10}
  },

  newChangeList: () => {
    return {
      dis: 0,
      changes: []
    }
  },

  // add new property: (index) to node
  index: () => {

  },

  // return a list of leftmost index
  l: () => {

  },

  // return a list of keyroots, denoted by index
  keyroots: () => {

  },

  // traverse just as index() to give a map: index->node
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
