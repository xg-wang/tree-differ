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

    var changes

    changes = reconcilliation.diff(target, base)
    console.dir(changes, {depth: 3, colors: true})
    base = reconcilliation.apply(changes)
    if (base.isEqualNode(target)) {
        console.log("Diff & Apply Success ~")
    } else {
        console.log("Diff & Apply Error!!!!!!!")
    }

    // changes = reconcilliation.diff(target, base)
    // reconcilliation.apply(changes)
    // console.log(changes)
    // if (base.isEqualNode(target)) {
    //     console.log("Diff & Apply Success ~")
    // } else {
    //     console.log("Diff & Apply Error!!!!!!!")
    // }

    // fs.writeFile("html_files/result.html", base.innerHTML, function(err) {})




})
