/* eslint-disable @typescript-eslint/no-empty-function */
import EventEmitter from 'events'
import { take, reject, find, filter, ListIterateeCustom } from 'lodash'

export type WorkerCallback = (task: Task) => Promise<any>

export type BeforeWorkCallback = (tasks: Task[]) => Promise<Task[] | void>

export type CancelCallback = (reason?: string) => void

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
   * @default 300
   */
  delay?: number
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
  timeout?: number | null
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
  onBeforeWork?: BeforeWorkCallback | null
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
  public options: Required<QueueOptions> = {
    concurrent: 1,
    delay: 300,
    autoStart: true,
    retry: false,
    timeout: null,
    throwOnError: process.env.NODE_ENV === 'test',
    onBeforeWork: null
  }

  /**
   * True if the queue will process tasks.
   */
  public started = false

  /**
   * Tasks list.
   */
  public tasks: Task[] = []

  /**
   * Next unique ID for tasks.
   */
  protected nextTaskID = -1

  /**
   * True if the task list is empty.
   *
   * @readonly
   */
  public get isEmpty(): boolean {
    return this.tasks.length === 0
  }

  /**
   * True if the number of tasks running is less than
   * the maximum concurrent.
   *
   * @readonly
   */
  public get isAvailable(): boolean {
    return this.runningSize < this.options.concurrent
  }

  /**
   * Returns the number of all tasks.
   */
  public get size(): number {
    return this.tasks.length
  }

  /**
   * Returns the number of running tasks.
   *
   * @readonly
   */
  public get runningSize(): number {
    return this.getBy({ running: true }).length
  }

  /**
   * Returns the number of pending tasks.
   *
   * @readonly
   */
  public get pendingSize(): number {
    return this.getBy({ running: false }).length
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

    // Loop in charge of running tasks.
    this.think()

    if (this.options.autoStart) {
      this.start()
    }

    if (this.options.throwOnError) {
      // The user wants to throw errors instead of handling them with the event.
      this.on('task:failed', (task: Task, err: Error) => {
        throw err
      })
    }
  }

  /**
   * Start queue.
   */
  public start(): this {
    if (this.started) {
      return this
    }

    this.started = true
    this.emit('started')

    return this
  }

  /**
   * Pauses queue.
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
   * Stops the queue and cancels all tasks.
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
   * Cancels all tasks.
   */
  public clear(reason?: string): this {
    this.tasks.forEach((task) => {
      this.cancel(task, reason)
    })

    this.tasks = []
    this.emit('idle')

    return this
  }

  /**
   * Returns a promise that will not be resolved
   * until the queue starts.
   *
   * @protected
   */
  protected waitUntilStart(): Promise<void> {
    if (this.started) {
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      this.once('started', resolve)
    })
  }

  /**
   * Returns a promise that will not be resolved
   * until there are pending tasks.
   *
   * @protected
   */
  protected waitUntilPendingTasks(): Promise<void> {
    if (this.pendingSize > 0) {
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      this.once('task:added', resolve)
    })
  }

  /**
   * Returns a promise that will not be resolved
   * until there is space available in the queue.
   *
   * @protected
   * @return {*}
   */
  protected waitUntilFree(): Promise<void> {
    if (this.isAvailable) {
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      this.once('free', resolve)
    })
  }

  /**
   * Returns the list of tasks to run.
   *
   * @protected
   */
  protected async getNextTasks(): Promise<Task[]> {
    let tasks = this.getBy({ running: false })

    // Priority sort.
    tasks.sort((task1, task2) => {
      if (task1.priority < task2.priority) {
        return -1
      }

      if (task1.priority > task2.priority) {
        return 1
      }

      return 0
    })

    // Remaining before filling the max concurrent.
    const remaining = this.options.concurrent - this.runningSize

    tasks = take(tasks, remaining)

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

    return tasks
  }

  /**
   *
   *
   * @protected
   */
  protected async think(): Promise<void> {
    while(true) {
      // Wait for the queue to start.
      await this.waitUntilStart()

      // Wait until there are pending tasks.
      await this.waitUntilPendingTasks()

      // Wait until the number of tasks running is less than the number of max concurrent tasks.
      await this.waitUntilFree()

      // Delay.
      await wait(this.options.delay)

      if (!this.started) {
        // It seems that during this time the queue has stopped.
        continue
      }

      const tasks = await this.getNextTasks()

      this.emit('group:started', tasks)

      tasks.forEach((task) => {
        task.running = true
        this.emitStart(task)

        if (this.options.timeout && this.options.timeout > 0) {
          // Safe timeout.
          task.timeout = setTimeout(() => this.emitTimeout(task), this.options.timeout)
        }

        // Process the task!
        this.fn(task)
          .then((value: unknown) => {
            this.discard(task)
            this.emitSuccess(task, value)
          })
          .catch((err) => {
            this.discard(task)
            this.emitFailed(task, err)

            if (this.options.retry) {
              // Place at the beginning of the queue to retry.
              this.unshift(task.payload)
            }
          })
          .finally(() => {
            this.done(task)
          })
      })
    }
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
   * @param [fire=false] Emit event?
   */
  public discard(task: Task, fire = false): this {
    this.tasks = reject(this.tasks, { id: task.id })

    if (fire) {
      this.emitDiscard(task)
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
      this.emitCancel(task, reason)
    } else {
      this.emitDiscard(task)
    }

    this.done(task)

    return this
  }

  /**
   * Prepare the task for completion.
   *
   * @param task
   */
  public done(task: Task): this {
    if (task.timeout) {
      clearTimeout(task.timeout)
    }

    task.running = false
    this.emitFinished(task)

    if (this.isAvailable) {
      // There is already space in the queue.
      this.emit('free')
    }

    if (this.isEmpty) {
      // Totally empty.
      this.emit('idle')
    }

    return this
  }

  protected emitStart(task: Task): void {
    if (task.onStarted) {
      task.onStarted()
    }

    this.emit('task:started', task)
  }

  protected emitSuccess(task: Task, value: unknown): void {
    if (task.onSuccess) {
      task.onSuccess(value)
    }

    this.emit('task:success', task, value)
  }

  protected emitFailed(task: Task, err: Error): void {
    if (task.onFailed) {
      task.onFailed(err)
    }

    this.emit('task:failed', task, err)
  }

  protected emitFinished(task: Task): void {
    if (task.onFinished) {
      task.onFinished()
    }

    this.emit('task:finished', task)
  }

  protected emitDiscard(task: Task): void {
    if (task.onDiscarded) {
      task.onDiscarded()
    }

    this.emit('task:discarded', task)
  }

  protected emitTimeout(task: Task): void {
    if (task.onCancel) {
      task.onCancel('timeout')
    }

    this.emit('task:cancelled', task, 'timeout')
  }

  protected emitCancel(task: Task, reason?: string): void {
    if (task.onCancel) {
      task.onCancel(reason)
    }

    this.emit('task:cancelled', task, reason)
  }
}
