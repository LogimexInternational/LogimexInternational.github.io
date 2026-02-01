/* =========================================
   LOGIMEX SCROLL REVEAL ANIMATIONS
   Luxury fade-in effect on scroll
   ========================================= */

document.addEventListener('DOMContentLoaded', function() {
    
    // Select all elements to animate
    const animatedElements = document.querySelectorAll(`
        .reveal-item,
        article h2,
        article h3,
        article p,
        article ul,
        article ol,
        article blockquote,
        article hr,
        .box-simple,
        .box-image-text,
        .container > .row
    `);

    // Intersection Observer options
    const observerOptions = {
        root: null,           // viewport
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1        // trigger when 10% visible
    };

    // Create observer
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Add visible class with a small delay for smoothness
                requestAnimationFrame(() => {
                    entry.target.classList.add('is-visible');
                });
                
                // Stop observing once animated
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe each element
    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // Immediately show elements in viewport on page load
    setTimeout(() => {
        animatedElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.85) {
                el.classList.add('is-visible');
            }
        });
    }, 100);

});
