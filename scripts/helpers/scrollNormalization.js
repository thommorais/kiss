
import isEventSupported from 'is-event-supported'
import UserAgent_DEPRECATED from './UserAgent_DEPRECATED'


const PIXEL_STEP  = 10
const LINE_HEIGHT = 40
const PAGE_HEIGHT = window.innerHeight

function normalizeWheel(event) {

  let sX = 0 // spinX
  let sY = 0 //spinY
  let pX = 0 // pixelX
  let pY = 0 // pixelY

  // Legacy
  if ('detail'      in event) { sY = event.detail }
  if ('wheelDelta'  in event) { sY = -event.wheelDelta / 120 }
  if ('wheelDeltaY' in event) { sY = -event.wheelDeltaY / 120 }
  if ('wheelDeltaX' in event) { sX = -event.wheelDeltaX / 120 }

  // side scrolling on FF with DOMMouseScroll
  if ( 'axis' in event && event.axis === event.HORIZONTAL_AXIS ) {
    sX = sY;
    sY = 0;
  }

  pX = sX * PIXEL_STEP
  pY = sY * PIXEL_STEP

  if ('deltaY' in event) { pY = event.deltaY }
  if ('deltaX' in event) { pX = event.deltaX }

  if ((pX || pY) && event.deltaMode) {
    if (event.deltaMode == 1) {
      pX *= LINE_HEIGHT
      pY *= LINE_HEIGHT
    } else {
      pX *= PAGE_HEIGHT
      pY *= PAGE_HEIGHT
    }
  }

  // Fall-back if spin cannot be determined
  if (pX && !sX) {
    console.log('on fallback')
    sX = (pX < 1) ? -1 : 1
   }
  if (pY && !sY) {
    console.log('on fallback')
    sY = (pY < 1) ? -1 : 1
  }

  return { spinX  : sX,
           spinY  : sY,
           pixelX : pX,
           pixelY : pY }
}


/**
 * The best combination if you prefer spinX + spinY normalization.  It favors
 * the older DOMMouseScroll for Firefox, as FF does not include wheelDelta with
 * 'wheel' event, making spin speed determination impossible.
 */
normalizeWheel.getEventType = function(){
   return (UserAgent_DEPRECATED.firefox())
           ? 'DOMMouseScroll'
           : (isEventSupported('wheel'))
               ? 'wheel'
               : 'mousewheel';
}

export default normalizeWheel