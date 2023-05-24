/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable import/no-named-as-default-member */

import assert from 'assert'
import sinon from 'sinon'
import { Retry, retry } from '../src'

sinon.usingPromise(Promise)

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe('Retry', () => {
  beforeEach(function() {
    this.itReject = new Error('Rejected')
    this.itResolves = 'Resolved'
  })

  it('retries = 1', async function() {
    const callback = sinon.stub()
    callback.rejects(this.itReject)

    const promise = retry(callback, {
      retries: 1
    })

    await assert.rejects(promise)
    assert.strictEqual(callback.callCount, 2)
  })

  it('retries = 3', async function() {
    const callback = sinon.stub()
    callback.rejects(this.itReject)

    const promise = retry(callback, {
      retries: 3
    })

    await assert.rejects(promise)
    assert.strictEqual(callback.callCount, 4)
  })

  it('retries = 10, resolved on attempt 4', async function() {
    const callback = sinon.stub()
    callback.rejects(this.itReject)
    callback.onCall(4).resolves(this.itResolves)

    const promise = retry(callback, {
      retries: 10,
      onFailedAttempt(err, options, stats) {
        assert.strictEqual(options.retry, true)
        assert.strictEqual(stats.callCount, callback.callCount)
        assert.strictEqual(stats.retryCount, callback.callCount - 1)
      }
    })

    await assert.doesNotReject(promise)
    assert.strictEqual(callback.callCount, 5)
  })

  it('timeout = 1000, resolved', async function() {
    const callback = sinon.stub()
    callback.returns(delay(900))

    const promise = retry(callback, {
      timeout: 1000
    })

    await assert.doesNotReject(promise)
    assert.strictEqual(callback.callCount, 1)
  })

  it('timeout = 1900, timed out', async function() {
    const callback = sinon.stub()
    callback.returns(delay(3500))

    const promise = retry(callback, {
      timeout: 1900
    })

    await assert.rejects(promise, (err: Error) => {
      assert.strictEqual(err.name, 'TimeoutError')
      return true
    })

    assert.strictEqual(callback.callCount, 1)
  })

  it('timeout = 1500, timed out on attempt 4', async function() {
    const callback = sinon.stub()
    callback.rejects(this.itReject)
    callback.onCall(4).returns(delay(3500))

    const promise = retry(callback, {
      timeout: 1500,
      onFailedAttempt(err, options, stats) {
        assert.strictEqual(options.retry, true)
        assert.strictEqual(stats.callCount, callback.callCount)
        assert.strictEqual(stats.retryCount, callback.callCount - 1)
      }
    })

    await assert.rejects(promise, (err: Error) => {
      assert.strictEqual(err.name, 'TimeoutError')
      return true
    })

    assert.strictEqual(callback.callCount, 5)
  })
})
