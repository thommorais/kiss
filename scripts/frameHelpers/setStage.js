import { calculateAspectRatio, defaultResolutions } from "../helpers"
import isMobile from 'is-mobile'

function setCanvasSize(canvas) {

    const { height, width } = calculateAspectRatio(
        isMobile() ? defaultResolutions.small.width : defaultResolutions.large.width,
        isMobile() ? defaultResolutions.small.height : defaultResolutions.large.height,
        window.innerWidth,
        window.innerHeight,
    )

    canvas.width = width
    canvas.height = height

    return {
        height,
        width,
    }
}

function setStage(stage) {
    setCanvasSize(stage)
    window.addEventListener('resize', setCanvasSize.bind(null, stage))
    return stage.getContext('2d', {alpha: !0})
}
export default setStage
