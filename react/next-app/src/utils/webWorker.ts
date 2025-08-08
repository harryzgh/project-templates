// Type for callback functions
type ComputedCallback<T, U> = (data: U) => T

/**
 * Interface for pending tasks.
 */
interface PendingTask<T = unknown, U = unknown> {
  data: U
  timerId?: NodeJS.Timeout
  uniqueId: number
  callback: ComputedCallback<T, U>
  resolve: (value: T | PromiseLike<T>) => void
  reject: (error: Error) => void
}

/**
 * Interface for worker message payloads.
 */
interface WorkerMessagePayload {
  uniqueId: number
  data: unknown
  error: Error
}

/**
 * Class to manage web worker tasks.
 */
class WebWorker {
  /** Singleton instance */
  private static instance: WebWorker

  /** Web Worker instance */
  private worker: Worker

  /** Map to store pending tasks */
  private pendingTasks = new Map<number, PendingTask<unknown>>()

  /** Unique task ID counter */
  private uniqueId = 0

  /** Retry attempts for worker errors */
  private retries = 10

  /**
   * Private constructor to initialize worker and timeout.
   * @param timeout The timeout duration in seconds.
   */
  private constructor(private timeout: number) {
    this.worker = this.createWorker()
    // window.WebWorker = this
  }

  /**
   * Get singleton instance of WebWorker.
   * @param timeout The timeout duration in seconds.
   * @returns The singleton instance.
   */
  public static getInstance(timeout: number = 5) {
    if (!this.instance) {
      return (this.instance = new WebWorker(timeout))
    }

    return this.instance
  }

  /**
   * Submit a computation task.
   * @param callback The function to be executed in the worker.
   * @param data Optional data to pass to the callback.
   * @returns A promise that resolves with the result of the computation.
   */
  public computed<T, U>(callback: ComputedCallback<T, U>, data?: U) {
    return new Promise<Awaited<ReturnType<typeof callback>>>(
      (resolve, reject) => {
        const pendingTask = {
          data,
          uniqueId: this.nextId(),
          resolve,
          reject,
          callback,
        }

        this.worker.postMessage({
          callback: pendingTask.callback.toString(),
          data: pendingTask.data,
          uniqueId: pendingTask.uniqueId,
        })

        const timerId = setTimeout(() => {
          pendingTask.reject(new Error("Task time out"))
          this.pendingTasks.delete(pendingTask.uniqueId)
          clearTimeout(timerId)
        }, this.timeout * 1000)

        this.pendingTasks.set(pendingTask.uniqueId, {
          ...pendingTask,
          timerId,
        } as PendingTask)
      }
    )
  }

  /**
   * Handle messages from the worker.
   * @param event The message event containing the worker's response.
   */
  private onmessage(event: MessageEvent<WorkerMessagePayload>) {
    const {
      data: { uniqueId, data, error },
    } = event

    const pendingTask = this.pendingTasks.get(uniqueId)

    // Task time out
    if (!pendingTask) {
      return
    }

    if (error) {
      pendingTask.reject(error)
    } else {
      pendingTask.resolve(data)
    }
    // 下面写法会报错，改成上面条件判断
    // error ? pendingTask.reject(error) : pendingTask.resolve(data)

    clearTimeout(pendingTask.timerId)
    this.pendingTasks.delete(uniqueId)
  }

  /**
   * Handle errors from the worker.
   * @param event The error event containing the error details.
   */
  private onerror(event: ErrorEvent) {
    this.worker.terminate()

    if (this.retries) {
      console.error(`[${WebWorker.name}]: Start retrying - ${event.message}`)

      this.createWorker()

      this.retries--

      for (const task of Array.from(this.pendingTasks.values())) {
        this.worker.postMessage({
          callback: task.callback.toString(),
          data: task.data,
          uniqueId: task.uniqueId,
        })
      }

      return
    }

    console.error(
      `[${WebWorker.name}]: Worker encountered an error - ${event.message}`
    )
  }

  /**
   * Generate the next unique ID.
   * @returns The next unique ID.
   */
  private nextId() {
    return this.uniqueId++
  }

  /**
   * Create and configure the worker.
   * @returns The created Worker instance.
   */
  private createWorker() {
    const worker = new Worker("/worker-script.js")

    worker.onmessage = this.onmessage.bind(this)
    worker.onerror = this.onerror.bind(this)

    return worker
  }
}

export function workerComputed<T, U>(
  callback: ComputedCallback<T, U>,
  data?: U
) {
  return WebWorker.getInstance().computed(callback, data)
}
