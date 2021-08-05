import gsap from 'gsap'
import ScrollHandler from './scrollHandler'
import isMobile from 'is-mobile'
// import indicators from  './helpers/indicators'

import animationModule from './frameHelpers/animation.gsap'

import getImages, {fetchAll, fetchOnBackground} from './frameHelpers/getImages'

import setStage from './frameHelpers/setStage'

import { calculateAspectRatio } from './helpers'

// redux stuff
import store from './store'



function createContainerForLegends(size){
    document.documentElement.style
    .setProperty('--container-width', size)
}

// enable gsap tweening cool thing (needs learn if this is)
animationModule(ScrollHandler, gsap)

/**
 * @param {NodeList} legendsNodeList
 */
function createArrayOfLegends(legendsNodeList){
    return Array.from(legendsNodeList).map(element => {

        const dataAttr = (!isMobile() && element.dataset.desktime) ? 'desktime' : 'time'

        let [start, end] = element.dataset[dataAttr].split(',')

        return {
            element,
            start: Number(start),
            end: Number(end),
        }
    })
}

/**
 * @param {String} scene
 */
function getDurationAndNumberOfFrames(scene){
    const chapterFrames = store.getState().scenes.chapters.find(({name}) => name === scene)
    return {
        duration: chapterFrames.duration,
        numberOfFrames: chapterFrames.frames
    }
}


/**
 * @desc turn on and of legends of scenes by frame index.
 * @param {Array} legends array of objects containing the nodeElement and start and end time
 * @param {Number} frame current scroll index from scene
 */
function handleLegend(legends, frame){
    const toShow = legends.filter(({start, end}) => frame >= (start + 1) && frame < end)
    const toHide = legends.filter(({end, start}) => frame <= start || frame > end )

    if(toHide.length){
        toHide.forEach(legend => legend.element.classList.remove('showing'))
    }

    if(toShow.length){
        toShow.forEach(legend => legend.element.classList.add('showing'))
    }

}

const hideOnControl = {
    lettering: document.querySelector('[data-hideon]'),
    scrollIcon: document.querySelector('.scrolling-icon')
}

function hideOn(target, frame){

    if(target.dataset.scene === 'chapter-1'){
        if(frame >= 12){
            hideOnControl.lettering.classList.add('hide')
        }else{
            hideOnControl.lettering.classList.remove('hide')
        }

        if(frame >= 6){
            hideOnControl.scrollIcon.classList.add('aside')
        }else{
            hideOnControl.scrollIcon.classList.remove('aside')
        }
    }else{
        hideOnControl.scrollIcon.classList.add('aside')
        hideOnControl.lettering.classList.add('hide')
    }
}

/**
 * @desc paint an image on the canvas of the chapter
 * @param {Element} stage a canvas context (2d)
 * @param {Array} sceneFrames array of object if image and an index
 * @param {Number} frameIndex current scroll index from scene
 */

 let lastPaint = null

function paintImageOnCanvas(stage, scene, frameIndex){

    if(!scene){
        return
    }

    const sceneFrames = store.getState().frames[scene] || []

    if(!sceneFrames || !sceneFrames.length){
        console.error('there is no image for the', scene)
        return
    }

    const { frame } =
        sceneFrames.find((frame) => frame.index === frameIndex) || {}

    if (frame) {

        cancelAnimationFrame(lastPaint)

        lastPaint = requestAnimationFrame(() => {

            const { height, width } = calculateAspectRatio(
                frame.naturalWidth,
                frame.naturalHeight,
                stage.canvas.width,
                stage.canvas.height
            )

            const left = stage.canvas.width / 2 - width / 2
            const top = stage.canvas.height / 2 - height / 2

            // stage.clearRect(0, 0, width, height)
            stage.drawImage(frame, left, top, width, height)
        })

    }else{
        if(frameIndex % 2){
            console.log(`frame ${frameIndex} of ${scene} was not found`)
        }
    }

}

/**
 * @desc this do a lot, create the scene and the tweening,
 *  dispatch function for each frame update.
 *  listen to updates on the redux storage.
 * @param {String} scene
 * @param {Element} stage
 * @param {NodeList} legendsNodeList
 * @param {Element} chapterNodeElement the chapter nodeElement
 */
function handleChapter(scene, stage, legendsNodeList, chapterNodeElement){
    let legends = createArrayOfLegends(legendsNodeList)

    /**
     * @todo need to make it more clear
     */
    const wrapper =  stage.canvas.parentElement.parentElement


    const sceneControl = {
        currentScene: 0,
        lastFrame: 0,
        containerSize: 0
    }


    /**
     * @desc dispatch functions for each frame update
     * @param {Number} frame the current frame
     * @fires {@link paintImageOnCanvas}
     * @fires {@link handleLegend}
     * @fires {@link handleLastFrame}
     */
    function handleFrame(frame){
        // avoid renders that weirdly can happen
        if(sceneControl.lastFrame === frame){
            return
        }

        paintImageOnCanvas(stage, scene, frame)
        handleLegend(legends, frame)

        hideOn(stage.canvas, frame)

        sceneControl.lastFrame = frame

        // defines the width of the container width canvas inside
        if(sceneControl.lastFrame !== stage.canvas.width){
            createContainerForLegends(stage.canvas.width)
        }
    }

    const {duration, numberOfFrames} = getDurationAndNumberOfFrames(scene)

    const tween = gsap.to(sceneControl, {
        currentScene: numberOfFrames,
        roundProps: 'currentScene',
        onUpdate: () => handleFrame(sceneControl.currentScene),
    })

    const controller = new ScrollHandler.Controller()

   new ScrollHandler.Scene({
        duration,
        triggerHook: 0,
        triggerElement: wrapper,
    })
    .setTween(tween)
    .setPin(wrapper)
    .addTo(controller)
    .setClassToggle(wrapper, 'current')
    .on('enter', () => {
       chapterNodeElement.classList.add('current-chapter')
     })
    .on('leave', () => {
       chapterNodeElement.classList.remove('current-chapter')
     })

    // to avoid starting on a black frame
    paintImageOnCanvas(1)
}

/**
 * @param {Element} chapterTitle
 */
function handleChapterHeader(chapterTitle){
    const push =  {pushFollowers: true}
    const letterings = chapterTitle.querySelectorAll('.lettering-item:not(.not-sticky)')

    letterings.forEach(lettering => {

        const controller = new ScrollHandler.Controller()

        const tween = gsap.to(lettering, 1, {
            opacity: 0,
            scaleX: 0.95,
            scaleY: 0.95
        })

        new ScrollHandler.Scene({
            triggerElement: lettering,
            triggerHook: 'onLeave',
            duration: '70%'
        })
        .setPin(lettering, push)
        .setTween(tween)
        .addTo(controller)

    })

}

/**
 * this does what the name says it does
 * @param {String} scene name
 */
export function fetchFrames(scene, callback){
    const sceneFrames = store.getState().scenes.chapters
    if(sceneFrames && sceneFrames.length){
        const frames = sceneFrames.find(e => e.name === scene)
        getImages({...frames, progress: callback })
    }
}

/**
 * @desc lots of forEachs to starts the scene
 */
export function startScenes() {

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stages = entry.target.querySelectorAll('.stage')
                stages.forEach(stage => fetchFrames(stage.dataset.scene))
                observer.unobserve(entry.target)
            }
        })

    }, {
        root: null,
        rootMargin: '0px 0px 0px 350px',
    })

    const chapters = document.querySelectorAll('.chapter')

    chapters.forEach(section => {
        // fetch frames only when is necessary
        observer.observe(section)

        const stageWrappers = section.querySelectorAll('.stage-wrapper')
        const chapterTitles = section.querySelectorAll('.lettering')

        stageWrappers.forEach(stageWrapper => {
            const stages = stageWrapper.querySelectorAll('.stage')
            const legends = stageWrapper.querySelectorAll('.legends .legend-item')
            stages.forEach(stage => {
                requestAnimationFrame(() => {
                    const ctx = setStage(stage)
                    handleChapter(stage.dataset.scene, ctx, legends, section)
                })
            })

        })

        if(chapterTitles.length){
            chapterTitles.forEach(handleChapterHeader)
        }

    })
}


/**
 * @desc this is just to load the first scene
 */
export function fetchFirstScenes(callback){

    if(isMobile()){
        return new Promise((resolve) => {
            console.log('fetchAll')
            fetchAll(progress =>{
                if(progress >= 0.99){
                    resolve('all chapters are loaaded')
                }else{
                    callback && callback(progress)
                }
            })
        })
    }

    return new Promise((resolve) => {
        fetchFrames('chapter-1', progress => {
            if(progress >= 0.99){
                resolve('chapter 1 loaaded')
            }else{
               callback && callback(progress)
            }
        })
    })
}

export function fetchFramesOnBackground(){
    store.getState().scenes.chapters.forEach(fetchOnBackground)
}

function ozierFacebookPost(){
    const facebookPost = document.querySelector('.ozier-facebook-post')
    const push =  {pushFollowers: false}

    const controller = new ScrollHandler.Controller( )

    const tween = gsap.to(facebookPost, 1, {
        opacity: 0,
        scaleX: 0.95,
        scaleY: 0.95
    })

    new ScrollHandler.Scene({
        triggerElement: facebookPost,
        triggerHook: 'onLeave',
        duration: '100%'
    })
    .setPin(facebookPost, push)
    .addTo(controller)
    .setTween(tween)

}

export function handleJessicaPosts(){
    const push =  {pushFollowers: false}
    const facebookHandles = document.querySelectorAll('.facebook-post.sticky')

    facebookHandles.forEach(facebookPost => {

        const pins = facebookPost.querySelectorAll('.pin')

        pins.forEach(pin => {
            const controller = new ScrollHandler.Controller()

            const tween = gsap.to(pin, 1, {
                opacity: 0,
                scaleX: 0.95,
                scaleY: 0.95
            })

            new ScrollHandler.Scene({
                triggerElement: pin,
                triggerHook: 'onLeave',
                duration: '100%'
            })
            .setPin(pin, push)
            .setTween(tween)
            .addTo(controller)
        })


    })

}

export function handleFacebookPosts(){
    ozierFacebookPost()
    handleJessicaPosts()
}