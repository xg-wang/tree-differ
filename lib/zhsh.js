const _ = require('lodash/core')
const assert = require('assert')
const zh = require('./zhsh-helper')
const {nodeTypeEnum, Array2D} = require('./utils')

/**
 * @typedef {{
 *    action: ('replaceNode', 'removeNode', 'insertNode'),
 *    baseNode: (Node|Element|DocumentFragment),
 *    targetNode: (Node|Element|DocumentFragment)
 * }} Change
 * NOTICE: For replace, need to further check
 * tagName, nodeType, attributes when apply
 *
 * @typedef {{
 *    dis: (number),
 *    changes: (Change[])
 * }} ChangeList
 */

/**
 * TODO: change order of base and target!
 * Generates a list of Change which could be applied to base DOM tree
 * @param {Node|Element|DocumentFragment} base
 * @param {Node|Element|DocumentFragment} target
 * @returns {Array<Change>}
 */
function diff(base, target) {
    // preprocessing 2 DOM
    const ppBase = zh.preprocess(base)
    base = ppBase.tree
    base.map = ppBase.map
    const baseList = ppBase.list, baseKeyroots = ppBase.keyroots
    const ppTarg = zh.preprocess(target)
    target = ppTarg.tree
    target.map = ppTarg.map
    const targList = ppTarg.list, targKeyroots = ppTarg.keyroots

    // TD stores the tree distance and change[]
    // TD: ChangeList[][]
    const TD = Array2D(baseList.length + 1, targList.length + 1)

    for (let iBase = 1; iBase < baseKeyroots.length + 1; iBase++) {
      for (let iTarg = 1; iTarg < targKeyroots.length + 1; iTarg++) {
        let i = baseKeyroots[iBase - 1]
          , j = targKeyroots[iTarg - 1]
        TD[i][j] = treedist(TD, baseList, targList, i, j, base, target)
      }
    }

    return TD[baseList.length][targList.length].changes
}

/**
 * @param {ChangeList[][]} TD
 * @param {(Node|Element|DocumentFragment)[]} list1
 * @param {(Node|Element|DocumentFragment)[]} list2
 * @param {int} i
 * @param {int} j
 * @param {Node|Element|DocumentFragment} tree1
 * @param {Node|Element|DocumentFragment} tree2
 */
function treedist(TD, list1, list2, i, j, tree1, tree2) {
  // @type {ChangeList[][]}
  let forestDist = Array2D(i + 1, j + 1)
  const {del, ins, rep} = zh.actions
  forestDist[0][0] = zh.newChangeList()
  // handle first row & first col
  for (let i1 = list1[i - 1]; i1 <= i; i1++) {
    const prevCL = forestDist[i1 - 1][0]
    forestDist[i1][0] = {
      dis: prevCL.dis + del.v,
      // TODO: this is critical: idx correct?
      changes: prevCL.changes.concat({
                 action: del.name,
                 baseNode: tree1.map[i1 - 1],
                 targetNode: tree2.map[i1]
               })
    }
  }
  for (let j1 = list2[j - 1]; j1 <= j; j1++) {
    const prevCL = forestDist[0][j1 - 1]
    forestDist[0][j1] = {
      dis: prevCL.dis + ins.v,
      changes: prevCL.changes.concat({
                 action: ins.name,
                 baseNode: tree1.map[j1 - 1],
                 targetNode: tree2.map[j1]
               })
    }
  }
  for (let i1 = list1[i - 1]; i1 <= i; i1++) {
    for (let j1 = list2[j - 1]; j1 <= j; j1++) {
      const iTemp = list1[i - 1] > i1 - 1 ? 0 : i1 - 1
      const jTemp = list2[j - 1] > j1 - 1 ? 0 : j1 - 1
      if (list1[i1 - 1] === list1[i - 1] && list2[j1 - 1] === list2[j - 1]) {

      }
    }
  }

  return forestDist[i][j]
}
/**
 * TODO: do we need this?
 * @param {ChangeList} cl
 * @param {{name: string, v: number}} action
 * @returns
 */
function increaseChangeList(cl, action) {
  const newCL = zh.newChangeList()
  newCL.dis = cl.dis + action.v
  newCL.changes = cl.changes.concat({
    action: action.name,
  })
  return newCL
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
function apply(base, change) {
    return base
}

module.exports = {
    diff: diff,
    apply: apply
}
