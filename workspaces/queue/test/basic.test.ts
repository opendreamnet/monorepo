/* eslint-disable prefer-arrow-callback */

import assert from 'assert'
import { Queue, Task } from '../src'

async function worker(task: Task): Promise<unknown> {
  return task.payload
}

describe('basic', function() {
  it('.size', function() {
    const queue = new Queue(worker, { autoStart: false })

    queue.push('lorem')

    assert.strictEqual(queue.size, 1)

    queue.push('ipsum')

    assert.strictEqual(queue.size, 2)

    queue.push('foo')
    queue.push({ custom: 'test' })

    assert.strictEqual(queue.size, 4)
  })
})
