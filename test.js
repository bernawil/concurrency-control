const { makeControlled } = require('./index.js')

const asyncOperation = (arg1, arg2) =>
  new Promise((resolve, reject) => {
    const msj = `you provided ${arg1} and ${arg2} as args`
    return arg1 > 5
      ? setTimeout(() => resolve(msj), 10)
      : setTimeout(() => reject(msj), 10)
  })

const managedFn = makeControlled(asyncOperation, { concurrency: 3 })
let i = 50
while (i--) {
  managedFn(String(Math.random() * 10)[0], i)
    .then((...res) => {
      console.log("resolved! ", ...res)
    })
    .catch((...res) => {
      console.log("rejected! ", ...res)
    })
}
