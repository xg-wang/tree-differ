const assert = require('assert')
const os = require('os')
const fs = require('fs')
const reconciliation = require('./lib/reconciliation')
const zhsh = require('./lib/zhsh')
const {JSDOM} = require("jsdom")
const {readFileString} = require('./lib/utils')

// TODO add test cases: removeChildElement, insertChildElement, moveChildElement
// const testsets = 'correctness'
const testsets = 'performance'
const testName = 'express'
const testZHSH = true
Promise.all([
  readFileString(`./html_files/${testsets}/${testName}/base.html`),
  readFileString(`./html_files/${testsets}/${testName}/target.html`)
]).then(values => {
  let base = new JSDOM(values[0]).window.document.body
  const target = new JSDOM(values[1]).window.document.body
  let changes = null

  const startMem = os.freemem()
  console.time('total time')
  console.time('diff time')
  if (testZHSH) {
    changes = zhsh.diff(target, base)
  } else {
    changes = reconciliation.diff(target, base)
  }
  console.timeEnd('diff time')

  console.log(`changes length: ${changes.length}`)

  console.time('apply time')
  if (testZHSH) {
    base = zhsh.apply(base, changes)
  } else {
    base = reconciliation.apply(base, changes)
  }
  console.timeEnd('apply time')
  console.timeEnd('total time')
  const endMem = os.freemem()

  assert(base.isEqualNode(target), 'applied base should equal target')
  console.log(`memory usage: ${endMem - startMem} bytes`)

}).catch(reason => {
  console.error(reason)
})
