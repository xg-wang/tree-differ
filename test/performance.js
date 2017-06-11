const fs = require('fs')
const Mocha = require('mocha')
const assert = require('assert')
const {JSDOM} = require('jsdom')
const reconciliation = require('../lib/reconciliation')
const zhsh = require('../lib/zhsh')

describe('performance tests', function() {
  const dirRoot = './html_files/performance';
  const dirs = fs.readdirSync(dirRoot).filter(dir => !dir.startsWith('.'))

  for (let dir of dirs) {
    describe(`${dir}`, function() {
      describe('reconcilliation', function() {
        let base = null, target = null, changes = null
        before(function() {
          const baseString = fs.readFileSync(`${dirRoot}/${dir}/base.html`, {encoding: 'utf8'})
          const targetString = fs.readFileSync(`${dirRoot}/${dir}/target.html`, {encoding: 'utf8'})
          base = new JSDOM(baseString).window.document.body
          target = new JSDOM(targetString).window.document.body
        })

        it('diff time', function() {
          changes = reconciliation.diff(target, base)
        })

        it('apply time', function() {
          base = reconciliation.apply(base, changes)
        })

        after('base should equal target after apply', function() {
          assert(base.isEqualNode(target))
        })
      })
    })
  }

  describe('Express_trimmed, Zhang Shasha', function() {
    let base = null, target = null, changes = null
    before(function() {
      const baseString = fs.readFileSync(`${dirRoot}/express_trimmed/base.html`, {encoding: 'utf8'})
      const targetString = fs.readFileSync(`${dirRoot}/express_trimmed/target.html`, {encoding: 'utf8'})
      base = new JSDOM(baseString).window.document.body
      target = new JSDOM(targetString).window.document.body
    })

    it('diff time', function() {
      this.timeout(100000)
      changes = zhsh.diff(target, base)
    })

    it('apply time', function() {
      base = zhsh.apply(base, changes)
    })

    after('base should equal target after apply', function() {
      assert(base.isEqualNode(target))
    })
  })

});
