/**
 * Created by shihaoxu on 6/10/17.
 */
const fs = require('fs');
const Mocha = require('mocha');
const Chai = require('chai');
const Test = Mocha.Test;
const expect = Chai.expect;
const {readFileString} = require('../lib/utils');
const assert = require('assert');
const {JSDOM} = require("jsdom");

describe('correctness', function() {
    const dirStubs = [];
    const dirRoot = './html_files/correctness';
    fs.readdirSync(dirRoot).forEach(dir => {
        dirStubs.push(dir);
    });

    dirStubs.forEach(function(dirStub) {
        var moduleNames = ['reconciliation', 'zhsh'];
        moduleNames.forEach(function(moduleName) {

            it(dirStub + ' ' + moduleName, function() {

                const dirFullPath = dirRoot + '/' + dirStub;

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

                const changes = theModule.diff(target, base);
                assert(target.isEqualNode(targetClone), 'target is same');
                // console.dir(changes, {depth: 3, colors: true})

                base = theModule.apply(base, changes);
                assert(target.isEqualNode(targetClone), 'target is same');

                assert(base.isEqualNode(target), 'applied base should equal target');

            });

        });
    });
});
