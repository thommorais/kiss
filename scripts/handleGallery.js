export function lazyLoadImages(){
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const image = entry.target
                requestAnimationFrame(() => {

                    if(image.tagName.toLowerCase() === 'source'){
                        image.srcset = image.dataset.srcset
                    }

                    if(image.tagName.toLowerCase() === 'img'){
                        image.src = image.dataset.src
                    }

                })
                observer.unobserve(image)
            }
        })

    }, {
        root: null,
        rootMargin: '10% 0px 0px 0px',
    })

    const images = document.querySelectorAll('.lazyload, .lazy > source')
    images.forEach(image => observer.observe(image))
}