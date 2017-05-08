const fs = require('fs')
const reconcilliation = require('./lib/reconciliation')
const jsdom = require("jsdom")
const { JSDOM } = jsdom

fs.readFile('test_files/bootstrap.html', (err, data) => {
  if (err) {
    throw err
  }
  const sourceString = data.toString()
  const source = new JSDOM(sourceString).window.document
  // ...
})
