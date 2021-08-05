export const Types = {
    ADD: "FRAMES/ADD",
}

export const Creators = {
    add: ({ name, frames }) => ({
        type: Types.ADD,
        payload: {
            scene: name,
            frames,
        },
    }),
}

function framesReducer(state = {}, action) {
    const { type, payload } = action

    switch (type) {
        case Types.ADD: {
            const { scene, frames = [] } = payload

            if (!scene) {
                return {...state}
            }

            const chapterSceneState = state[scene] ? state[scene]: []

            const newFrames = {
                [scene]: [
                    ...chapterSceneState,
                    ...frames,
                  ],
            }

            return {
                ...state,
                ...newFrames,
            }
        }
        default: {
            return state
        }
    }
}

export default framesReducer
