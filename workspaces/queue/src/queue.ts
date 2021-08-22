/* eslint-disable @typescript-eslint/no-empty-function */
import EventEmitter from 'events'
import { take, reject, debounce, find, filter, ListIterateeCustom, DebouncedFunc } from 'lodash'

export type WorkerCallback = (task: Task) => Promise<any>

export type BeforeWorkCallback = (tasks: Task[]) => Promise<Task[] | void>

export type CancelCallback = (reason?: string) => void

type WorkerFunc = () => Promise<void>

export interface QueueOptions {
  /**
   * Number of tasks to process at the same time.
   *
   * @default 1
   */
  concurrent?: number
  /**
   * Time in milliseconds between task group executions.
   *
   * @default 10
   */
  delay?: number
  /**
   * Time in milliseconds to wait between added tasks to start processing.
   *
   * @default 300
   */
  debounceDelay?: number
  /**
   * Start processing tasks automatically.
   *
   * @default true
   */
  autoStart?: boolean
  /**
   * Indicates if failed tasks will be put back
   * to the beginning of the queue.
   *
   * @default false
   */
  retry?: boolean
  /**
   * Time in milliseconds to cancel "stuck" tasks.
   */
  timeout?: number
  /**
   * Indicates if task errors should be thrown
   * instead of only being passed to the `task:failed` event.
   *
   * @remarks
   * True by default in a test environment.
   */
  throwOnError?: boolean
  /**
   * Called before processing a group of tasks.
   * If returns a new list of tasks that list will be processed instead.
   */
  onBeforeWork?: BeforeWorkCallback
}

export interface TaskCallbacks {
  /**
   * Called when the task is being processed and must be cancelled.
   */
  onCancel?: CancelCallback
  /**
   * Called when the task has been removed from the queue before processing.
   */
  onDiscarded?: CancelCallback
  /**
   * Called just before the start of the task processing.
   */
  onStarted?: () => void
  /**
   * Called when the task has been successfully processed.
   */
  onSuccess?: (value: unknown) => void
  /**
   * Called when an error has occurred during processing.
   */
  onFailed?: (err: Error) => void
  /**
   * Called when the task has been processed
   * regardless of whether it has been successful or not.
   */
  onFinished?: () => void
}

export interface Task extends TaskCallbacks {
  /**
   * Unique identification.
   */
  id: number
  /**
   * Data to be processed.
   */
  payload: unknown
  /**
   * Priority.
   *
   * @remarks
   * Tasks with higher priority will be processed first.
   */
  priority: number
  /**
   * Indicates if the task is being processed.
   */
  running: boolean
  /**
   * Timeout handler.
   */
  timeout?: NodeJS.Timeout
}

/**
 * @param ms Time in milliseconds to wait.
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export class Queue extends EventEmitter {
  /**
   * Queue options.
   */
  public options: QueueOptions = {
    concurrent: 1,
    delay: 10,
    debounceDelay: 300,
    autoStart: true,
    retry: false,
    throwOnError: process.env.NODE_ENV === 'test'
  }

  /**
   * Indicates if the queue will process the tasks.
   */
  public started = false

  /**
   * Indicates if the queue is currently processing tasks.
   */
  public working = false

  /**
   * Indicates if the queue has been emptied during execution.
   *
   * @remarks
   * Just avoids calling the `finished` and `idle` events twice.
   */
  protected cleaned = false

  /**
   * Debounced work function.
   */
  protected work: DebouncedFunc<WorkerFunc> | WorkerFunc

  /**
   * Tasks list.
   */
  public tasks: Task[] = []

  /**
   * Next unique ID for tasks.
   */
  protected nextTaskID = -1

  /**
   * Indicates if the task list is empty.
   */
  public get isEmpty(): boolean {
    return this.tasks.length === 0
  }

  /**
   * Returns the number of tasks in the queue.
   *
   * @remarks
   * This includes tasks being processed.
   */
  public get size(): number {
    return this.tasks.length
  }

  /**
   * @param fn Function for processing tasks.
   * @param options Queue options.
   */
  public constructor(public fn: WorkerCallback, options: QueueOptions = {}) {
    super()

    this.options = {
      ...this.options,
      ...options
    }

    if (this.options.debounceDelay && this.options.debounceDelay > 0) {
      this.work = debounce<() => Promise<void>>(this._work.bind(this), this.options.debounceDelay)
    } else {
      this.work = this._work
    }

    if (this.options.autoStart) {
      this.start()
    }

    if (this.options.throwOnError) {
      this.on('task:failed', (task: Task, err: Error) => {
        throw err
      })
    }
  }

  /**
   * Start processing tasks.
   */
  public start(): this {
    if (this.started) {
      return this
    }

    this.started = true

    this.emit('started')

    this.work()

    return this
  }

  /**
   * Pauses task processing.
   *
   * @remarks
   * This does not cancel running tasks.
   */
  public pause(): this {
    if (!this.started) {
      return this
    }

    this.started = false

    this.emit('paused')

    return this
  }

  /**
   * Stop and clear the tasks list.
   */
  public stop(): this {
    if (!this.started) {
      return this
    }

    this.started = false

    this.clear('stopped')

    this.emit('stopped')

    return this
  }

  /**
   * Clear the tasks list.
   */
  public clear(reason?: string): this {
    this.tasks.forEach((task) => {
      this.cancel(task, reason)
    })

    this.tasks = []

    this.emit('idle')

    if (this.working) {
      this.cleaned = true
    }

    return this
  }

  /**
   * Process the tasks by groups until there are none left.
   */
  protected async _work(): Promise<void> {
    if (!this.started) {
      // Paused
      return
    }

    if (this.working) {
      return
    }

    if (this.isEmpty) {
      // No pending tasks.
      return
    }

    this.working = true

    do {
      if (this.options.delay) {
        // Wait between groups of tasks.
        await wait(this.options.delay)
      }

      const workload: Promise<unknown>[] = []

      this.tasks.sort((task1, task2) => {
        if (task1.priority < task2.priority) {
          return -1
        }

        if (task1.priority > task2.priority) {
          return 1
        }

        return 0
      })

      let tasks = take(this.tasks, this.options.concurrent)

      if (this.options.onBeforeWork) {
        // User wants to modify the tasks before processing them.
        const tasksResponse = await this.options.onBeforeWork(tasks)

        if (tasksResponse) {
          // User has returned new list of tasks, compare.
          tasks.forEach((task) => {
            const exists = find(tasksResponse, { id: task.id })

            if (!exists) {
              // This task is no longer in the new list.
              // "I don't need you anymore..."
              this.discard(task, true)
            }
          })

          tasks = tasksResponse
        }
      }

      this.emit('group:started', tasks)

      tasks.forEach((task) => {
        this.fireStart(task)

        if (this.options.timeout && this.options.timeout > 0) {
          // Safe timeout.
          task.timeout = setTimeout(() => {
            this.fireTimeout(task)
          }, this.options.timeout)
        }

        task.running = true

        workload.push(
          this.fn(task)
            .then((value: unknown) => {
              this.discard(task)
              this.fireSuccess(task, value)
            })
            .catch((err) => {
              this.discard(task)
              this.fireFail(task, err)

              if (this.options.retry) {
                // Place at the beginning of the queue to retry.
                this.unshift(task.payload)
              }
            })
            .finally(() => {
              this.cleanup(task)
            })
        )
      })

      await Promise.allSettled(workload)

      this.emit('group:finished', tasks)
    } while (this.started && !this.isEmpty)

    this.working = false

    if (!this.cleaned) {
      this.emit('idle')
    }

    this.emit('finished')

    this.cleaned = false
  }

  /**
   * Returns a [Task] with the provided information.
   *
   * @param payload Data to be processed.
   * @param [priority=0]
   * @param [callbacks={}]
   */
  public createTask(payload: unknown, priority = 0, callbacks: TaskCallbacks = {}): Task {
    if (this.nextTaskID >= Number.MAX_VALUE) {
      // Maybe, just maybe someday...
      this.nextTaskID = -1
    }

    this.nextTaskID += 1

    const task: Task = {
      id: this.nextTaskID,
      payload,
      running: false,
      priority
    }

    if (callbacks.onCancel) {
      task.onCancel = callbacks.onCancel
    }

    if (callbacks.onDiscarded) {
      task.onDiscarded = callbacks.onDiscarded
    }

    if (callbacks.onStarted) {
      task.onStarted = callbacks.onStarted
    }

    if (callbacks.onSuccess) {
      task.onSuccess = callbacks.onSuccess
    }

    if (callbacks.onFailed) {
      task.onFailed = callbacks.onFailed
    }

    if (callbacks.onFinished) {
      task.onFinished = callbacks.onFinished
    }

    return task
  }

  /**
   * Adds a task to the queue using a specified array function.
   *
   * @param payload Data to be processed.
   * @param [func='push'] Array function.
   * @param [priority=0]
   * @param [callbacks={}]
   */
  public add(payload: unknown, func = 'push', priority = 0, callbacks: TaskCallbacks = {}): Task {
    const task = this.createTask(payload, priority, callbacks)

    this.tasks[func](task)

    this.emit('task:added', task)

    this.work()

    return task
  }

  /**
   * Adds a task to the end of the queue.
   *
   * @param payload Data to be processed.
   * @param [priority=0]
   * @param [callbacks={}]
   */
  public push(payload: unknown, priority = 0, callbacks: TaskCallbacks = {}): Task {
    return this.add(payload, 'push', priority, callbacks)
  }

  /**
   * Adds a task to the start of the queue.
   *
   * @param payload Data to be processed.
   * @param [priority=0]
   * @param [callbacks={}]
   */
  public unshift(payload: unknown, priority = 0, callbacks: TaskCallbacks = {}): Task {
    return this.add(payload, 'unshift', priority, callbacks)
  }

  /**
   * Returns a task from the queue by its ID.
   *
   * @param id
   */
  public get(id: number): Task | undefined {
    return find(this.tasks, { id })
  }

  /**
   * Returns a list of tasks in the queue by their attributes.
   *
   * @example
   * ```
   * const priorityTasks = queue.getBy({ priority: 1 })
   * const prioRunningTasks = queue.getBy({ priority: 1, running: true })
   * const ageTasks = queue.getBy((task) => task.payload.custom.age >= 20)
   * ```
   *
   * @param options
   */
  public getBy(options: ListIterateeCustom<Task, boolean>): Task[] {
    return filter(this.tasks, options)
  }

  /**
   * Returns the number of tasks found by attributes.
   *
   * @example
   * ```
   * const priorityTasks = queue.getBy({ priority: 1 })
   * const prioRunningTasks = queue.getBy({ priority: 1, running: true })
   * const ageTasks = queue.getBy((task) => task.payload.custom.age >= 20)
   *
   * @param options
   */
  public sizeBy(options: ListIterateeCustom<Task, boolean>): number {
    return filter(this.tasks, options).length
  }

  /**
   * Removes a task from the queue.
   *
   * @param task
   * @param [fire=false] Fire discarded task event?
   */
  public discard(task: Task, fire = false): this {
    this.tasks = reject(this.tasks, { id: task.id })

    if (fire) {
      this.fireDiscard(task)
    }

    return this
  }

  /**
   * Cancels a task and performs the corresponding cleanup.
   *
   * @param task
   * @param [reason]
   */
  public cancel(task: Task, reason?: string): this {
    if (task.running) {
      this.fireCancel(task, reason)
    } else {
      this.fireDiscard(task)
    }

    this.cleanup(task)

    return this
  }

  /**
   * Performs the last actions before finishing a task.
   *
   * @param task
   */
  public cleanup(task: Task): this {
    if (task.timeout) {
      clearTimeout(task.timeout)
    }

    task.running = false

    this.fireFinished(task)

    return this
  }

  protected fireStart(task: Task): void {
    if (task.onStarted) {
      task.onStarted()
    }

    this.emit('task:started', task)
  }

  protected fireSuccess(task: Task, value: unknown): void {
    if (task.onSuccess) {
      task.onSuccess(value)
    }

    this.emit('task:success', task, value)
  }

  protected fireFail(task: Task, err: Error): void {
    if (task.onFailed) {
      task.onFailed(err)
    }

    this.emit('task:failed', task, err)
  }

  protected fireFinished(task: Task): void {
    if (task.onFinished) {
      task.onFinished()
    }

    this.emit('task:finished', task)
  }

  protected fireDiscard(task: Task): void {
    if (task.onDiscarded) {
      task.onDiscarded()
    }

    this.emit('task:discarded', task)
  }

  protected fireTimeout(task: Task): void {
    if (task.onCancel) {
      task.onCancel('timeout')
    }

    this.emit('task:cancelled', task, 'timeout')
  }

  protected fireCancel(task: Task, reason?: string): void {
    if (task.onCancel) {
      task.onCancel(reason)
    }

    this.emit('task:cancelled', task, reason)
  }
}
