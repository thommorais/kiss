if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach
}

(function() {
    let lastTime = 0
    let vendors = ['ms', 'moz', 'webkit', 'o']
    for(let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame']
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame']
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = (callback) => {
            let currTime = new Date().getTime()
            let timeToCall = Math.max(0, 16 - (currTime - lastTime))
            let id = window.setTimeout(() => callback(currTime + timeToCall), timeToCall)
            lastTime = currTime + timeToCall
            return id
        }

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = (id) => clearTimeout(id)
}())


window.requestIdleCallback =
    window.requestIdleCallback ? window.requestIdleCallback :
    (cb) => {
        const start = Date.now()
        return setTimeout(() => {
            cb({
                didTimeout: false,
                timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
            })
        }, 1)
    }

window.cancelIdleCallback = window.cancelIdleCallback ? window.cancelIdleCallback : (id) => clearTimeout(id)
