/**
 * @param {Node|Element|DocumentFragment} source
 * @param {Node|Element|DocumentFragment} target
 * @returns {Array<Change>}
 */
function diff(source, target) {
    let changes = []
    console.log('reconciliation diff')


    return changes
}

/**
 * @param {Node|Element|DocumentFragment} base
 * @param {Array<Change>} changes
 * @returns {}
 */
function apply(base, changes) {
    console.log('reconciliation apply')
}

module.exports = {
    diff: diff,
    apply: apply
}
