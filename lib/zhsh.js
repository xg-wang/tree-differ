const assert = require('assert')
const { nodeTypeEnum } = require('./utils')
const zh = require('./zhsh-helper')


/**TODO: change order of base and target!
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
    const ppTarg = zh.preprocess(target)
    target = ppTarg.tree
    const targList = ppTarg.list, targKeyroots = ppTarg.keyroots

    // remember to take care of initialization!
    // TD stores the tree distance and change[]
    // TD: {dis: number, changes: Change[]}
    const TD = []
    for (let i = 0; i < baseList.length + 1; i++) {
      TD.push(new Array(targList.length + 1))
    }


    for (let iBase = 1; iBase < baseKeyroots.length + 1; iBase++) {
      for (let iTarg = 1; iTarg < targKeyroots.length + 1; iTarg++) {
        let i = baseKeyroots[iBase - 1]
          , j = targKeyroots[iTarg - 1]
        TD[i][j] = treedist(baseList, targList, i, j, base, target)
      }
    }

    return TD[baseList.length][targList.length].changes
}

/**
 * @param {any} list1
 * @param {any} list2
 * @param {int} i
 * @param {int} j
 * @param {Node|Element|DocumentFragment} tree1
 * @param {Node|Element|DocumentFragment} tree2
 */
function treedist(list1, list2, i, j, tree1, tree2) {

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
    if (!change || !base) {
        throw 'Input error!'
    } else if (Array.isArray(change)) {
        change.forEach(c => {
            base = apply(base, c)
        })
        return base
    }
    // now change is a single object: <Change>
    assert(base === change.baseNode, 'base should be change.baseNode')
    const action = change.action
    if (action === 'replaceNode') {
        base = change.targetNode.cloneNode(true)
    } else if (action === 'replaceText') {
        base.textContent = (change.name, change.targetValue)
    } else if (action === 'setAttribute') {
        base.setAttribute(change.name, change.targetValue)
    } else if (action === 'removeAttribute') {
        base.removeAttribute(change.name)
    } else if (action === 'moveChildren') {
        // first clear base's childNodes,
        while (base.firstChild) {
            base.removeChild(base.firstChild)
        }
        // then append recursively one by one
        for (let i = 0; i < change.targetChildren.length; i++) {
            base.appendChild(change.targetChildren[i].cloneNode(true))
        }
    } else if (action === 'handleChildren') {
        handleChildNodes(base, change.childChanges)
    }
    return base
}

module.exports = {
    diff: diff,
    apply: apply
}
