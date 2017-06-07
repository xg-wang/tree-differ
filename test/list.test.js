const fs = require('fs')
const assert = require('assert')
const jsdom = require("jsdom")
const {JSDOM} = jsdom;

describe('List test', function() {
  var list1, list2;
  before(function () {
    return Promise.all([
      readFileString('./html_files/list1.html'),
      readFileString('./html_files/list2.html')
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

function readFileString(fileName) {
  return new Promise(function(resolve, reject) {
    fs.readFile(fileName, (err, data) => {
      if (err) {
          return reject(err)
      }
      resolve(data.toString())
    })
  })
}