/* eslint-disable prefer-arrow-callback */

import assert from 'assert'
import { Queue, Task } from '../src'

async function worker(task: Task): Promise<unknown> {
  return task.payload
}

describe('queue options', function() {
  let queue: Queue

  afterEach(function() {
    if (queue) {
      queue.stop()
      queue = undefined
    }
  })

  it('concurrent = 1', function(done) {
    queue = new Queue(worker, { concurrent: 1 })

    queue.once('group:finished', () => {
      // First group (of 1 task) completed, 2 should remain.
      assert.strictEqual(queue.tasks.length, 2, 'More than 1 task has been processed in the first group.')
      done()
    })

    queue.push('foo')
    queue.push('bar')
    queue.push('foo')

    assert.strictEqual(queue.tasks.length, 3)
  })

  it('concurrent = 2', function(done) {
    queue = new Queue(worker, { concurrent: 2 })

    queue.once('group:finished', () => {
      // First group (of 2 tasks) completed, 1 should remain.
      assert.strictEqual(queue.tasks.length, 1, 'More than 2 tasks has been processed in the first group.')
      done()
    })

    queue.push('foo')
    queue.push('bar')
    queue.push('bar')

    assert.strictEqual(queue.tasks.length, 3)
  })

  it('concurrent = 3', function(done) {
    queue = new Queue(worker, { concurrent: 3 })

    queue.once('group:finished', () => {
      // First group (of 3 tasks) completed, none should remain.
      assert.strictEqual(queue.tasks.length, 0, 'Not all tasks have been processed in the first group.')
      done()
    })

    queue.push('foo')
    queue.push('bar')
    queue.push('bar')

    assert.strictEqual(queue.tasks.length, 3)
  })

  it('delay = 1000', function(done) {
    this.timeout(3000)

    queue = new Queue(worker, { delay: 1000 })

    queue.push('foo')
    queue.push('bar')
    queue.push('bar')

    assert.strictEqual(queue.tasks.length, 3)

    setTimeout(() => {
      assert.strictEqual(queue.working, true, 'Not working.')
      assert.strictEqual(queue.tasks.length, 3, 'After 500ms, some task has been processed. (This should not occur until after 1000ms)')
    }, 500)

    setTimeout(() => {
      assert.strictEqual(queue.working, true, 'Not working.')
      assert.strictEqual(queue.tasks.length, 2, 'After 1500ms, a task has not been processed.')
    }, 1500)

    setTimeout(() => {
      assert.strictEqual(queue.working, true, 'Not working.')
      assert.strictEqual(queue.tasks.length, 1, 'After 1500ms, two tasks have not been processed.')
      done()
    }, 2500)
  })

  it('debounceDelay = 0', function(done) {
    async function worker(task: Task): Promise<void> {
      await new Promise((resolve) => {
        setTimeout(() => resolve, 500)
      })
    }

    queue = new Queue(worker, { debounceDelay: 0 })

    queue.push('foo')
    queue.push('bar')
    queue.push('foo')

    assert.strictEqual(queue.tasks.length, 3)
    assert.strictEqual(queue.working, true, 'Not working instantly.')

    setTimeout(() => {
      assert.strictEqual(queue.tasks[0].running, true, 'First task not being processed.')
      assert.strictEqual(queue.tasks[1].running, false, 'Second task is being processed??')
      assert.strictEqual(queue.tasks[2].running, false, 'Third task is being processed??')

      done()
    }, 100)
  })

  it('debounceDelay = undefined (0), concurrent = 2', function(done) {
    async function worker(task: Task): Promise<void> {
      await new Promise((resolve) => {
        setTimeout(() => resolve, 500)
      })
    }

    queue = new Queue(worker, { debounceDelay: undefined, concurrent: 2 })

    queue.push('foo')
    queue.push('bar')
    queue.push('foo')

    assert.strictEqual(queue.tasks.length, 3)
    assert.strictEqual(queue.working, true, 'Not working instantly.')

    setTimeout(() => {
      assert.strictEqual(queue.tasks[0].running, true, 'First task not being processed.')
      assert.strictEqual(queue.tasks[1].running, true, 'Second task not being processed.')
      assert.strictEqual(queue.tasks[2].running, false, 'Third task is being processed??')

      done()
    }, 100)
  })

  it('debounceDelay = 1000', function(done) {
    async function worker(task: Task): Promise<void> {
      await new Promise((resolve) => {
        setTimeout(() => resolve, 500)
      })
    }

    queue = new Queue(worker, { debounceDelay: 1000 })

    queue.push('foo')
    queue.push('bar')
    queue.push('foo')

    assert.strictEqual(queue.tasks.length, 3)
    assert.strictEqual(queue.working, false, 'Working instantly.')

    setTimeout(() => {
      assert.strictEqual(queue.tasks[0].running, false, 'First task is being processed after 100ms')
      assert.strictEqual(queue.tasks[1].running, false, 'Second task is being processed after 100ms')
      assert.strictEqual(queue.tasks[2].running, false, 'Third task is being processed after 100ms')
    }, 100)

    setTimeout(() => {
      assert.strictEqual(queue.working, true, 'Not working after 1100ms')
      assert.strictEqual(queue.tasks[0].running, true, 'First task not being processed after 1100ms')
      assert.strictEqual(queue.tasks[1].running, false, 'Second task is being processed after 1100ms')
      assert.strictEqual(queue.tasks[2].running, false, 'Third task is being processed after 1100ms')
      done()
    }, 1100)
  })

  it('autoStart = true', function(done) {
    queue = new Queue(worker, { autoStart: true })

    queue.push('foo')
    queue.push('bar')
    queue.push('foo')

    assert.strictEqual(queue.tasks.length, 3)

    setTimeout(() => {
      assert.strictEqual(queue.working, true, 'Not working')
    }, queue.options.debounceDelay + queue.options.delay)

    queue.once('idle', () => {
      assert.strictEqual(queue.tasks.length, 0)
      done()
    })
  })

  it('autoStart = false', function(done) {
    queue = new Queue(worker, { autoStart: false })

    queue.push('foo')
    queue.push('bar')
    queue.push('foo')

    assert.strictEqual(queue.tasks.length, 3)

    setTimeout(() => {
      assert.strictEqual(queue.working, false, 'Working')
    }, queue.options.debounceDelay + queue.options.delay)

    setTimeout(() => {
      assert.strictEqual(queue.tasks.length, 3)
      done()
    }, (queue.options.delay * 4) + queue.options.debounceDelay + 50)
  })

  it('retry = true', function(done) {
    let justOnce = false
    let failed = false

    async function worker(task: Task): Promise<void> {
      if (task.payload === 'foo' && !justOnce) {
        justOnce = true
        throw new Error('test')
      }
    }

    queue = new Queue(worker, { retry: true, throwOnError: false })

    queue.push('foo')
    queue.push('bar')

    queue.once('task:failed', (task: Task, err: Error) => {
      failed = true
      assert.strictEqual(task.payload, 'foo', 'Another task was expected')
      assert.strictEqual(err.message, 'test', 'Another error message was expected')
    })

    queue.once('task:success', (task: Task) => {
      assert.strictEqual(failed, true, 'The task did not fail in the first place')
      assert.strictEqual(task.payload, 'foo', 'Another task was expected to success')
      done()
    })
  })

  it('retry = false', function(done) {
    let justOnce = false
    let failed = false

    async function worker(task: Task): Promise<void> {
      if (task.payload === 'foo' && !justOnce) {
        justOnce = true
        throw new Error('test')
      }
    }

    queue = new Queue(worker, { retry: false, throwOnError: false })

    queue.push('foo')
    queue.push('bar')

    queue.once('task:failed', (task: Task, err: Error) => {
      failed = true
      assert.strictEqual(task.payload, 'foo', 'Another task was expected')
      assert.strictEqual(err.message, 'test', 'Another error message was expected')
    })

    queue.once('task:success', (task: Task) => {
      assert.strictEqual(failed, true, 'The task did not fail in the first place')
      assert.strictEqual(task.payload, 'bar', 'Another task was expected to success')
      done()
    })
  })

  it('timeout = 2000', function(done) {
    this.timeout(4000)

    async function worker(task: Task): Promise<void> {
      await new Promise((resolve) => {
        setTimeout(() => resolve, 3000)
      })
    }

    queue = new Queue(worker, { timeout: 2000 })

    queue.push('foo')
    queue.push('bar')

    setTimeout(() => {
      queue.once('task:cancelled', (task: Task, reason?: string) => {
        assert.strictEqual(reason, 'timeout')
        assert.strictEqual(task.payload, 'foo', 'Another task was expected to timeout')
        done()
      })
    }, 1900)
  })

  it('onBeforeWork (modify), concurrent = 1', function(done) {
    queue = new Queue(worker, {
      concurrent: 1,
      async onBeforeWork(tasks: Task[]) {
        if (tasks[0].payload === 'foo') {
          tasks[0].payload = 'lorem'
        }

        if (tasks[0].payload === 'bar') {
          tasks[0].payload = 'ipsum'
        }
      }
    })

    queue.push('foo')
    queue.push('bar')

    let count = -1
    let success1 = false
    let success2 = false

    queue.on('task:success', (task: Task) => {
      count += 1

      if (count === 0) {
        assert.strictEqual(task.payload, 'lorem', '"foo" should have become "lorem"')
        success1 = true
      }

      if (count === 1) {
        assert.strictEqual(task.payload, 'ipsum', '"bar" should have become "ipsum"')
        success2 = true
      }
    })

    queue.once('finished', () => {
      assert.strictEqual(success1, true, 'task:success was not called in "foo"')
      assert.strictEqual(success2, true, 'task:success was not called in "bar"')
      done()
    })
  })

  it('onBeforeWork (cancel), concurrent = 2', function(done) {
    queue = new Queue(worker, {
      concurrent: 2,
      async onBeforeWork(tasks: Task[]) {
        return []
      }
    })

    queue.push('foo')
    queue.push('bar')
    queue.push('lorem')
    queue.push('ipsum')

    let count = 0

    queue.on('task:success', (task: Task) => {
      assert.ok(false, 'task:success was called. The tasks should have been cancelled.')
    })

    queue.on('task:discarded', (task: Task) => {
      count += 1
    })

    queue.once('finished', () => {
      assert.strictEqual(count, 4, '4 tasks had to be discarded.')
      done()
    })
  })
})