/* eslint-disable prefer-arrow-callback */

import assert from 'assert'
import { Queue, Task } from '../src/queue'

async function worker(task: Task): Promise<unknown> {
  await new Promise((resolve) => {
    setTimeout(() => { resolve(task.payload) }, 100)
  })

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

  it('started, { autoStart: false }', function(done) {
    queue = new Queue(worker, { autoStart: false })

    queue.on('started', () => {
      assert.strictEqual(queue.sizeBy({ running: true }), 0)
      done()
    })

    queue.push('foo')
    queue.push({ custom: 'lorem' })

    queue.start()
  })

  it('started', function(done) {
    queue = new Queue(worker)

    queue.on('started', () => {
      assert.strictEqual(queue.sizeBy({ running: true }), 0)
      done()
    })

    queue.push('foo')
    queue.push({ custom: 'lorem' })

    queue.pause()

    setTimeout(() => {
      queue.start()
    }, 500)
  })

  it('paused', function(done) {
    queue = new Queue(worker)

    queue.push('foo')
    queue.push({ custom: 'lorem' })

    queue.on('paused', () => {
      assert.strictEqual(queue.sizeBy({ running: true }), 1)
      done()
    })

    setTimeout(() => {
      queue.pause()
    }, 500)
  })

  it('stopped', function(done) {
    queue = new Queue(worker)

    queue.push('foo')
    queue.push({ custom: 'lorem' })

    queue.on('stopped', () => {
      assert.strictEqual(queue.sizeBy({ running: true }), 0)
      done()
    })

    setTimeout(() => {
      queue.stop()
    }, 500)
  })

  it('stopped -> idle', function(done) {
    queue = new Queue(worker)

    queue.push('foo')
    queue.push({ custom: 'lorem' })

    queue.once('idle', () => {
      assert.strictEqual(queue.sizeBy({ running: true }), 0)
      done()
    })

    setTimeout(() => {
      queue.stop()
    }, 200)
  })

  it('idle', function(done) {
    queue = new Queue(worker)

    queue.push('foo')
    queue.push({ custom: 'lorem' })

    queue.once('idle', () => {
      assert.strictEqual(queue.sizeBy({ running: true }), 0)
      done()
    })
  })

  it('finished', function(done) {
    queue = new Queue(worker)

    queue.push('foo')
    queue.push({ custom: 'lorem' })

    queue.once('finished', () => {
      assert.strictEqual(queue.sizeBy({ running: true }), 0)
      done()
    })
  })

  it('group:started', function(done) {
    queue = new Queue(worker, { concurrent: 2 })

    queue.push('foo')
    queue.push({ custom: 'lorem' })

    queue.on('group:started', () => {
      assert.strictEqual(queue.sizeBy({ running: true }), 0)
      done()
    })
  })

  it('group:finished', function(done) {
    queue = new Queue(worker, { concurrent: 2 })

    queue.push('foo')
    queue.push({ custom: 'lorem' })

    queue.on('group:finished', () => {
      assert.strictEqual(queue.sizeBy({ running: true }), 0)
      done()
    })
  })

  it('task:added', function(done) {
    queue = new Queue(worker, { concurrent: 2 })
    let count = 0

    queue.on('task:added', () => {
      count += 1
    })

    queue.push('foo')
    queue.push({ custom: 'lorem' })

    queue.on('finished', () => {
      assert.strictEqual(queue.sizeBy({ running: true }), 0)
      assert.strictEqual(count, 2)
      done()
    })
  })

  it('task:started', function(done) {
    queue = new Queue(worker, { concurrent: 2 })

    queue.push('foo')
    queue.push({ custom: 'lorem' })

    let count = 0

    queue.on('task:started', () => {
      count += 1
    })

    queue.on('finished', () => {
      assert.strictEqual(queue.sizeBy({ running: true }), 0)
      assert.strictEqual(count, 2)
      done()
    })
  })

  it('task:success', function(done) {
    queue = new Queue(worker, { concurrent: 2 })

    queue.push('foo')
    queue.push({ custom: 'lorem' })

    let count = 0

    queue.on('task:success', () => {
      count += 1
    })

    queue.on('finished', () => {
      assert.strictEqual(queue.sizeBy({ running: true }), 0)
      assert.strictEqual(count, 2)
      done()
    })
  })

  it('task:failed', function(done) {
    async function worker(task: Task): Promise<unknown> {
      throw new Error('test')
    }

    queue = new Queue(worker, { concurrent: 2, throwOnError: false })

    queue.push('foo')
    queue.push({ custom: 'lorem' })

    let count = 0

    queue.on('task:failed', (task: Task, err: Error) => {
      assert.strictEqual(err.message, 'test')
      count += 1
    })

    queue.on('finished', () => {
      assert.strictEqual(queue.sizeBy({ running: true }), 0)
      assert.strictEqual(count, 2)
      done()
    })
  })

  it('task:finished', function(done) {
    queue = new Queue(worker, { concurrent: 2 })

    queue.push('foo')
    queue.push({ custom: 'lorem' })

    let count = 0

    queue.on('task:finished', () => {
      count += 1
    })

    queue.on('finished', () => {
      assert.strictEqual(queue.sizeBy({ running: true }), 0)
      assert.strictEqual(count, 2)
      done()
    })
  })

  it('task:discarded', function(done) {
    queue = new Queue(worker, { concurrent: 2 })

    queue.push('foo')
    queue.push({ custom: 'lorem' })

    let count = 0

    queue.on('task:discarded', () => {
      count += 1
    })

    queue.on('idle', () => {
      assert.strictEqual(queue.sizeBy({ running: true }), 0)
      assert.strictEqual(count, 2)
      done()
    })

    queue.stop()
  })

  it('task:cancelled', function(done) {
    queue = new Queue(worker, { concurrent: 2 })

    queue.push('foo')
    queue.push({ custom: 'lorem' })

    let count = 0

    queue.on('task:cancelled', () => {
      count += 1
    })

    queue.on('idle', () => {
      assert.strictEqual(queue.sizeBy({ running: true }), 0)
      assert.strictEqual(count, 2)
      done()
    })

    setTimeout(() => {
      queue.stop()
    }, queue.options.debounceDelay + queue.options.delay + 50)
  })
})