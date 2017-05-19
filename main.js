const fs = require('fs')
const reconcilliation = require('./lib/reconciliation')
const jsdom = require("jsdom")
const {JSDOM} = jsdom

fs.readFile('html_files/bootstrap.html', (err, data) => {
    if (err) {
        throw err
    }
    const sourceString = data.toString()
    const source = new JSDOM(sourceString).window.document.body
    const targetString = sourceString.slice(0)
    const target = new JSDOM(targetString).window.document.body

    reconcilliation.diff(source, target)
})
