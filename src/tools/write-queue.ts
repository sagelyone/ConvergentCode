export class WriteQueue {
  private chain: Promise<void> = Promise.resolve()

  write<T>(fn: () => Promise<T>): Promise<T> {
    let resolveResult!: (value: T) => void
    let rejectResult!: (error: unknown) => void
    const resultPromise = new Promise<T>((res, rej) => { resolveResult = res; rejectResult = rej })

    this.chain = this.chain.then(async () => {
      try { resolveResult(await fn()) }
      catch (e) { rejectResult(e) }
    }, (e) => { rejectResult(e) })

    return resultPromise
  }
}

export const stateQueue = new WriteQueue()
