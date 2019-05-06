const uuid = require("uuid").v4

const resolveRunning = (runningHandler, functionHandler) => {
  const {
    promise: runningPromise,
    key: runningKey,
    promiseHandler: { resolve, reject }
  } = runningHandler
  runningPromise
    .then((...result) => resolve(...result))
    .catch((...result) => reject(...result))
    .finally(() => {
      functionHandler.running = functionHandler.running.filter(
        i => i.key !== runningKey
      )
      while (
        functionHandler.queued.length &&
        functionHandler.running.length < functionHandler.options.concurrency
      ) {
        const dequeued = functionHandler.queued.shift()
        dequeued.promise = dequeued.thunk()
        functionHandler.running.push(dequeued)
        resolveRunning(dequeued, functionHandler)
      }
    })
}

const makeControlled = (fn, options = { concurrency: Infinity }) => {
  const functionHandler = {
    fn,
    options,
    queued: [],
    running: []
  }
  return (...args) => {
    const key = uuid()
    const queued = {
      key,
      thunk: () => functionHandler.fn(...args)
    }
    const promise = new Promise((resolve, reject) => {
      queued.promiseHandler = { resolve, reject }
    })
    functionHandler.queued.push(queued)

    while (
      functionHandler.queued.length &&
      functionHandler.running.length < functionHandler.options.concurrency
    ) {
      const dequeued = functionHandler.queued.shift()
      dequeued.promise = dequeued.thunk()
      functionHandler.running.push(dequeued)
    }

    const runningHandler = functionHandler.running.find(i => i.key === key)

    if (!runningHandler) return promise

    resolveRunning(runningHandler, functionHandler)

    return promise
  }
}

module.exports = {
  makeControlled
}
