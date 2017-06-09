const _ = require('lodash/core')
const assert = require('assert')
const zh = require('./zhsh-helper')
const {
  nodeTypeEnum,
  Array2D
} = require('./utils')

/**
 * @typedef {{
 *    action: ('replaceNode', 'removeNode', 'insertNode'),
 *    baseNode: (null|Node|Element|DocumentFragment),
 *    targetNode: (null|Node|Element|DocumentFragment),
 *    indexL (number)
 * }} Change
 * NOTICE: For replace, need to further check
 * tagName, nodeType, attributes when apply
 *
 * @typedef {{
 *    dis: (number),
 *    changes: (Change[])
 * }} ChangeList
 */


function getModifications(base, target, modifications) {
  if (!Array.isArray(modifications) || modifications.length !== 0) {
    modifications = []
  }
  assert(base.nodeType === target.nodeType && base.tagName !== target.tagName, 'node tag equal fail')

  // exclude text node
  if (base.nodeType === nodeTypeEnum.TEXT_NODE ||
    base.nodeType === nodeTypeEnum.COMMENT_NODE) {
    if (base.nodeValue !== target.nodeValue) {
      modifications.push({
        action: 'replaceText',
        targetValue: target.nodeValue
      })
    }
    return modifications
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
        modifications.push({
          action: 'setAttribute',
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
        modifications.push({
          action: 'removeAttribute',
          name: name
        })
      }
    }

  }
  return modifications
}
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
  const {del, ins, rep, mod} = zh.actions
  forestDist[0][0] = zh.newChangeList()
  // handle first row & first col
  for (let i1 = list1[i - 1]; i1 <= i; i1++) {
    const prevCL = forestDist[i1 - 1][0]
    forestDist[i1][0] = {
      dis: prevCL.dis + del.v,
      // TODO: this is critical: idx correct?
      changes: prevCL.changes.concat({
        action: del.name,
        baseNode: tree1.map[i1],
        targetNode: null,
        index: i1
      })
    }
  }
  for (let j1 = list2[j - 1]; j1 <= j; j1++) {
    const prevCL = forestDist[0][j1 - 1]
    forestDist[0][j1] = {
      dis: prevCL.dis + ins.v,
      changes: prevCL.changes.concat({
        action: ins.name,
        baseNode: null,
        targetNode: tree2.map[j1],
        index: j1
      })
    }
  }
  for (let i1 = list1[i - 1]; i1 <= i; i1++) {
    for (let j1 = list2[j - 1]; j1 <= j; j1++) {
      const iTemp = list1[i - 1] > i1 - 1 ? 0 : i1 - 1
      const jTemp = list2[j - 1] > j1 - 1 ? 0 : j1 - 1
      if (list1[i1 - 1] === list1[i - 1] && list2[j1 - 1] === list2[j - 1]) {
        const base = tree1.map[i1 - 1],
          target = tree2.map[j1 - 1]
        const act = (base.nodeType !== target.nodeType || base.tagName !== target.tagName) ?
          rep : mod
        let modifications = []
        if (act === mod) {
          modifications = getModifications(base, target, [])
        }
        const delDistance = forestDist[iTemp][j1].dis + del.v
        const insDistance = forestDist[i1][jTemp].dis + ins.v
        const actDistance = forestDist[iTemp][jTemp].dis + act.v
        const minDistance = _.min([delDistance, insDistance, actDistance])
        if (minDistance === delDistance) {
          forestDist[i1][j1] = {
            dis: delDistance,
            changes: forestDist[iTemp][j1].changes.concat([{
              action: del.name,
              baseNode: tree1.map[i1],
              targetNode: null,
              index: i1
            }])
          }
        } else if (minDistance === insDistance) {
          forestDist[i1][j1] = {
            dis: insDistance,
            changes: forestDist[i1][jTemp].changes.concat([{
              action: ins.name,
              baseNode: null,
              targetNode: tree2.map[j1],
              index: j1
            }])
          }
        } else {
          forestDist[i1][j1] = {
            dis: actDistance,
            changes: forestDist[iTemp][jTemp].changes.concat([{
              action: act.name,
              baseNode: tree1.map[i1],
              targetNode: tree2.map[j1],
              index: j1
            }])
          }
        }
      } else {
        let i1Temp = list1[i1 - 1] - 1
        let j1Temp = list2[j1 - 1] - 1
        let iTemp2 = list1[i - 1] > i1Temp ? 0 : i1Temp
        let jTemp2 = list2[j - 1] > j1Temp ? 0 : j1Temp
        const delDistance = forestDist[iTemp][j1].dis + del.v
        const insDistance = forestDist[i1][jTemp].dis + ins.v
        const TDDistance = forestDist[iTemp2][jTemp2].dis + TD[i1][j1].dis
        const minDistance = _.min([delDistance, insDistance, TDDistance])
        if (minDistance === delDistance) {
          forestDist[i1][j1] = {
            dis: delDistance,
            changes: forestDist[iTemp][j1].changes.concat([{
              action: del.name,
              baseNode: tree1.map[i1],
              targetNode: null,
              index: i1
            }])
          }
        } else if (minDistance === insDistance) {
          forestDist[i1][j1] = {
            dis: insDistance,
            changes: forestDist[i1][jTemp].changes.concat([{
              action: ins.name,
              baseNode: null,
              targetNode: tree2.map[j1],
              index: j1
            }])
          }
        } else {
          forestDist[i1][j1] = {
            dis: TDDistance,
            changes: forestDist[iTemp2][jTemp2].changes.concat(TD[i1][j1].changes)
          }
        }
      }
    }
  }

  return forestDist[i][j]
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
