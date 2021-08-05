module.exports = {
  "plugins": {
    "posthtml-expressions": {
      locals: {
        cdn: process.env.CDN
      }
    }
  }
}