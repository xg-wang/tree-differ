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

// TODO add test cases: removeChildElement, insertChildElement, moveChildElement

Promise.all([
    readFileString('html_files/list1.html'),
    readFileString('html_files/list2.html')
]).then(values => {
    let base = new JSDOM(values[0]).window.document.body
    const target = new JSDOM(values[1]).window.document.body
    const targetClone = target.cloneNode(true)

    const changes = reconcilliation.diff(target, base)
    console.log('target is same', target.isEqualNode(targetClone))
    console.dir(changes, {depth: 3, colors: true})
    base = reconcilliation.apply(base, changes)
    console.log('target is same', target.isEqualNode(targetClone))
    if (base.isEqualNode(targetClone)) {
        console.log("Diff & Apply Success ~")
    } else {
        console.log("Diff & Apply Error!!!!!!!")
    }

    // fs.writeFile("html_files/result.html", base.innerHTML, function(err) {})




})
