const fs = require('fs')
const reconcilliation = require('./lib/reconciliation')
const jsdom = require("jsdom")
const {JSDOM} = jsdom

fs.readFile('html_files/bootstrap.html', (err, data) => {
    if (err) {
        throw err
    }
    const baseString = data.toString()
    const base = new JSDOM(baseString).window.document.body
    const targetString = baseString.slice(0)
    const target = new JSDOM(targetString).window.document.body

    changes = reconcilliation.diff(base, target)
    console.log(changes)
})
