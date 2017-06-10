// local helpers
const setLeftmost = (node) => {
  if (!node) return
  for (let i = 0; i < node.childNodes.length; i++) {
    setLeftmost(node.childNodes[i]);
  }
  if (node.childNodes.length === 0) {
    node._leftmost = node;
  } else {
    node._leftmost = node.childNodes[0]._leftmost;
  }
}
const getLeftmostListHelper = (node, leftmostList) => {
  for (let i = 0; i < node.childNodes.length; i++) {
    leftmostList = getLeftmostListHelper(node.childNodes[i], leftmostList)
  }
  leftmostList.push(node._leftmost._index)
  return leftmostList
}

// exported config and functions
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

  // add new property: (_index) to node
  setIndex: (root) => {
    const map = [] // NOTICE: index start from 1
    const _helper = (_map, _root, _index = 0) => {
      for (let i = 0; i < _root.childNodes.length; i++) {
        _index = _helper(_map, _root.childNodes[i], _index)
      }
      _index++
      _root._index = _index
      _map.push(_root)
      return _index
    }
    _helper(map, root, 0)
    return map
  },

  // return a list of leftmost index
  getLeftmostList: (root) => {
    setLeftmost(root) // initialize node.leftmost property
    return getLeftmostListHelper(root, []) // generate post-order leftmost index
  },

  // return a list of keyroots, denoted by index
  getKeyroots: (dom, list) => {
    let keyroots = []
    for (let i = 0; i < list.length; i++) {
      let flag = false
      for (let j = i + 1; j < list.length; j++) {
        if (list[j] === list[i]) {
          flag = true
          break
        }
      }
      if (!flag) {
        keyroots.push(i + 1)
      }
    }
    return keyroots
  },

  preprocess: (dom) => {
    const nodeMap = zh.setIndex(dom)
    const list = zh.getLeftmostList(dom)
    const keyroots = zh.getKeyroots(dom, list)
    return {
      tree: dom,
      list: list,
      keyroots: keyroots,
      map: nodeMap
    }
  }

}

module.exports = zh