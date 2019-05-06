# Concurrency Control

Make any function that returns a promise a concurrency controlled function. Useful for dealing with rate limiting.


## Installing 

```bash
$ npm install concurrency-control
```

## Example

Say you need to query an API that implments rate limiting and you have a function that queries it. You could control how many times you execute this function in every place in your project, but it would be better to make it manage its own concurrency and export this controlled function from a module.

```js
const { getFromApi } = require('myApi')
const { makeControlled } = require('concurrency-control')

// a concurrency parameter of 1 makes the function secuential
const MAX_CONCURRENT = 3
const controlledGetFromApi = makeControlled(getFromApi, { concurrency: MAX_CONCURRENT })

let i = 50
while (i--) // functions will be executed in batches, never more than 3 at a time
  controlledGetFromApi(i)
    .then(result => { ... })
    .catch(error => { ... })
```
