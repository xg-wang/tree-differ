/**
 * Created by shihaoxu on 6/10/17.
 */
const fs = require('fs')
var Mocha = require('mocha');
var Chai = require('chai');
var Test = Mocha.Test;
var expect = Chai.expect;
const {readFileString} = require('../lib/utils')

var mochaInstance = new Mocha();
var suiteInstance = Mocha.Suite.create(mochaInstance.suite, 'Correctness Test Suite');

var inputDirs = []

var dirCorrectness = '../html_files/correctness'
fs.readdirSync(dirCorrectness).forEach(dir => {
    inputDirs.push(dir)
})

inputDirs.forEach(inputDir => {

    var dirFullPath = dirCorrectness + '/' + inputDir;

    suiteInstance.addTest(new Test(inputDir, function(){
        var baseHtml, targetHtml;
        return Promise.all([
            readFileString(dirFullPath + '/base.html'),
            readFileString(dirFullPath + '/target.html')
        ]).then(values => {
            baseHtml = values[0];
            targetHtml = values[1];
        })

        const reconciliation = require('../lib/reconciliation')
        let base = new JSDOM(base).window.document.body
        const target = new JSDOM(list2).window.document.body
        const targetClone = target.cloneNode(true)

        const changes = reconciliation.diff(target, base)
        assert(target.isEqualNode(targetClone), 'target is same')
        // console.dir(changes, {depth: 3, colors: true})

        base = reconciliation.apply(base, changes)
        assert(target.isEqualNode(targetClone), 'target is same')

        assert(base.isEqualNode(target), 'applied base should equal target')

    }))
})

mochaInstance.run();
