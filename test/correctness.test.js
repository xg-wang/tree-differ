const fs = require('fs')
const Mocha = require('mocha')
const assert = require('assert')
const {JSDOM} = require('jsdom')
const reconciliation = require('../lib/reconciliation')
const zhsh = require('../lib/zhsh')

describe('correctness tests', function() {
  const dirRoot = './html_files/correctness';
  const dirs = fs.readdirSync(dirRoot).filter(dir => !dir.startsWith('.'))

  for (let dir of dirs) {
    describe(`${dir}`, function() {
      let base = null, base2 = null, target = null
      beforeEach(function() {
        const baseString = fs.readFileSync(`${dirRoot}/${dir}/base.html`, {encoding: 'utf8'})
        const targetString = fs.readFileSync(`${dirRoot}/${dir}/target.html`, {encoding: 'utf8'})
        base = new JSDOM(baseString).window.document.body
        base2 = base.cloneNode(true)
        target = new JSDOM(targetString).window.document.body
      })

      it('reconcilliation should pass', function() {
        const changes = reconciliation.diff(target, base)
        base = reconciliation.apply(base, changes)
        assert(base.isEqualNode(target))
      })
      it('zhang shasha should pass', function() {
        const changes = zhsh.diff(target, base2)
        base2 = zhsh.apply(base2, changes)
        assert(base2.isEqualNode(target))
      })
    })
  }
});
