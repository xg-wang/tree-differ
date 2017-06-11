const assert = require('assert')
const fs = require('fs')
const reconciliation = require('./lib/reconciliation')
const zhsh = require('./lib/zhsh')
const {JSDOM} = require("jsdom")
const {readFileString} = require('./lib/utils')

// TODO add test cases: removeChildElement, insertChildElement, moveChildElement
// const testsets = 'correctness'
const testsets = 'performance'
const testName = 'express'
Promise.all([
  readFileString(`./html_files/${testsets}/${testName}/base.html`),
  readFileString(`./html_files/${testsets}/${testName}/target.html`)
]).then(values => {
  let base = new JSDOM(values[0]).window.document.body
  const target = new JSDOM(values[1]).window.document.body
  const targetClone = target.cloneNode(true)

  console.time('total time')
  console.time('diff time')
  const changes = zhsh.diff(target, base)
  console.timeEnd('diff time')
  // console.dir(changes, {depth: 3, colors: true})
  console.time('apply time')
  base = zhsh.apply(base, changes)
  console.timeEnd('apply time')
  console.timeEnd('total time')

  assert(target.isEqualNode(targetClone), 'target is same')
  assert(base.isEqualNode(target), 'applied base should equal target')

}).catch(reason => {
  console.error(reason)
})
