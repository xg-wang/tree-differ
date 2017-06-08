const assert = require('assert')
const zh = require('./zhsh-helper')
const {nodeTypeEnum, Array2D} = require('./utils')

/**
 * @typedef {{
 *    action: ('replace', 'remove', 'insert'),
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
    let changes = []
    // preprocessing 2 DOM
    const ppBase = zh.preprocess(base)
    base = ppBase.tree
    const baseList = ppBase.list, baseKeyroots = ppBase.keyroots
        , baseMap = ppBase.map
    const ppTarg = zh.preprocess(target)
    target = ppTarg.tree
    const targList = ppTarg.list, targKeyroots = ppTarg.keyroots
        , targMap = ppTarg.map

    // remember to take care of initialization!
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
  const del = zh.operations.delete
      , ins = zh.operations.insert
      , rep = zh.operations.replace
  forestDist[0][0] = zh.newChangeList()
  for (let i1 = list1[i - 1]; i1 <= i; i1++) {
    // forestDist[i1][0] = forestDist[i1 - 1][0] +
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
function apply(base, change) {
    return base
}

module.exports = {
    diff: diff,
    apply: apply
}
