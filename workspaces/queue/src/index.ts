import EventEmitter from 'events'
import { take, merge, reject, debounce } from 'lodash'

type Callback = (...args) => unknown

export interface QueueOptions {
  concurrent?: number
  delay?: number
  start?: boolean
  retry?: boolean
}

export interface TaskData {
  id: number
  task: unknown
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export class Queue extends EventEmitter {
  public fn: Callback

  public options: QueueOptions = {
    concurrent: 1,
    delay: 500,
    start: true,
    retry: false,
  }

  public started = false

  public working = false

  public work: () => Promise<void>

  public tasks: TaskData[] = []

  public nextTaskID = -1

  public get isEmpty(): boolean {
    return this.tasks.length === 0
  }

  public constructor(fn: Callback, options: QueueOptions = {}) {
    super()

    this.fn = fn
    this.options = merge(this.options, options)

    this.work = debounce(this._work.bind(this), this.options.delay)

    if (this.options.start) {
      this.start()
    }
  }

  public start(): void {
    if (this.started) {
      return
    }

    this.started = true

    this.emit('started')

    this.work()
  }

  public pause(): void {
    if (!this.started) {
      return
    }

    this.started = false

    this.emit('paused')
  }

  public stop(): void {
    if (!this.started) {
      return
    }

    this.started = false

    this.clear()

    this.emit('stopped')
  }

  public clear(): void {
    this.tasks.forEach((task) => {
      this.emit('task:dropped', task)
    })

    this.tasks = []

    this.emit('finished')
  }

  protected async _work(): Promise<void> {
    if (!this.started) {
      return
    }

    if (this.working) {
      return
    }

    if (this.isEmpty) {
      return
    }

    console.log('_work')

    this.working = true

    do {
      // eslint-disable-next-line no-await-in-loop
      await wait(this.options.delay)

      const workload = []

      const tasks = take(this.tasks, this.options.concurrent)

      tasks.forEach((data) => {
        this.emit('task:started', data)

        workload.push(
          Promise.resolve(this.fn(data.task))
            .then((value) => {
              this.emit('task:success', data, value)
              return value
            })
            .catch((error) => {
              this.emit('task:failed', data, error)

              if (this.options.retry) {
                this.add(data.task)
              }

              return error
            })
            .finally(() => {
              this.drop(data.id)
            }),
        )
      })

      // eslint-disable-next-line no-await-in-loop
      await Promise.all(workload)
    } while (this.started && !this.isEmpty)

    this.working = false

    this.emit('finished')
    this.emit('empty')
  }

  public add(task: unknown): number {
    this.nextTaskID += 1

    const data = {
      id: this.nextTaskID,
      task,
    }

    this.tasks.push(data)

    this.emit('task:added', data)

    this.work()

    return this.nextTaskID
  }

  public drop(id: number): void {
    this.tasks = reject(this.tasks, { id })
  }
}
