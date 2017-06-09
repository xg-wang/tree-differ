const fs = require('fs')
const assert = require('assert')
const {JSDOM} = require("jsdom")
const {readFileString} = require('../lib/utils')


describe('Comment Node Diff Test', function() {
  var list1, list2;
  before(function () {
    return Promise.all([
      readFileString('./html_files/commentNodeDiff/base.html'),
      readFileString('./html_files/commentNodeDiff/target.html')
    ]).then(values => {
      list1 = values[0]
      list2 = values[1]
    })
  })

  it ('should pass', function() {
    const reconciliation = require('../lib/reconciliation')
    let base = new JSDOM(list1).window.document.body
    const target = new JSDOM(list2).window.document.body
    const targetClone = target.cloneNode(true)

    const changes = reconciliation.diff(target, base)
    assert(target.isEqualNode(targetClone), 'target is same')
    // console.dir(changes, {depth: 3, colors: true})

    base = reconciliation.apply(base, changes)
    assert(target.isEqualNode(targetClone), 'target is same')

    assert(base.isEqualNode(target), 'applied base should equal target')
  })
})


describe('Github Test', function() {
  var list1, list2;
  before(function () {
    return Promise.all([
      readFileString('./html_files/github/base.html'),
      readFileString('./html_files/github/target.html')
    ]).then(values => {
      list1 = values[0]
      list2 = values[1]
    })
  })

  it ('should pass', function() {
    const reconciliation = require('../lib/reconciliation')
    let base = new JSDOM(list1).window.document.body
    const target = new JSDOM(list2).window.document.body
    const targetClone = target.cloneNode(true)

    const changes = reconciliation.diff(target, base)
    assert(target.isEqualNode(targetClone), 'target is same')
    // console.dir(changes, {depth: 3, colors: true})

    base = reconciliation.apply(base, changes)
    assert(target.isEqualNode(targetClone), 'target is same')

    assert(base.isEqualNode(target), 'applied base should equal target')
  })
})


describe('Wall Street Journal Test', function() {
  var list1, list2;
  before(function () {
    return Promise.all([
      readFileString('./html_files/wsj/base.html'),
      readFileString('./html_files/wsj/target.html')
    ]).then(values => {
      list1 = values[0]
      list2 = values[1]
    })
  })

  it ('should pass', function() {
    const reconciliation = require('../lib/reconciliation')
    let base = new JSDOM(list1).window.document.body
    const target = new JSDOM(list2).window.document.body
    const targetClone = target.cloneNode(true)

    const changes = reconciliation.diff(target, base)
    assert(target.isEqualNode(targetClone), 'target is same')
    // console.dir(changes, {depth: 3, colors: true})

    base = reconciliation.apply(base, changes)
    assert(target.isEqualNode(targetClone), 'target is same')

    assert(base.isEqualNode(target), 'applied base should equal target')
  })
})


describe('Firebase Test', function() {
  var list1, list2;
  before(function () {
    return Promise.all([
      readFileString('./html_files/firebase/base.html'),
      readFileString('./html_files/firebase/target.html')
    ]).then(values => {
      list1 = values[0]
      list2 = values[1]
    })
  })

  it ('should pass', function() {
    const reconciliation = require('../lib/reconciliation')
    let base = new JSDOM(list1).window.document.body
    const target = new JSDOM(list2).window.document.body
    const targetClone = target.cloneNode(true)

    const changes = reconciliation.diff(target, base)
    assert(target.isEqualNode(targetClone), 'target is same')
    // console.dir(changes, {depth: 3, colors: true})

    base = reconciliation.apply(base, changes)
    assert(target.isEqualNode(targetClone), 'target is same')

    assert(base.isEqualNode(target), 'applied base should equal target')
  })
})


