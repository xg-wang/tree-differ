const assert = require('assert')
const fs = require('fs')
const reconciliation = require('./lib/reconciliation')
const zhsh = require('./lib/zhsh')
const {JSDOM} = require("jsdom")
const {readFileString} = require('./lib/utils')

// TODO add test cases: removeChildElement, insertChildElement, moveChildElement
const baseDir = './html_files/correctness'
const testName = 'moveChild'
Promise.all([
    readFileString(`${baseDir}/${testName}/base.html`),
    readFileString(`${baseDir}/${testName}/target.html`)
]).then(values => {
    let base = new JSDOM(values[0]).window.document.body
    const target = new JSDOM(values[1]).window.document.body
    const targetClone = target.cloneNode(true)

    const changes = zhsh.diff(target, base)
    assert(target.isEqualNode(targetClone), 'target is same')
    // console.dir(changes, {depth: 3, colors: true})

    base = zhsh.apply(base, changes)
    assert(target.isEqualNode(targetClone), 'target is same')

    assert(base.isEqualNode(target), 'applied base should equal target')

    // fs.writeFile("html_files/result.html", base.innerHTML, function(err) {})
})
