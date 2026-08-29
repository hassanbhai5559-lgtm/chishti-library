/*=========================================
CHISHTI LIBRARY
SCRIPT.JS
FULL CLEAN VERSION
CHATBOT REMOVED
=========================================*/


/*=========================================
PREMIUM LOADER
=========================================*/

window.addEventListener("load", () => {

    const loader =
        document.getElementById("loader");

    if (!loader) return;

    setTimeout(() => {

        loader.style.opacity = "0";

        loader.style.visibility = "hidden";

        setTimeout(() => {

            if (loader) {
                loader.remove();
            }

        }, 800);

    }, 1500);

});



/*=========================================
GLOBAL VARIABLES
=========================================*/

let allBooks = [];

let filteredBooks = [];



/*=========================================
UTILITY
=========================================*/

function byId(id) {

    return document.getElementById(id);

}



/*=========================================
MOBILE MENU
=========================================*/

const menuBtn =
    document.querySelector(".mobile-menu");

const menu =
    document.querySelector(".menu");


if (menuBtn && menu) {

    menuBtn.addEventListener("click", () => {

        menu.classList.toggle("show");

    });


    /* Close mobile menu after clicking link */

    menu.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            menu.classList.remove("show");

        });

    });

}



/*=========================================
SCROLL TO TOP
=========================================*/

const scrollBtn =
    document.getElementById("scrollTop");


window.addEventListener("scroll", () => {

    if (!scrollBtn) return;


    if (window.scrollY > 300) {

        scrollBtn.style.display = "flex";

    }

    else {

        scrollBtn.style.display = "none";

    }

});


if (scrollBtn) {

    scrollBtn.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

}



/*=========================================
NAVBAR SHADOW
=========================================*/

window.addEventListener("scroll", () => {

    const nav =
        document.querySelector(".navbar");

    if (!nav) return;


    if (window.scrollY > 40) {

        nav.classList.add("nav-shadow");

    }

    else {

        nav.classList.remove("nav-shadow");

    }

});



/*=========================================
VISITOR COUNTER
=========================================*/

async function updateVisitorCounter() {

    const visitorCounter =
        document.getElementById("visitorCounter");


    if (!visitorCounter) return;


    /*

       IMPORTANT:

       This requires Firebase db to already
       exist in your project.

    */


    if (typeof db === "undefined") {

        console.warn(
            "Firebase db not found. Visitor counter disabled."
        );

        visitorCounter.innerText = "0";

        return;

    }


    try {

        const visitorRef =
            db
                .collection("counter")
                .doc("visitors");


        const snapshot =
            await visitorRef.get();


        /* CREATE COUNTER */

        if (!snapshot.exists) {

            await visitorRef.set({

                count: 1

            });


            sessionStorage.setItem(
                "chishtiVisitorCounted",
                "true"
            );


            visitorCounter.innerText = "1";

            return;

        }


        /* CHECK SESSION */

        const alreadyCounted =
            sessionStorage.getItem(
                "chishtiVisitorCounted"
            );


        /* NEW VISITOR */

        if (!alreadyCounted) {

            await visitorRef.update({

                count:
                    firebase.firestore.FieldValue.increment(1)

            });


            sessionStorage.setItem(
                "chishtiVisitorCounted",
                "true"
            );

        }


        /* UPDATED COUNT */

        const latestSnapshot =
            await visitorRef.get();


        const visitors =
            Number(
                latestSnapshot.data().count
            ) || 0;


        /* ANIMATION */

        let current = 0;


        const animation =
            setInterval(() => {

                current++;

                visitorCounter.innerText =
                    current;


                if (current >= visitors) {

                    clearInterval(animation);

                }

            }, 25);


    }

    catch (error) {

        console.error(
            "Visitor counter error:",
            error
        );

        visitorCounter.innerText = "0";

    }

}


updateVisitorCounter();



/*=========================================
LOAD BOOKS.JSON
=========================================*/

async function loadBooks() {

    try {

        const response =
            await fetch("books.json");


        if (!response.ok) {

            throw new Error(
                "books.json not found"
            );

        }


        allBooks =
            await response.json();


        if (!Array.isArray(allBooks)) {

            throw new Error(
                "books.json must contain an array"
            );

        }


        filteredBooks =
            [...allBooks];


        /* BOOK COUNTER */

        const bookCounter =
            document.getElementById("bookCounter");


        if (bookCounter) {

            const total =
                allBooks.length;


            let count = 0;


            if (total === 0) {

                bookCounter.innerText = "0";

            }

            else {

                const animation =
                    setInterval(() => {

                        count++;

                        bookCounter.innerText =
                            count;


                        if (count >= total) {

                            clearInterval(animation);

                        }

                    }, 70);

            }

        }


        /* DISPLAY BOOKS */

        displayBooks(filteredBooks);


        /* LATEST BOOK */

        latestBook();


        console.log(
            "✅ Books Loaded Successfully:",
            allBooks.length
        );

    }

    catch (error) {

        console.error(
            "Books loading error:",
            error
        );


        const container =
            document.getElementById(
                "booksContainer"
            );


        if (container) {

            container.innerHTML = `

                <div class="no-books">

                    <h2>
                        Books Could Not Be Loaded
                    </h2>

                    <p>
                        Please check books.json.
                    </p>

                </div>

            `;

        }

    }

}


loadBooks();



/*=========================================
DISPLAY BOOKS
=========================================*/

function displayBooks(books) {

    const container =
        document.getElementById(
            "booksContainer"
        );


    if (!container) return;


    container.innerHTML = "";


    if (!books || books.length === 0) {

        container.innerHTML = `

            <div class="no-books">

                <h2>
                    No Books Found
                </h2>

                <p>
                    Try another search or category.
                </p>

            </div>

        `;

        return;

    }


    books.forEach(book => {

        const title =
            book.title || "Untitled Book";


        const author =
            book.author || "Unknown Author";


        const category =
            book.category || "General";


        const description =
            book.description ||
            "No description available.";


        const cover =
            book.cover ||
            "logo.png";


        const pdf =
            book.pdf || "#";


        const views =
            Number(book.views) || 0;


        const likes =
            Number(book.likes) || 0;


        const downloads =
            Number(book.downloads) || 0;


        container.innerHTML += `

            <div class="book-card">

                <img
                    src="${cover}"
                    alt="${escapeHTML(title)}"
                    loading="lazy"
                    onerror="this.src='logo.png';"
                >


                <div class="book-content">

                    <span class="book-category">

                        ${escapeHTML(category)}

                    </span>


                    <h2>

                        ${escapeHTML(title)}

                    </h2>


                    <h3>

                        ${escapeHTML(author)}

                    </h3>


                    <p>

                        ${escapeHTML(description)}

                    </p>


                    <div class="book-meta">

                        <span>

                            <i class="fas fa-eye"></i>

                            ${views}

                        </span>


                        <span>

                            <i class="fas fa-heart"></i>

                            ${likes}

                        </span>


                        <span>

                            <i class="fas fa-download"></i>

                            ${downloads}

                        </span>

                    </div>


                    <div class="book-buttons">

                        <a
                            href="reader.html?book=${encodeURIComponent(pdf)}"
                            class="btn read-book"
                        >

                            <i class="fas fa-book-open"></i>

                            Read Online

                        </a>


                        <a
                            href="${pdf}"
                            download
                            class="btn download-book"
                        >

                            <i class="fas fa-download"></i>

                            Download

                        </a>

                    </div>

                </div>

            </div>

        `;

    });

}



/*=========================================
HTML ESCAPE
=========================================*/

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}



/*=========================================
LIVE SEARCH
=========================================*/

function searchBooks() {

    const input =
        document.getElementById(
            "searchInput"
        );


    if (!input) return;


    const value =
        input.value
            .toLowerCase()
            .trim();


    filteredBooks =
        allBooks.filter(book => {

            return (

                (book.title || "")
                    .toLowerCase()
                    .includes(value)

                ||

                (book.author || "")
                    .toLowerCase()
                    .includes(value)

                ||

                (book.category || "")
                    .toLowerCase()
                    .includes(value)

                ||

                (book.language || "")
                    .toLowerCase()
                    .includes(value)

            );

        });


    displayBooks(filteredBooks);

}



/*=========================================
SEARCH EVENT
=========================================*/

const searchInput =
    document.getElementById(
        "searchInput"
    );


if (searchInput) {

    searchInput.addEventListener(
        "input",
        searchBooks
    );

}



/*=========================================
CATEGORY FILTER
=========================================*/

function filterBooks(
    category,
    button = null
) {

    document
        .querySelectorAll(".category")
        .forEach(btn => {

            btn.classList.remove("active");

        });


    if (button) {

        button.classList.add("active");

    }


    if (category === "All") {

        filteredBooks =
            [...allBooks];

    }

    else {

        filteredBooks =
            allBooks.filter(book => {

                return String(
                    book.category || ""
                ).toLowerCase() ===
                String(category)
                    .toLowerCase();

            });

    }


    displayBooks(filteredBooks);

}



/*=========================================
LATEST BOOK
=========================================*/

function latestBook() {

    if (!allBooks.length) return;


    let latest =
        allBooks.find(
            book => book.latest === true
        );


    /* fallback */

    if (!latest) {

        latest =
            allBooks[0];

    }


    if (!latest) return;


    const image =
        document.querySelector(
            ".book-image img"
        );


    const title =
        document.querySelector(
            ".book-info h2"
        );


    const author =
        document.querySelector(
            ".book-info h3"
        );


    const desc =
        document.querySelector(
            ".book-info p"
        );


    const buttons =
        document.querySelectorAll(
            ".latest-book .book-buttons a"
        );


    if (image) {

        image.src =
            latest.cover || "logo.png";

        image.alt =
            latest.title || "Latest Book";

    }


    if (title) {

        title.innerText =
            latest.title || "Latest Book";

    }


    if (author) {

        author.innerText =
            latest.author || "Unknown Author";

    }


    if (desc) {

        desc.innerText =
            latest.description ||
            "No description available.";

    }


    if (buttons.length >= 2) {

        buttons[0].href =
            `reader.html?book=${encodeURIComponent(
                latest.pdf || ""
            )}`;


        buttons[0].target =
            "_blank";


        buttons[1].href =
            latest.pdf || "#";

    }

}



/*=========================================
DOWNLOAD COUNTER
=========================================*/

document.addEventListener(
    "click",
    event => {

        const btn =
            event.target.closest(
                "a[download]"
            );


        if (!btn) return;


        let total =
            Number(
                localStorage.getItem(
                    "downloads"
                )
            ) || 0;


        total++;


        localStorage.setItem(
            "downloads",
            total
        );

    }
);



/*=========================================
READ COUNTER
=========================================*/

document.addEventListener(
    "click",
    event => {

        const btn =
            event.target.closest(
                "a"
            );


        if (!btn) return;


        if (
            btn.classList.contains(
                "read-book"
            )
        ) {

            let total =
                Number(
                    localStorage.getItem(
                        "reads"
                    )
                ) || 0;


            total++;


            localStorage.setItem(
                "reads",
                total
            );

        }

    }
);



/*=========================================
BUTTON RIPPLE
=========================================*/

document.addEventListener(
    "click",
    event => {

        const btn =
            event.target.closest(
                ".btn"
            );


        if (!btn) return;


        const ripple =
            document.createElement(
                "span"
            );


        ripple.className =
            "ripple";


        const rect =
            btn.getBoundingClientRect();


        ripple.style.left =
            `${event.clientX - rect.left}px`;


        ripple.style.top =
            `${event.clientY - rect.top}px`;


        btn.appendChild(
            ripple
        );


        setTimeout(() => {

            ripple.remove();

        }, 600);

    }
);



/*=========================================
AUTO YEAR
=========================================*/

const year =
    document.getElementById(
        "year"
    );


if (year) {

    year.innerText =
        new Date().getFullYear();

}



/*=========================================
IMAGE FALLBACK
=========================================*/

document
    .querySelectorAll("img")
    .forEach(img => {

        img.addEventListener(
            "error",
            function () {

                if (
                    this.src.includes(
                        "logo.png"
                    )
                ) {

                    return;

                }


                this.src =
                    "logo.png";

            }
        );

    });



/*=========================================
PRELOAD BOOK COVERS
=========================================*/

window.addEventListener(
    "load",
    () => {

        if (
            !Array.isArray(
                allBooks
            )
        ) {

            return;

        }


        allBooks.forEach(book => {

            if (!book.cover) return;


            const image =
                new Image();


            image.src =
                book.cover;

        });

    }
);



/*=========================================
SMOOTH ANCHOR LINKS
=========================================*/

document
    .querySelectorAll(
        'a[href^="#"]'
    )
    .forEach(anchor => {

        anchor.addEventListener(
            "click",
            function (event) {

                const href =
                    this.getAttribute(
                        "href"
                    );


                if (
                    !href ||
                    href === "#"
                ) {

                    return;

                }


                const target =
                    document.querySelector(
                        href
                    );


                if (!target) return;


                event.preventDefault();


                target.scrollIntoView({

                    behavior: "smooth",

                    block: "start"

                });

            }
        );

    });



/*=========================================
CONSOLE
=========================================*/

console.log(
    "===================================="
);

console.log(
    "📚 CHISHTI LIBRARY"
);

console.log(
    "Version : 2.0"
);

console.log(
    "Developer : Ali Hassan"
);

console.log(
    "===================================="
);

console.log(
    "✅ Loader"
);

console.log(
    "✅ Navbar"
);

console.log(
    "✅ Search"
);

console.log(
    "✅ Categories"
);

console.log(
    "✅ Books"
);

console.log(
    "✅ Latest Book"
);

console.log(
    "✅ Authors"
);

console.log(
    "✅ Contact"
);

console.log(
    "✅ Footer"
);

console.log(
    "✅ WhatsApp"
);

console.log(
    "✅ Reader"
);

console.log(
    "✅ Downloads"
);

console.log(
    "✅ Responsive"
);

console.log(
    "🚀 Production Ready"
);
