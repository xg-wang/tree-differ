const _ = require('lodash/core')
const assert = require('assert')
const zh = require('./zhsh-helper')
const {
  nodeTypeEnum,
  Array2D
} = require('./utils')

/**
 * @typedef {{
 *    action: ('replaceNode', 'modifyNode', 'removeNode', 'insertNode'),
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
  assert(base.nodeType === target.nodeType && base.tagName === target.tagName, 'node tag equal fail')

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
function diff(target, base) {
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
  const TD = Array2D(baseList.length + 1, targList.length + 1, zh.newChangeList())
  for (let iBase = 1; iBase < baseKeyroots.length + 1; iBase++) {
    for (let iTarg = 1; iTarg < targKeyroots.length + 1; iTarg++) {
      let i = baseKeyroots[iBase - 1]
        , j = targKeyroots[iTarg - 1]
      console.log(`${i}, ${j} treedist starts`)
      TD[i][j] = treedist(TD, baseList, targList, i, j, base, target)
    }
  }

  // we want all insert actions be last executed,
  // and, in their own order
  const ret = TD[baseList.length][targList.length].changes
  ret.sort((a, b) => {
    const ai = a.action === 'insertNode', bi = b.action === 'insertNode'
    if (ai && !bi) {
      return 1
    } else if (!ai && bi) {
      return -1
    } else if (ai && bi) {
      return b.index - a.index
    } else {
      return a.index - b.index
    }
  })
  delete base.map
  delete target.map
  zh.removeIndex(base)
  zh.removeIndex(target)
  return ret
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
  let forestDist = Array2D(i + 1, j + 1, zh.newChangeList())
  const {del, ins, rep, mod} = zh.actions
  // handle first row & first col
  for (let i1 = list1[i - 1]; i1 <= i; i1++) {
    const prevCL = forestDist[i1 - 1][0]
    forestDist[i1][0] = {
      dis: prevCL.dis + del.v,
      changes: prevCL.changes.concat([{
        action: del.name,
        baseNode: tree1.map[i1 - 1],
        targetNode: null,
        index: i1
      }])
    }
  }
  for (let j1 = list2[j - 1]; j1 <= j; j1++) {
    const prevCL = forestDist[0][j1 - 1]
    const tN = tree2.map[j1 - 1]
    forestDist[0][j1] = {
      dis: prevCL.dis + ins.v,
      changes: prevCL.changes.concat([{
        action: ins.name,
        baseNode: null,
        targetNode: tN,
        index: j1,
        parentIndex: tN.parentNode ? tN.parentNode._index : null,
        nextSiblingIndex: tN.nextSibling ? tN.nextSibling._index : null,
        firstChildIndex: tN.firstChild ? tN.firstChild._index : null
      }])
    }
  }
  for (let i1 = list1[i - 1]; i1 <= i; i1++) {
    for (let j1 = list2[j - 1]; j1 <= j; j1++) {
      const iTemp = list1[i - 1] > i1 - 1 ? 0 : i1 - 1
      const jTemp = list2[j - 1] > j1 - 1 ? 0 : j1 - 1
      if (list1[i1 - 1] === list1[i - 1] && list2[j1 - 1] === list2[j - 1]) {
        const base = tree1.map[i1 - 1],
          target = tree2.map[j1 - 1]
        let act = (base === null || target === null || base.nodeType !== target.nodeType || base.tagName !== target.tagName) ?
          rep : mod
        let modifications = []
        if (act === mod) {
          modifications = getModifications(base, target, [])
          act.v = modifications.length
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
              baseNode: tree1.map[i1 - 1],
              targetNode: null,
              index: i1
            }])
          }
        } else if (minDistance === insDistance) {
          const tN = tree2.map[j1 - 1]
          forestDist[i1][j1] = {
            dis: insDistance,
            changes: forestDist[i1][jTemp].changes.concat([{
              action: ins.name,
              baseNode: null,
              targetNode: tN,
              index: j1,
              parentIndex: tN.parentNode ? tN.parentNode._index : null,
              nextSiblingIndex: tN.nextSibling ? tN.nextSibling._index : null,
              firstChildIndex: tN.firstChild ? tN.firstChild._index : null
            }])
          }
        } else {
          const newAction = {
            action: act.name,
            baseNode: tree1.map[i1 - 1],
            targetNode: tree2.map[j1 - 1],
            index: j1
          }
          if (act === mod) {
            newAction.modifications = modifications
          }
          forestDist[i1][j1] = {
            dis: actDistance,
            changes: forestDist[iTemp][jTemp].changes.concat([
              newAction
            ])
          }
        }
        TD[i1][j1] = forestDist[i1][j1]
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
              baseNode: tree1.map[i1 - 1],
              targetNode: null,
              index: i1
            }])
          }
        } else if (minDistance === insDistance) {
          const tN = tree2.map[j1 - 1]
          forestDist[i1][j1] = {
            dis: insDistance,
            changes: forestDist[i1][jTemp].changes.concat([{
              action: ins.name,
              baseNode: null,
              targetNode: tN,
              index: j1,
              parentIndex: tN.parentNode ? tN.parentNode._index : null,
              nextSiblingIndex: tN.nextSibling ? tN.nextSibling._index : null,
              firstChildIndex: tN.firstChild ? tN.firstChild._index : null
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
 * - modifyNode, insertNode, deleteNode
 *
 * @param {Node|Element|DocumentFragment} base
 * @param {Change|Array<Change>} change
 * @returns {Node|Element|DocumentFragment}
 */
function apply(base, changes) {
  if (!changes || !base) {
    throw 'Input error!'
  } else if (!Array.isArray(changes)) {
    throw 'changes not array!'
  } else {
    base.map = zh.setIndex(base)
    changes.forEach(c => {
      base = applyChange(base, c)
    })
    delete base.map
    zh.removeIndex(base)
    return base
  }
}
function applyChange(base, change) {
  // now change is a single object: <Change>
  const action = change.action
      , baseNode = change.baseNode
      , targNode = change.targetNode
  if (action === 'deleteNode') {
    assert(!targNode)
    assert(baseNode.parentNode) // what if parentNode not exist?
    const newNode = baseNode.firstChild
    if (newNode) {
      // move all siblings to newNode's childNodes
      while (newNode.nextSibling) {
        // this automatically cut the parent relation
        newNode.appendChild(newNode.nextSibling)
      }
      baseNode.parentNode.replaceChild(newNode, baseNode)
    } else {
      baseNode.parentNode.removeChild(baseNode)
    }
    // sync the map
    if (base.map[change.index - 1] === baseNode) {
      base.map[change.index - 1] = null
    }
  } else if (action === 'replaceNode') {
    assert(baseNode.parentNode)
    assert(targNode)
    const newNode = targNode.cloneNode(false)
    while (baseNode.firstChild) {
      newNode.appendChild(baseNode.firstChild)
    }
    baseNode.parentNode.replaceChild(newNode, baseNode)
    // sync the map
    if (base.map[baseNode._index - 1] === baseNode) {
      // if this has not been moved from another Node
      base.map[baseNode._index - 1] = null
    }
    newNode._index = change.index
    base.map[change.index - 1] = newNode
  } else if (action === 'modifyNode') {
    // change _index
    // modifications include
    // replaceText, setAttribute, removeAttribute
    const modifications = change.modifications
    for (let mod of modifications) {
      if (mod.action === 'replaceText') {
        baseNode.textContent = mod.targetValue
      } else if (mod.action === 'setAttribute') {
        baseNode.setAttribute(mod.name, mod.targetValue)
      } else if (mod.action === 'removeAttribute') {
        baseNode.removeAttribute(mod.name)
      }
    }
    // sync the map
    if (base.map[baseNode._index - 1] === baseNode) {
      // if this has not been moved from another Node
      base.map[baseNode._index - 1] = null
    }
    baseNode._index = change.index
    base.map[change.index - 1] = baseNode
  } else { // action === 'insertNode'
    assert(!baseNode)
    const newNode = targNode.cloneNode(false)
    // NOTICE, at this step we should have all other nodes processed
    // case insert has three auxiliary indices to help identify the location:
    // (parentIndex, nextSiblingIndex, firstChildIndex)
    const fc = change.firstChildIndex
        ? base.map[change.firstChildIndex - 1] : null
    const ns = change.nextSiblingIndex
        ? base.map[change.nextSiblingIndex - 1] : null
    const pt = change.parentIndex
        ? base.map[change.parentIndex - 1] : base.parentNode
    if (!fc) { // no child to handle, just insert
      pt.insertBefore(newNode, ns)
    } else { // we need to move all childNodes first
      while (fc.nextSibling !== ns) {
        newNode.appendChild(fc.nextSibling)
      }
      const replaced = pt.replaceChild(newNode, fc)
      newNode.insertBefore(replaced, newNode.firstChild)
    }
    // sync the map
    newNode._index = change.index
    base.map[change.index - 1] = newNode
  }

  return base
}

module.exports = {
  diff: diff,
  apply: apply
}
