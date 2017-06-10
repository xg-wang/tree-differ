/**
 * Created by shihaoxu on 6/10/17.
 */
const fs = require('fs')
const Mocha = require('mocha');
const Chai = require('chai');
const Test = Mocha.Test;
const expect = Chai.expect;
const {readFileString} = require('../lib/utils');
const assert = require('assert')
const {JSDOM} = require("jsdom")

const createTestSuite = function(mochaInstance, moduleName) {
    const suiteInstance = Mocha.Suite.create(mochaInstance.suite, 'Performance Test Suite for ' + moduleName);

    const dirStubs = [];

    const dirRoot = 'html_files/performance';
    fs.readdirSync(dirRoot).forEach(dir => {
        dirStubs.push(dir)
    });

    dirStubs.forEach(dirStub => {

        const dirFullPath = dirRoot + '/' + dirStub;

        suiteInstance.addTest(new Test(dirStub, function () {
            let baseHtml, targetHtml;
            Promise.all([
                readFileString(dirFullPath + '/base.html'),
                readFileString(dirFullPath + '/target.html')
            ]).then(values => {
                baseHtml = values[0];
                targetHtml = values[1];
            });

            const theModule = require('../lib/' + moduleName);
            let base = new JSDOM(baseHtml).window.document.body;
            const target = new JSDOM(targetHtml).window.document.body;
            const targetClone = target.cloneNode(true);

            const start = +new Date();

            console.time('diff');
            const changes = theModule.diff(target, base);
            assert(target.isEqualNode(targetClone), 'target is same');
            // console.dir(changes, {depth: 3, colors: true})
            console.timeEnd('diff');

            const end = +new Date();
            console.log("all users saved in " + (end - start) + " milliseconds");

            console.time('apply');
            base = theModule.apply(base, changes);
            assert(target.isEqualNode(targetClone), 'target is same');
            console.timeEnd('apply');

            assert(base.isEqualNode(target), 'applied base should equal target')

        }))
    })
};

const mochaInstance = new Mocha({
    ui: 'bdd',
    reporter: 'spec'
});
createTestSuite(mochaInstance, 'reconciliation');
createTestSuite(mochaInstance, 'zhsh');

mochaInstance.run();
