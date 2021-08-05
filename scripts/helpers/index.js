// Default Resolutions
export * from './lockUnlockScroll'
export * from './logs'
export {default as scrollNormalization } from './scrollNormalization'

const defaultResolutions = {
    large: {
        width: 1458,
        height: 820,
    },
    medium: {
        width: 998,
        height: 560,
    },
    small: {
        width: 414,
        height: 736,
    },
}
// Get scroll position
function getScrollPos() {
    return {
        y: window.scrollY || window.pageYOffset,
        x: window.scrollX || window.pageXOffset,
    }
}

// Calculate aspect ration
function calculateAspectRatio(srcWidth, srcHeight, maxWidth, maxHeight) {
    const [width, height] = [maxWidth / srcWidth, maxHeight / srcHeight]
    const ratio = Math.min(width, height)

    return { width: srcWidth * ratio, height: srcHeight * ratio }
}

// Test Retina
function isRetina() {
    if (window.matchMedia) {
        const mq = window.matchMedia(
            "only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)"
        )
        return (mq && mq.matches) || window.devicePixelRatio > 1
    }
}

// Math
function percentage(part, total, fixed = 2) {
    if (typeof part !== "number" && typeof total !== "number") {
        throw new Error("Parameter is not a number!")
    }

    return Number(((100 * part) / total).toFixed(fixed))
}

// Misc
function promisesWithProgress(promises, onProgress) {
    let counter = 0
    promises.forEach(async promise => {
        await promise
        if (onProgress && onProgress instanceof Function) {
            onProgress(++counter / promises.length)
        }
    })
    return Promise.all(promises)
}

function getConnection(){
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if(connection){
        const { rtt, downlink, effectiveType, saveData } = connection
        // console.log(`Effective network connection type: ${effectiveType}`)
        // console.log(`Downlink Speed/bandwidth estimate: ${downlink}Mb/s`)
        // console.log(`Round-trip time estimate: ${rtt}ms`)
        // console.log(`Data-saver mode on/requested: ${saveData}`)
        return connection
    }
    return null
}


/**
 * @desc fade in and fade out giving target, when it reachs the {max} value it starts to fadeout
 * @param {NodeElement} target
 * @param {Number} value
 */
function fadeInAndFadeOut(options){

    let {
        target,
        value,
        rad = 100,
        min = 20,
    } = options

    let opacity = value
    const max = rad - min

    if(value >= min && value < max){
        opacity =  value + min
    }else if(value >= max){
        opacity =  100 - (value - 100)
    }

    target.style.opacity = opacity / 100

}


export {
    percentage,
    isRetina,
    promisesWithProgress,
    getScrollPos,
    calculateAspectRatio,
    defaultResolutions,
    fadeInAndFadeOut,
    getConnection
}


export function hideElement(target){

    Object.assign(target.style, {
        opacity: 0,
        pointerEvents: 'none',
    })

    return null
}


let toggleClassesControl = {

    add(target, classie, id){
        if(!this[id].classie.includes(classie)){
            target.classList.add(classie)
            this[id].classie.push(classie)
        }
    },
    remove(target, classie, id){
        if(this[id].classie.includes(classie)){
            target.classList.remove(classie)
            this[id].classie = this[id].classie.filter(cl => cl !== classie)
        }
    }

}


/**
 * just a helper to avoid toggling classes too much on older browsers
 * @param {*} id
 * @param {*} classie
 * @param {*} target
 * @param {*} action
 */
export function toggleClasses(id, classie, target, action){

    if(!toggleClassesControl[id]){
        toggleClassesControl = {
            ...toggleClassesControl,
            [id]: {
                classie: [classie],
            }
        }
    }

    toggleClassesControl[action](target, classie, id)

    return id
}