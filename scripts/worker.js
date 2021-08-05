/*
 * image-loader.worker.js
 */
self.addEventListener('message', event => {
  const worker = self
  fetch(event.data.path)
  .then(response => response.blob())
  .then((frame) => worker.postMessage({ index: event.data.index, frame }))
  .catch(err => console.log(err))

})