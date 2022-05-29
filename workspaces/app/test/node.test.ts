/* eslint-disable prefer-arrow-callback */

import assert from 'assert'
import { platform } from 'os'
import * as app from '../src'

describe('typescript', function() {
  describe('getPlatform()', function() {
    it('should be string', function() {
      assert.equal(typeof app.getPlatform(), 'string')
    })

    it('should return the same as process.platform', function() {
      assert.strictEqual(app.getPlatform(), platform())
      assert.strictEqual(app.getPlatform(), process.platform)
    })

    it('win32', function() {
      assert.strictEqual(app.getPlatform() === 'win32', process.platform === 'win32')
    })

    it('darwin', function() {
      assert.strictEqual(app.getPlatform() === 'darwin', process.platform === 'darwin')
    })

    it('linux', function() {
      assert.strictEqual(app.getPlatform() === 'linux', process.platform === 'linux')
    })

    it('android', function() {
      assert.strictEqual(app.getPlatform() === 'android', process.platform === 'android')
    })
  })

  describe('getPath()', function() {
    it('should be string', async function() {
      assert.equal(typeof await app.getPath('home'), 'string')
    })
  })
})
