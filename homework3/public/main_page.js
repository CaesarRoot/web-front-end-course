window.onload = () => {
    var elements = document.querySelectorAll('img');
    
    var callback = (entries) => {
        entries.map(item => {
            if (item.intersectionRatio > 0) {
                var e = item.target;
                var imageSource = e.getAttribute('data-src');
                if (imageSource) {
                    e.setAttribute('src', imageSource);
                    e.removeAttribute('data-src');
                }
            }
        })
    }
    var observer = new IntersectionObserver(callback);

    elements.forEach(item => {
        observer.observe(item);
    })
}