/**
 * Created by shihaoxu on 6/10/17.
 */

const fs = require('fs');
const assert = require('assert');
const {JSDOM} = require("jsdom");
const {readFileString} = require('../lib/utils');

describe('firebase test', function() {
    let baseHtml, targetHtml;

    before(function () {
        Promise.all([
            readFileString('./html_files/performance/firebase/base.html'),
            readFileString('./html_files/performance/firebase/target.html')
        ]).then(values => {
            baseHtml = values[0];
            targetHtml = values[1];
        })
    });

    describe('Reconciliation test', function() {
        let reconciliation, base, target, targetClone, changes;

        before(function () {
            reconciliation = require('../lib/reconciliation');
            base = new JSDOM(baseHtml).window.document.body;
            target = new JSDOM(targetHtml).window.document.body;
            targetClone = target.cloneNode(true);
        });

        it('diff', function() {
            changes = reconciliation.diff(target, base);
        });

        it('apply', function() {
            assert(changes);
            base = reconciliation.apply(base, changes);
        });

        after(function() {
            assert(target.isEqualNode(targetClone), 'target is same');
            assert(base.isEqualNode(target), 'applied base should equal target')
        })
    })

    describe('Zhsh test', function() {
        let zhsh, base, target, targetClone, changes;

        before(function () {
            zhsh = require('../lib/zhsh');
            base = new JSDOM(baseHtml).window.document.body;
            target = new JSDOM(targetHtml).window.document.body;
            targetClone = target.cloneNode(true);
        });

        it('diff', function() {
            changes = zhsh.diff(target, base);
        });

        it('apply', function() {
            assert(changes);
            base = zhsh.apply(base, changes);
        });

        after(function() {
            assert(target.isEqualNode(targetClone), 'target is same');
            assert(base.isEqualNode(target), 'applied base should equal target')
        })
    })
});

describe('github test', function() {
    let baseHtml, targetHtml;

    before(function () {
        Promise.all([
            readFileString('./html_files/performance/github/base.html'),
            readFileString('./html_files/performance/github/target.html')
        ]).then(values => {
            baseHtml = values[0];
            targetHtml = values[1];
        })
    });

    describe('Reconciliation test', function() {
        let reconciliation, base, target, targetClone, changes;

        before(function () {
            reconciliation = require('../lib/reconciliation');
            base = new JSDOM(baseHtml).window.document.body;
            target = new JSDOM(targetHtml).window.document.body;
            targetClone = target.cloneNode(true);
        });

        it('diff', function() {
            changes = reconciliation.diff(target, base);
        });

        it('apply', function() {
            base = reconciliation.apply(base, changes);
        });

        after(function() {
            assert(target.isEqualNode(targetClone), 'target is same');
            assert(base.isEqualNode(target), 'applied base should equal target')
        })
    });

    describe('Zhsh test', function() {
        let zhsh, base, target, targetClone, changes;

        before(function () {
            zhsh = require('../lib/zhsh');
            base = new JSDOM(baseHtml).window.document.body;
            target = new JSDOM(targetHtml).window.document.body;
            targetClone = target.cloneNode(true);
        });

        it('diff', function() {
            changes = zhsh.diff(target, base);
        });

        it('apply', function() {
            base = zhsh.apply(base, changes);
        });

        after(function() {
            assert(target.isEqualNode(targetClone), 'target is same');
            assert(base.isEqualNode(target), 'applied base should equal target')
        })
    });
});

describe('wsj test', function() {
    let baseHtml, targetHtml;

    before(function () {
        Promise.all([
            readFileString('./html_files/performance/wsj/base.html'),
            readFileString('./html_files/performance/wsj/target.html')
        ]).then(values => {
            baseHtml = values[0];
            targetHtml = values[1];
        })
    });

    describe('Reconciliation test', function() {
        let reconciliation, base, target, targetClone, changes;

        before(function () {
            reconciliation = require('../lib/reconciliation');
            base = new JSDOM(baseHtml).window.document.body;
            target = new JSDOM(targetHtml).window.document.body;
            targetClone = target.cloneNode(true);
        });

        it('diff', function() {
            changes = reconciliation.diff(target, base);
        });

        it('apply', function() {
            base = reconciliation.apply(base, changes);
        });

        after(function() {
            assert(target.isEqualNode(targetClone), 'target is same');
            assert(base.isEqualNode(target), 'applied base should equal target')
        })
    });

    describe('Zhsh test', function() {
        let zhsh, base, target, targetClone, changes;

        before(function () {
            zhsh = require('../lib/zhsh');
            base = new JSDOM(baseHtml).window.document.body;
            target = new JSDOM(targetHtml).window.document.body;
            targetClone = target.cloneNode(true);
        });

        it('diff', function() {
            changes = zhsh.diff(target, base);
        });

        it('apply', function() {
            base = zhsh.apply(base, changes);
        });

        after(function() {
            assert(target.isEqualNode(targetClone), 'target is same');
            assert(base.isEqualNode(target), 'applied base should equal target')
        })
    });
});


describe('wsj test', function() {
    let baseHtml, targetHtml;

    before(function () {
        Promise.all([
            readFileString('./html_files/performance/wsj/base.html'),
            readFileString('./html_files/performance/wsj/target.html')
        ]).then(values => {
            baseHtml = values[0];
            targetHtml = values[1];
        })
    });

    describe('Reconciliation test', function() {
        let reconciliation, base, target, targetClone, changes;

        before(function () {
            reconciliation = require('../lib/reconciliation');
            base = new JSDOM(baseHtml).window.document.body;
            target = new JSDOM(targetHtml).window.document.body;
            targetClone = target.cloneNode(true);
        });

        it('diff', function() {
            changes = reconciliation.diff(target, base);
        });

        it('apply', function() {
            base = reconciliation.apply(base, changes);
        });

        after(function() {
            assert(target.isEqualNode(targetClone), 'target is same');
            assert(base.isEqualNode(target), 'applied base should equal target')
        })
    });

    describe('Zhsh test', function() {
        let zhsh, base, target, targetClone, changes;

        before(function () {
            zhsh = require('../lib/zhsh');
            base = new JSDOM(baseHtml).window.document.body;
            target = new JSDOM(targetHtml).window.document.body;
            targetClone = target.cloneNode(true);
        });

        it('diff', function() {
            changes = zhsh.diff(target, base);
        });

        it('apply', function() {
            base = zhsh.apply(base, changes);
        });

        after(function() {
            assert(target.isEqualNode(targetClone), 'target is same');
            assert(base.isEqualNode(target), 'applied base should equal target')
        })
    });
});

describe('hand test', function() {
    let baseHtml, targetHtml;

    before(function () {
        Promise.all([
            readFileString('./html_files/performance/hand/base.html'),
            readFileString('./html_files/performance/hand/target.html')
        ]).then(values => {
            baseHtml = values[0];
            targetHtml = values[1];
        })
    });

    describe('Reconciliation test', function() {
        let reconciliation, base, target, targetClone, changes;

        before(function () {
            reconciliation = require('../lib/reconciliation');
            base = new JSDOM(baseHtml).window.document.body;
            target = new JSDOM(targetHtml).window.document.body;
            targetClone = target.cloneNode(true);
        });

        it('diff', function() {
            changes = reconciliation.diff(target, base);
        });

        it('apply', function() {
            base = reconciliation.apply(base, changes);
        });

        after(function() {
            assert(target.isEqualNode(targetClone), 'target is same');
            assert(base.isEqualNode(target), 'applied base should equal target')
        })
    });

    describe('Zhsh test', function() {
        let zhsh, base, target, targetClone, changes;

        before(function () {
            zhsh = require('../lib/zhsh');
            base = new JSDOM(baseHtml).window.document.body;
            target = new JSDOM(targetHtml).window.document.body;
            targetClone = target.cloneNode(true);
        });

        it('diff', function() {
            changes = zhsh.diff(target, base);
        });

        it('apply', function() {
            base = zhsh.apply(base, changes);
        });

        after(function() {
            assert(target.isEqualNode(targetClone), 'target is same');
            assert(base.isEqualNode(target), 'applied base should equal target')
        })
    });
});
