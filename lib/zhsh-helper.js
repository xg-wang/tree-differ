var zh = {

  // TODO: find appropriate weight
  operations: {
    delete: {name: 'delete', v: 1},
    insert: {name: 'insert', v: 10},
    replace: {name: 'replace', v: 10}
  },

  index: () => {

  },

  l: () => {

  },

  keyroots: () => {

  },

  traverse: () => {

  },

  preprocess: (dom) => {
    zh.index(dom)
    const list = zh.l(dom)
    const keyroots = zh.keyroots(dom)
    zh.traverse(dom)
    return {
      tree: dom,
      list: list,
      keyroots: keyroots
    }
  }

}

module.exports = zh
