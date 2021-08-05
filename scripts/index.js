import 'babel-polyfill'
import webFont from 'webfontloader'
import isMobile from 'is-mobile'
import { lockScroll, unlockScroll, percentage } from "./helpers"
import { lazyLoadImages } from './handleGallery'

import './helpers/polyfills'

const isMobil = isMobile()

function testIfBrowserSupportIO(){

    if ('IntersectionObserver' in window &&
        'IntersectionObserverEntry' in window &&
        'intersectionRatio' in window.IntersectionObserverEntry.prototype) {
        return new Promise((res) => res())
    }

    return import('./polyfills/io')
}

function loadSmoothScroll(){
    if(!isMobil){
        return import('./helpers/smoothscroll').then( smoothscroll => requestIdleCallback(smoothscroll))
    }
}

function smoothstep(min, max, value) {
  const x = Math.max(0, Math.min(1, (value-min)/(max-min)))
  return x*x*(3 - 2*x)
}

function createProgressBar(){
    const bar = document.getElementById('progressbar')
    bar.classList.add('active')

    function updateProgress(){
        const scrollTop = document.documentElement['scrollTop'] || document.body['scrollTop']
        const scrollBottom = (document.documentElement['scrollHeight'] || document.body['scrollHeight']) - document.documentElement.clientHeight
        let scrollPercent = smoothstep(0, scrollBottom, scrollTop)
        bar.style.setProperty('--progress', scrollPercent)
    }

    document.addEventListener('scroll', updateProgress, { passive: true })
}


async function init(){

    await testIfBrowserSupportIO()
    await loadSmoothScroll()

    import('./videos').then( async videos => {

        webFont.load({ google: {families: ['Barlow+Condensed:300,600']} })

        const video = document.querySelector('.intro video')
        const preloadScreen = document.querySelector('.preload')
        const counter = preloadScreen.querySelector('.counter')

        function updateCounter(progress){
            const loaded = percentage(progress, 0.99, 0)
            counter.value = `${loaded}%`
            if(loaded >= 99){
                preloadScreen.classList.add('disabled')
            }
        }

        updateCounter(0)

        import('./scenes').then( async scenes => {

            requestIdleCallback(scenes.startScenes)
            requestIdleCallback(lazyLoadImages)
            requestIdleCallback(videos.handleVideos)
            requestIdleCallback(scenes.handleFacebookPosts)
            requestAnimationFrame(createProgressBar)
            requestIdleCallback(scenes.fetchFramesOnBackground)

            // fallback that runs anyways
            setTimeout(() => {
                requestIdleCallback(videos.showScrollIcon)
                requestIdleCallback(unlockScroll)
                console.log('unlocked on timeout')
            }, 30000)

            await scenes.fetchFirstScenes(updateCounter)

            const canPlay = video.play()

            canPlay
                .then(() => videos.handleVideoIntro(video))
                .catch(videos.showIntroLettering)

        })


    })

}

// to ensure that the browser start at 0 0
if (window.scrollY) {
    window.scroll(0, 0)
}

lockScroll()
init()


