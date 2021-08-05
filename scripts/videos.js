import isMobile from 'is-mobile'
import {percentage, hideElement, unlockScroll} from './helpers'


/**
 *
 * @param {*} opts config * list * callback * unobserve
 */
function iO(opts){

    const {
        list = [],
        callback = () => null,
        unobserve = false,
        config = {}
    } = opts

    const observer = new IntersectionObserver(entries => {

        entries.forEach(entry => {
            const {isIntersecting, target} = entry
            if (isIntersecting) {
                callback(target, entry)
                if(unobserve){
                    observer.unobserve(target)
                }
            }
        })

    }, config)

    list.forEach(observable => observer.observe(observable))

}


export function showIntroLettering() {
    requestAnimationFrame(() => {
        const letteringIntro = document.querySelector('.lettering-intro')
        letteringIntro.classList.add('active')
    })

}

export function showScrollIcon(){
    requestAnimationFrame(() => {
        const scrollingIcon = document.querySelector('.scrolling-icon')
        scrollingIcon.classList.add('active')
    })
}

/**
 * @desc handles the intro video
 * @param {Element} video
 * @returns {Object} with promises
 */
function handleVideoIntro(video) {

    const control = {
        unlocked: false,
        lettering: false,
        duration: video.duration
    }

    function handleTimeUpdates() {

        if(video.currentTime >= 2 && !control.lettering){
            // this should not be here, but who got time. 🚨❌🚨
            control.lettering = true
            showIntroLettering()
            // this should not be here, but who got time.
        }

        if(video.currentTime >= 3 && !control.unlock){
            control.unlocked = true
            requestAnimationFrame(unlockScroll)
            requestAnimationFrame(showScrollIcon)
        }

        if(video.currentTime >= 6){
            video.removeEventListener('timeupdate', handleTimeUpdates, false)
        }

    }

    video.addEventListener('timeupdate', handleTimeUpdates, false)
}

/**
 * @desc load videos basead on device
 * @param {Element} video
 */
export function loadVideo(video, opts = {}){
    for (var source in video.children) {
        const videoSource = video.children[source]
        if (typeof videoSource.tagName === 'string' && videoSource.tagName === 'SOURCE') {
            if(!videoSource.src){
                const {mobile, desktop} = videoSource.dataset
                videoSource.src = (isMobile() && mobile) ? mobile : desktop
                video.load()
                if(opts.play){
                    requestAnimationFrame(() => video.play())
                }
            }
        }
    }
}

function addsPlaybutton(video){
    let reload = false
    const playButton = document.querySelector('.play-video').cloneNode(true)
    playButton.classList.remove('hidden')
    playButton.addEventListener('click', () => {
        video.play()
        if(reload){
            video.currentTime = 0.01
        }
        reload = false
    })

    video.addEventListener('play', () => {
        playButton.style.opacity = 0
    })

    video.addEventListener('pause', () => {
        playButton.style.opacity = 1
    })

    video.addEventListener('ended', () => {
        reload = true
        playButton.style.opacity = 1
    })

    video.parentElement.appendChild(playButton)
}

function loadGalleryVideos(){

    const config = {
        root: null,
        rootMargin: '-25% 0px 0px -25%',
        treshold: 1
    }

    const mosaicVideos = document.querySelectorAll('.mosaic-video video')
    const galleryVideos = document.querySelectorAll('.gallery-video video')

    iO({
        config,
        callback: (target) => {
            loadVideo(target)
            const videoIsPlayble = target.play()
            if (videoIsPlayble !== undefined) {
                videoIsPlayble.catch(() => addsPlaybutton(target))
            }
        },
        unobserve: true,
        list: [...mosaicVideos, ...galleryVideos],
    })

}

function loadDepoimentVideos(){

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const {isIntersecting, target} = entry
            const video = target.querySelector('video')
            if (isIntersecting) {
                 loadVideo(video)
                 if(!isMobile()){
                     addsPlaybutton(video)
                     const { desk } = video.dataset
                     if (desk) {
                        video.poster = desk
                     }
                 }
                 observer.unobserve(target)
            }
        })

    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0
    })

    const videos = document.querySelectorAll('.video:not(.intro)')

    videos.forEach(section => observer.observe(section))


}

function handleCreditsVideo(){

    const wrapper = document.querySelector('.credits')
    const videoFooter = wrapper.querySelector('.video-footer video')
    const title = document.querySelector('.last-title')

    function hideLettering(e){

        const elapsedTime = percentage(e.target.currentTime, e.target.duration)

        if (elapsedTime >= 98) {
            requestAnimationFrame(() => videoFooter.pause())
            videoFooter.removeEventListener('timeupdate', hideLettering)
        }

        if (elapsedTime >= 5) {
            wrapper.classList.add('active')
        }

        if (elapsedTime >= 7) {
            hideElement(title)
        }

        if (elapsedTime >= 9) {
            wrapper.classList.add('show-credits')
        }

    }

    videoFooter.addEventListener('timeupdate', hideLettering)
    // videoFooter.defaultPlaybackRate = 5


    const config = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    }

   iO({
        config,
        callback: videoFooter => {
            requestIdleCallback(() => {
                loadVideo(videoFooter)
                videoFooter.currentTime = 0.09
                videoFooter.play()
            })
        },
        unobserve: true,
        list: [videoFooter],
    })

}

function handleVideos(){
    loadDepoimentVideos()
    loadGalleryVideos()
    handleCreditsVideo()
}

export { handleVideoIntro, handleVideos }
