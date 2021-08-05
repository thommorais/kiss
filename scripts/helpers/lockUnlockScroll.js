const body = document.body

function unlockScroll(){
   body.classList.remove("locked")
   body.style.overflow = 'unset'
}

function lockScroll() {
    body.classList.add("locked")
}

export {
    unlockScroll,
    lockScroll
}