import isMobile from 'is-mobile'
import {getConnection} from '../helpers'


const path = process.env.CDN

const connection = getConnection()


const chapter1 = (connection && connection.downlink >= 5) ? 'high' : 'low'

const horizontal = {
    chapters : [{
            name: 'chapter-1',
            duration: 19260,
            frames: 404,
            ignore: [[238, 336]],
            source: `${path}/desktop/chapter-1/${chapter1}/`
        },{
            name: 'chapter-2',
            duration: 16400,
            frames: 210,
            source: `${path}/desktop/chapter-2/`
        },{
            name: 'chapter-3',
            duration: 7200,
            frames: 168,
            source: `${path}/desktop/chapter-3/`
        },{
            name: 'chapter-4',
            duration: 9400,
            frames: 310,
            frames: 288,
            source: `${path}/desktop/chapter-4/`
        },{
            name: 'video-ogier',
            duration: 2300,
            frames: 97,
            ignore: [[50, 95]],
            source: `${path}/desktop/video-ogier/`
        },{
            name: 'banner-fotos-vitimas',
            duration: 4600,
            frames: 142,
            source: `${path}/desktop/banner/`
        },
    ]
}

const vertical = {
    chapters : [{
            name: 'chapter-1',
            duration: 10600,
            frames: 404,
            ignore: [[231, 340]],
            source: `${path}/mobile/chapter-1/`
        },{
            name: 'chapter-2',
            duration: 9600,
            frames: 218,
            ignore: [[192, 209], [213, 225]],
            source: `${path}/mobile/chapter-2/`
        },{
            name: 'chapter-3',
            duration: 5400,
            ignore: [[121, 156]],
            frames: 120,
            source: `${path}/mobile/chapter-3/`
        },{
            name: 'chapter-4',
            duration: 7500,
            frames: 284,
            ignore: [[277, 283]],
            source: `${path}/mobile/chapter-4/`
        },{
            name: 'video-ogier',
            duration: 4000,
            frames: 110,
            ignore: [[46, 109]],
            source: `${path}/mobile/video-ogier/`
        },{
            name: 'banner-fotos-vitimas',
            duration: 5000,
            frames: 120,
            source: `${path}/mobile/banner/`
        },
    ]
}

const defaultState = isMobile() ? vertical : horizontal

function scenesReducer(state = defaultState) {
  return state
}

export default scenesReducer

// L = ffmpeg -i input.mp4 -s 1440x810 -vcodec libx264 -acodec aac output.mp4
// ffmpeg -i input.mp4 -vf fps=fps=6 -qscale:v 6 low/%04d.jpg
//ffmpeg -i input.mov -vcodec libvpx -qmin 0 -qmax 50 -crf 10 -b:v 1M -acodec libvorbis output.webm
