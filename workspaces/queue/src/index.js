import {
  isObject, isFunction, remove, take,
} from 'lodash'
import EventEmitter from 'events'

export class Queue extends EventEmitter {
  /**
   * @type {Array}
   */
  tasks = []

  /**
   * @type {Function}
   */
  worker

  /**
   * @type {number}
   */
  uniqueId = 0

  /**
   * @type {boolean}
   */
  started = false

  /**
   * @type {boolean}
   */
  working = false

  /**
   * @type {Object} options
   * @type {number} options.concurrent How many tasks should be resolved at a time
   * @type {boolean} options.start If should resolve new tasks automatically
   */
  options = {
    concurrent: 1,
    delay: 300,
    start: true,
  }

  /**
   * @type {boolean}
   */
  get isEmpty() {
    return this.tasks.length === 0
  }

  /**
   *
   * @param {Function} worker
   * @param {Array} options
   */
  constructor(worker, options = {}) {
    super()

    if (!isFunction(worker)) {
      throw new Error('Worker is not a function.')
    }

    this.worker = worker

    this.options = {
      ...this.options,
      ...options,
    }

    if (this.options.start) {
      this.start()
    }
  }

  /**
   *
   */
  start() {
    if (this.started) {
      return
    }

    this.started = true

    this.emit('started')

    this.work()
  }

  /**
   *
   */
  pause() {
    if (!this.started) {
      return
    }

    this.started = false

    this.emit('paused')
  }

  /**
   *
   */
  stop() {
    if (!this.started) {
      return
    }

    this.started = false

    this.clear()

    this.emit('stopped')
  }

  /**
   *
   */
  clear() {
    this.tasks.forEach((task) => {
      this.emit('task_dropped', task)
    })

    this.tasks = []

    this.emit('finished')
  }

  /**
   *
   */
  async work() {
    if (!this.started) {
      return
    }

    if (this.working) {
      return
    }

    if (this.isEmpty) {
      return
    }

    if (!isFunction(this.worker)) {
      throw new Error('Worker is not a function.')
    }

    this.working = true

    do {
      await new Promise((resolve) => {
        setTimeout(resolve, this.options.delay)
      })

      const workload = []

      const tasks = take(this.tasks, this.options.concurrent)

      tasks.forEach((task) => {
        this.emit('task_started', task)

        workload.push(
          Promise.resolve(this.worker(task))
            .then((value) => {
              this.emit('task_finished', task, value)
              return value
            })
            .catch((error) => {
              this.emit('task_failed', task, error)
              return error
            })
        )
      })

      await Promise.all(workload).catch((error) => { })

      tasks.forEach((task) => {
        this.dropById(task._workId)
      })
    } while (this.started && !this.isEmpty)

    this.working = false

    this.emit('finished')
  }

  add(task) {
    if (!isObject(task)) {
      return
    }

    this.uniqueId += 1

    task._workId = this.uniqueId

    this.tasks.push(task)

    this.emit('task_added', task)

    this.work()
  }

  drop(task) {
    const removed = this.dropById(task._workId)

    if (removed.length > 0) {
      this.emit('task_dropped', task)
    }
  }

  dropById(id) {
    return remove(this.tasks, { _workId: id })
  }
}
