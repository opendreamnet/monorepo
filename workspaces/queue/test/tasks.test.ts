/* eslint-disable prefer-arrow-callback */

import assert from 'assert'
import { Queue, Task } from '../src'

async function worker(task: Task): Promise<any> {
  await new Promise((resolve) => {
    setTimeout(() => { resolve(task.payload) }, 100)
  })

  return task.payload
}

describe('tasks', function() {
  it('task.id', function() {
    const queue = new Queue(worker, { autoStart: false })

    let task: Task

    task = queue.push('lorem')

    assert.strictEqual(task.id, 0)

    task = queue.push('ipsum')

    assert.strictEqual(task.id, 1)

    task = queue.push('foo')

    assert.strictEqual(task.id, 2)
  })

  it('task.payload (string)', function(done) {
    async function worker(task: Task): Promise<any> {
      if (task.id === 0) {
        assert.strictEqual(task.payload, 'lorem')
      }

      if (task.id === 1) {
        assert.strictEqual(task.payload, 'ipsum')
      }
    }

    const queue = new Queue(worker)

    queue.push('lorem')
    queue.push('ipsum')

    queue.on('finished', () => {
      done()
    })
  })

  it('task.payload (number)', function(done) {
    async function worker(task: Task): Promise<any> {
      if (task.id === 0) {
        assert.strictEqual(task.payload, 10)
      }

      if (task.id === 1) {
        // TODO: Fix this shit
        assert.strictEqual(task.payload, 'ipsum')
        assert.ok(false)
      }
    }

    const queue = new Queue(worker)

    queue.push(10)
    queue.push(42)

    queue.on('task:failed', (task, err) =>{
      throw err
    })

    queue.on('finished', () => {
      done()
    })
  })

  it('task.priority', function(done) {
    let count = -1

    async function worker(task: Task): Promise<any> {
      count += 1

      if (count === 0) {
        assert.strictEqual(task.payload, 'lorem')
      }

      if (count === 1) {
        assert.strictEqual(task.payload, 'bar')
      }

      if (count === 2) {
        assert.strictEqual(task.payload, 'ipsum')
      }

      if (count === 3) {
        assert.strictEqual(task.payload, 'foo')
      }
    }

    const queue = new Queue(worker)

    queue.push('lorem', 500)
    queue.push('ipsum', 25)
    queue.push('foo', 5)
    queue.push('bar', 80)

    queue.on('finished', () => {
      done()
    })
  })
})