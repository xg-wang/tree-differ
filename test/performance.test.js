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
var suiteInstance = Mocha.Suite.create(mochaInstance.suite, 'Performance Test Suite');

var dirStubs = []

var dirRoot = '../html_files/performance'
fs.readdirSync(dirRoot).forEach(dir => {
    dirStubs.push(dir)
})

console.log('111')

dirStubs.forEach(dirStub => {

    var dirFullPath = dirRoot + '/' + dirStub;

    suiteInstance.addTest(new Test(dirStub, function(){
        var baseHtml, targetHtml;
        return Promise.all([
            readFileString(dirFullPath + '/base.html'),
            readFileString(dirFullPath + '/target.html')
        ]).then(values => {
            baseHtml = values[0];
            targetHtml = values[1];
        });

        const reconciliation = require('../lib/reconciliation');
        let base = new JSDOM(base).window.document.body;
        const target = new JSDOM(list2).window.document.body;
        const targetClone = target.cloneNode(true);

        var start = +new Date();

        console.time('diff');
        const changes = reconciliation.diff(target, base);
        assert(target.isEqualNode(targetClone), 'target is same');
        // console.dir(changes, {depth: 3, colors: true})
        console.timeEnd('diff');

        var end = +new Date();
        console.log("all users saved in " + (end-start) + " milliseconds");

        console.time('apply');
        base = reconciliation.apply(base, changes);
        assert(target.isEqualNode(targetClone), 'target is same');
        console.timeEnd('apply');

        assert(base.isEqualNode(target), 'applied base should equal target')

    }))
})

mochaInstance.run();
