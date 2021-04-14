/* eslint-disable prefer-arrow-callback */

import assert from 'assert'
import { Queue, Task } from '../src'

async function worker(task: Task): Promise<unknown> {
  return task.payload
}

describe('queue callbacks', function() {
  let queue: Queue | undefined

  afterEach(function() {
    if (queue) {
      queue.stop()
      queue = undefined
    }
  })

  it('onCancel, concurrent = 1, timeout = 1000', function(done) {
    this.timeout(3000)

    async function worker(task: Task): Promise<void> {
      await new Promise((resolve) => {
        setTimeout(() => resolve, 2000)
      })
    }

    queue = new Queue(worker, { concurrent: 1, timeout: 1000 })

    let task1 = false
    let task2 = false

    queue.push('foo', 0, {
      onCancel(reason) {
        assert.strictEqual(reason, 'stopped')
        task1 = true
      }
    })

    queue.push({ custom: 'lorem' }, 0, {
      onCancel(reason) {
        assert.strictEqual(reason, 'stopped')
        task2 = true
      }
    })

    queue.on('idle', () => {
      assert.strictEqual(task1, true, 'First task has not been cancelled.')
      assert.strictEqual(task2, false, 'Second task has been cancelled, but should not have even started.')
      done()
    })

    setTimeout(() => {
      queue.stop()
    }, queue.options.debounceDelay + queue.options.delay + 50)
  })

  it('onCancel, concurrent = 2, timeout = 1000', function(done) {
    this.timeout(3000)

    async function worker(task: Task): Promise<void> {
      await new Promise((resolve) => {
        setTimeout(() => resolve, 2000)
      })
    }

    queue = new Queue(worker, { concurrent: 2, timeout: 1000 })

    let task1 = false
    let task2 = false

    queue.push('foo', 0, {
      onCancel(reason) {
        assert.strictEqual(reason, 'stopped')
        task1 = true
      }
    })

    queue.push({ custom: 'lorem' }, 0, {
      onCancel(reason) {
        assert.strictEqual(reason, 'stopped')
        task2 = true
      }
    })

    queue.on('idle', () => {
      assert.strictEqual(task1, true, 'First task has not been cancelled.')
      assert.strictEqual(task2, true, 'Second task has not been cancelled.')
      done()
    })

    setTimeout(() => {
      queue.stop()
    }, queue.options.debounceDelay + queue.options.delay + 100)
  })

  it('onDiscarded', function(done) {
    let task1 = false
    let task2 = false

    queue = new Queue(worker)

    queue.push('foo', 0, {
      onDiscarded() {
        task1 = true
      }
    })

    queue.push({ custom: 'lorem' }, 0, {
      onDiscarded() {
        task2 = true
      }
    })

    queue.on('idle', () => {
      assert.strictEqual(task1, true, 'No event has been fired in the first task.')
      assert.strictEqual(task2, true, 'No event has been fired in the second task.')
      done()
    })

    queue.stop()
  })

  it('onStarted', function(done) {
    let task1 = false
    let task2 = false

    queue = new Queue(worker)

    queue.push('foo', 0, {
      onStarted() {
        task1 = true
      }
    })

    queue.push({ custom: 'lorem' }, 0, {
      onStarted() {
        task2 = true
      }
    })

    queue.on('finished', () => {
      assert.strictEqual(task1, true, 'No event has been fired in the first task.')
      assert.strictEqual(task2, true, 'No event has been fired in the second task.')
      done()
    })
  })

  it('onSuccess', function(done) {
    let task1 = false
    let task2 = false

    queue = new Queue(worker)

    queue.push('foo', 0, {
      onSuccess() {
        task1 = true
      }
    })

    queue.push({ custom: 'lorem' }, 0, {
      onSuccess() {
        task2 = true
      }
    })

    queue.on('finished', () => {
      assert.strictEqual(task1, true, 'No event has been fired in the first task.')
      assert.strictEqual(task2, true, 'No event has been fired in the second task.')
      done()
    })
  })

  it('onFailed', function(done) {
    let task1 = false
    let task2 = false

    async function worker(task: Task): Promise<unknown> {
      throw new Error('yikes')
    }

    queue = new Queue(worker)

    queue.push('foo', 0, {
      onFailed(err) {
        task1 = true
        assert.strictEqual(err.message, 'yikes')
      }
    })

    queue.push({ custom: 'lorem' }, 0, {
      onFailed(err) {
        task2 = true
        assert.strictEqual(err.message, 'yikes')
      }
    })

    queue.on('finished', () => {
      assert.strictEqual(task1, true, 'No event has been fired in the first task.')
      assert.strictEqual(task2, true, 'No event has been fired in the second task.')
      done()
    })
  })

  it('onFinished', function(done) {
    let task1 = false
    let task2 = false

    queue = new Queue(worker)

    queue.push('foo', 0, {
      onFinished() {
        task1 = true
      }
    })

    queue.push({ custom: 'lorem' }, 0, {
      onFinished() {
        task2 = true
      }
    })

    queue.on('finished', () => {
      assert.strictEqual(task1, true, 'No event has been fired in the first task.')
      assert.strictEqual(task2, true, 'No event has been fired in the second task.')
      done()
    })
  })
})