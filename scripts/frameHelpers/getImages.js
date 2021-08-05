import { promisesWithProgress, getConnection } from '../helpers'

// redux stuff
import store from '../store'
import { Creators as framesCreators } from '../store/frames'

const connection = getConnection()

function checkIframesAlreadyAreLoaded(name) {
    const { frames } = store.getState()

    if(frames[name]){
        console.log('trying to refetch the same stuff')
    }

    return frames[name] ? frames[name] : null
}

function loadFrame(obj){
    return new Promise((resolve, reject) => {
        const frame = new Image()
        frame.src = obj.path
        frame.onload = () => resolve({ index: obj.index, frame })
        frame.onerror = () => reject(obj)
    })
}

/**
 * creates array for loop
 */
function createOddsAndEvensArrays(frames, source, ignore){

    const sceneFrames = {
        odds: [],
        evens: [],
    }

    for (let i = 1; i < frames + 1; i++) {

        let skip = false
        // ignore repeaated frames
        if(ignore){
            for(let range of ignore){
                const [start, end] = range
                if(i >= start && i <= end){
                    skip = true
                }
            }
            if(skip)
                continue
        }

        const path = `${String(i).padStart(4, '0')}.jpg`

        const frameObj =  {
            index: i,
            path: `${source}${path}`,
        }

        if (i % 2 !== 1) {
            sceneFrames.evens.push(frameObj)
        } else {
            sceneFrames.odds.push(frameObj)
        }

    }

    return sceneFrames
}

function addFrametoStore(frame, name){
    store.dispatch(framesCreators.add({frames: [frame], name}) )
}

const isFetching = []

export function fetchAll(callback) {
    const {chapters} = store.getState().scenes

    const promises = chapters
        .map(({ name, frames, source, ignore }) => {
            console.log(name)

            // just to avoid reload unnecessarily
            const isAlreadyLoaded = checkIframesAlreadyAreLoaded(name)

            if (isAlreadyLoaded || isFetching.includes(name)) {
                return isAlreadyLoaded
            }

            isFetching.push(name)

            //just to keep things in order
            const {evens} = createOddsAndEvensArrays(frames, source, ignore)

            // get and save to the redux store the odds ones
            return evens.map(image => loadFrame(image)
                .then((frame) => addFrametoStore(frame, name))
                .catch(e => console.log(`frame not loaded`, e)))

        })

        console.log('promises', promises.flatMap(x => x))

        return promisesWithProgress(promises.flatMap(x => x), callback)

}

/**
 * @desc load images, first the odds, then the evens
 * this is just to get the scrollable scene ready faster
 */
export default function getImages({ name, frames, source, progress, ignore }) {

    // just to avoid reload unnecessarily
    const isAlreadyLoaded = checkIframesAlreadyAreLoaded(name)

    if (isAlreadyLoaded || isFetching.includes(name)) {
        return isAlreadyLoaded
    }

    isFetching.push(name)

    //just to keep things in order
    const sceneFrames = createOddsAndEvensArrays(frames, source, ignore)

    // get and save to the redux store the odds ones
    const oddPromises = sceneFrames.odds.map(frame =>
        loadFrame(frame)
        .then((frame) => addFrametoStore(frame, name))
        // this is not ideal, but for now is good
        .catch(e => console.log(`frame not loaded`, e)))

    promisesWithProgress(oddPromises, progress).finally( () => {
        if(connection && connection.downlink >= 9){
            // using a web worker to load the evens imagens on anotther thread
            const worker = new Worker('../worker.js')

            worker.onmessage = e => {
                requestIdleCallback(() => {
                    const frame = new Image()
                    frame.src = URL.createObjectURL(e.data.frame)
                    addFrametoStore({...e.data, frame}, name)
                })
            }

            // get and save to the redux store the evens ones
            sceneFrames.evens.forEach(frame =>
                requestIdleCallback( () => worker.postMessage(frame))
            )
        }
    })

}

export function fetchOnBackground({ name, frames, source, ignore }) {

    setTimeout(() => {
        // just to avoid reload unnecessarily
        const isAlreadyLoaded = checkIframesAlreadyAreLoaded(name)

        if (isAlreadyLoaded || isFetching.includes(name)) {
            return isAlreadyLoaded
        }

        isFetching.push(name)

        const worker = new Worker('../worker.js')

        worker.onmessage = e => {
            requestIdleCallback(() => {
                const frame = new Image()
                frame.src = URL.createObjectURL(e.data.frame)
                addFrametoStore({...e.data, frame}, name)
            })
        }

        //just to keep things in order
        const sceneFrames = createOddsAndEvensArrays(frames, source, ignore)

        // get and save to the redux store the evens ones
        sceneFrames.evens.forEach(frame => requestIdleCallback( () => worker.postMessage(frame)))

        // get and save to the redux store the evens ones
        sceneFrames.odds.forEach(frame => requestIdleCallback( () => worker.postMessage(frame)))
    }, 20000)

}


