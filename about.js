/* =========================================
   TAARUF SECTION ANIMATION
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const items = document.querySelectorAll(
        ".intro-heading, .intro-profile, .biography-content"
    );

    const observer = new IntersectionObserver(
        (entries) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("show");

                    observer.unobserve(entry.target);

                }

            });

        },
        {
            threshold: 0.12
        }
    );

    items.forEach(item => {

        item.classList.add("reveal");

        observer.observe(item);

    });

});
