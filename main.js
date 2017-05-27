const fs = require('fs')
const reconcilliation = require('./lib/reconciliation')
const jsdom = require("jsdom")
const {JSDOM} = jsdom

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

Promise.all([
    readFileString('html_files/github1.html'),
    readFileString('html_files/github3.html')
]).then(values => {
    const base = new JSDOM(values[0]).window.document.body
    const target = new JSDOM(values[1]).window.document.body
    const changes = reconcilliation.diff(target, base)
    console.log(changes)
})
