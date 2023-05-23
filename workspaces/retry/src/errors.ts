export class TimeoutError extends Error {
  public constructor(message = 'Timed out', public previous?: Error) {
    super(message)
    this.name = 'TimeoutError'
  }
}
