/*==================================================
CHISHTI LIBRARY
Production Script
Part 1 - Global Variables & Initialization
==================================================*/

"use strict";

/*==================================================
Global State
==================================================*/

let books = [];
let filteredBooks = [];
let chatbotData = [];

/*==================================================
Local Storage Keys
==================================================*/

const STORAGE = {
    visitor: "chishti_visitor",
    visitors: "chishti_total_visitors",
    downloads: "chishti_total_downloads"
};

/*==================================================
DOM Elements
==================================================*/

const booksContainer = document.getElementById("booksContainer");
const latestBooksContainer = document.getElementById("latestBooks");
const categoryButtons = document.getElementById("categoryButtons");

const heroSearch = document.getElementById("heroSearch");
const librarySearch = document.getElementById("librarySearch");

const noBooksFound = document.getElementById("noBooksFound");

const totalBooks = document.getElementById("booksCount");
const totalVisitors = document.getElementById("visitorsCount");
const totalDownloads = document.getElementById("downloadsCount");
const totalAuthors = document.getElementById("authorsCount");

const loader = document.getElementById("loader");
const backToTop = document.getElementById("backToTop");

const header = document.getElementById("header");

/*==================================================
Utility Functions
==================================================*/

function $(selector) {
    return document.querySelector(selector);
}

function $all(selector) {
    return document.querySelectorAll(selector);
}

/*==================================================
Toast Notification
==================================================*/

function showToast(message, type = "success") {

    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.className = "toast";

    toast.classList.add(type);

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}

/*==================================================
Loader
==================================================*/

function hideLoader() {

    if (!loader) return;

    setTimeout(() => {

        loader.classList.add("hide");

    }, 600);

}

/*==================================================
Visitor Counter
==================================================*/

function updateVisitorCounter() {

    let visitors = Number(
        localStorage.getItem(STORAGE.visitors)
    ) || 0;

    const visited = localStorage.getItem(
        STORAGE.visitor
    );

    if (!visited) {

        visitors++;

        localStorage.setItem(
            STORAGE.visitors,
            visitors
        );

        localStorage.setItem(
            STORAGE.visitor,
            "true"
        );

    }

    if (totalVisitors) {

        totalVisitors.textContent =
            visitors.toLocaleString();

    }

}

/*==================================================
Download Counter
==================================================*/

function updateDownloadCounter() {

    let downloads = Number(
        localStorage.getItem(STORAGE.downloads)
    ) || 0;

    downloads++;

    localStorage.setItem(
        STORAGE.downloads,
        downloads
    );

    if (totalDownloads) {

        totalDownloads.textContent =
            downloads.toLocaleString();

    }

}

/*==================================================
Load Saved Download Count
==================================================*/

function loadDownloadCounter() {

    const downloads = Number(
        localStorage.getItem(STORAGE.downloads)
    ) || 0;

    if (totalDownloads) {

        totalDownloads.textContent =
            downloads.toLocaleString();

    }

}

/*==================================================
Animated Counter
==================================================*/

function animateCounter(element, target) {

    if (!element) return;

    let start = 0;

    const duration = 1200;

    const increment = target / (duration / 16);

    function update() {

        start += increment;

        if (start >= target) {

            element.textContent =
                target.toLocaleString();

            return;

        }

        element.textContent =
            Math.floor(start).toLocaleString();

        requestAnimationFrame(update);

    }

    update();

}

/*==================================================
Header Scroll Effect
==================================================*/

window.addEventListener("scroll", () => {

    if (!header) return;

    if (window.scrollY > 60) {

        header.classList.add("scrolled");

    } else {

        header.classList.remove("scrolled");

    }

});

/*==================================================
Back To Top Button
==================================================*/

window.addEventListener("scroll", () => {

    if (!backToTop) return;

    if (window.scrollY > 500) {

        backToTop.classList.add("show");

    } else {

        backToTop.classList.remove("show");

    }

});

if (backToTop) {

    backToTop.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

}                           
/*==================================================
CHISHTI LIBRARY
Production Script
Part 2 - Load Books & Categories
==================================================*/

/*==================================================
Load Books
==================================================*/

async function loadBooks() {

    try {

        const response = await fetch("books.json");

        if (!response.ok) {
            throw new Error("Unable to load books.json");
        }

        books = await response.json();

        filteredBooks = [...books];

        renderBooks(filteredBooks);

        loadLatestBooks();

        generateCategories();

        updateCounters();

    } catch (error) {

        console.error(error);

        showToast("Unable to load library.", "error");

    }

}

/*==================================================
Latest Books
==================================================*/

function loadLatestBooks() {

    if (!latestBooksContainer) return;

    latestBooksContainer.innerHTML = "";

    const latest = books.filter(book => book.latest === true);

    if (latest.length === 0) {

        latestBooksContainer.innerHTML =
        `
            <div class="no-books">
                <h3>No Latest Books Found</h3>
            </div>
        `;

        return;

    }

    latest.forEach(book => {

        latestBooksContainer.insertAdjacentHTML(
            "beforeend",
            createBookCard(book)
        );

    });

}

/*==================================================
Generate Categories
==================================================*/

function generateCategories() {

    if (!categoryButtons) return;

    categoryButtons.innerHTML = "";

    const categories = [
        "All",
        ...new Set(
            books.map(book => book.category)
        )
    ];

    categories.forEach(category => {

        const button = document.createElement("button");

        button.textContent = category;

        if (category === "All") {

            button.classList.add("active");

        }

        button.addEventListener("click", () => {

            document
                .querySelectorAll("#categoryButtons button")
                .forEach(btn => btn.classList.remove("active"));

            button.classList.add("active");

            filterBooks(category);

        });

        categoryButtons.appendChild(button);

    });

}

/*==================================================
Update Counters
==================================================*/

function updateCounters() {

    if (totalBooks) {

        animateCounter(
            totalBooks,
            books.length
        );

    }

    const uniqueAuthors = new Set(
        books.map(book => book.author)
    );

    if (totalAuthors) {

        animateCounter(
            totalAuthors,
            uniqueAuthors.size
        );

    }

    updateVisitorCounter();

    loadDownloadCounter();

}

/*==================================================
Footer Categories
==================================================*/

function loadFooterCategories() {

    const footer = document.getElementById(
        "footerCategories"
    );

    if (!footer) return;

    footer.innerHTML = "";

    const categories = [
        ...new Set(
            books.map(book => book.category)
        )
    ];

    categories.forEach(category => {

        const li = document.createElement("li");

        li.innerHTML = `<a href="books.html">${category}</a>`;

        footer.appendChild(li);

    });

}

/*==================================================
Load Everything
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    loadBooks();

    loadFooterCategories();

    hideLoader();

});
/*==================================================
CHISHTI LIBRARY
Production Script
Part 3 - Render Books & Book Cards
==================================================*/

/*==================================================
Create Book Card
==================================================*/

function createBookCard(book) {

    return `

    <article class="book-card fade-up">

        <div class="book-cover">

            <img
                src="${book.cover}"
                alt="${book.title}"
                loading="lazy"
            >

            ${book.latest
                ? '<span class="latest-badge">Latest</span>'
                : ""
            }

            <span class="category-badge">
                ${book.category}
            </span>

        </div>

        <div class="book-content">

            <h3 class="book-title">
                ${book.title}
            </h3>

            <div class="book-author">
                ${book.author}
            </div>

            <p class="book-description">
                ${book.description}
            </p>

            <div class="book-stats">

                <div class="book-stat">

                    👁️
                    <span>${book.views}</span>

                </div>

                <div class="book-stat">

                    📥
                    <span>${book.downloads}</span>

                </div>

            </div>

            <div class="book-actions">

                <a
                    class="read-btn"
                    href="reader.html?book=${book.id}"
                >
                    Read Online
                </a>

                <a
                    class="download-btn"
                    href="${book.pdf}"
                    download
                    data-book="${book.id}"
                >
                    Download PDF
                </a>

            </div>

        </div>

    </article>

    `;

}

/*==================================================
Render Books
==================================================*/

function renderBooks(bookList) {

    if (!booksContainer) return;

    booksContainer.innerHTML = "";

    if (!bookList.length) {

        booksContainer.innerHTML = `

            <div class="no-books">

                <img
                    src="assets/images/logo.png"
                    class="empty-logo"
                    alt="Logo"
                >

                <h3>No Books Found</h3>

                <p>
                    Try another search or category.
                </p>

            </div>

        `;

        return;

    }

    bookList.forEach(book => {

        booksContainer.insertAdjacentHTML(

            "beforeend",

            createBookCard(book)

        );

    });

    attachDownloadEvents();

}

/*==================================================
Download Events
==================================================*/

function attachDownloadEvents() {

    const buttons = document.querySelectorAll(

        ".download-btn"

    );

    buttons.forEach(button => {

        button.addEventListener(

            "click",

            function () {

                updateDownloadCounter();

                const id = Number(

                    this.dataset.book

                );

                const book = books.find(

                    item => item.id === id

                );

                if (book) {

                    book.downloads++;

                }

                showToast(

                    "Download Started",

                    "success"

                );

            }

        );

    });

}

/*==================================================
Read Button Animation
==================================================*/

document.addEventListener(

    "click",

    event => {

        if (

            event.target.classList.contains(

                "read-btn"

            )

        ) {

            showToast(

                "Opening Reader...",

                "success"

            );

        }

    }

);

/*==================================================
Refresh Library
==================================================*/

function refreshLibrary() {

    renderBooks(filteredBooks);

}
/*==================================================
CHISHTI LIBRARY
Production Script
Part 4 - Search & Category Filtering
==================================================*/

/*==================================================
Filter Books By Category
==================================================*/

function filterBooks(category) {

    if (category === "All") {

        filteredBooks = [...books];

    } else {

        filteredBooks = books.filter(book =>
            book.category.toLowerCase() ===
            category.toLowerCase()
        );

    }

    renderBooks(filteredBooks);

}

/*==================================================
Search Books
==================================================*/

function searchBooks(searchText) {

    const keyword = searchText.trim().toLowerCase();

    if (keyword === "") {

        renderBooks(filteredBooks);

        return;

    }

    const results = filteredBooks.filter(book => {

        const title = (book.title || "").toLowerCase();

        const author = (book.author || "").toLowerCase();

        const category = (book.category || "").toLowerCase();

        const description = (book.description || "").toLowerCase();

        const keywords = Array.isArray(book.keywords)
            ? book.keywords.join(" ").toLowerCase()
            : "";

        return (

            title.includes(keyword) ||

            author.includes(keyword) ||

            category.includes(keyword) ||

            description.includes(keyword) ||

            keywords.includes(keyword)

        );

    });

    renderBooks(results);

}

/*==================================================
Hero Search
==================================================*/

if (heroSearch) {

    heroSearch.addEventListener("input", e => {

        searchBooks(e.target.value);

    });

}

/*==================================================
Library Search
==================================================*/

if (librarySearch) {

    librarySearch.addEventListener("input", e => {

        searchBooks(e.target.value);

    });

}

/*==================================================
Search On Enter
==================================================*/

function handleSearchEnter(input) {

    if (!input) return;

    input.addEventListener("keypress", event => {

        if (event.key === "Enter") {

            event.preventDefault();

            searchBooks(input.value);

        }

    });

}

handleSearchEnter(heroSearch);

handleSearchEnter(librarySearch);

/*==================================================
Clear Search
==================================================*/

function clearSearch() {

    if (heroSearch) {

        heroSearch.value = "";

    }

    if (librarySearch) {

        librarySearch.value = "";

    }

    renderBooks(filteredBooks);

}

/*==================================================
Highlight Active Category
==================================================*/

function setActiveCategory(button) {

    document.querySelectorAll("#categoryButtons button")

        .forEach(btn => {

            btn.classList.remove("active");

        });

    button.classList.add("active");

}

/*==================================================
Search From URL
Example:
books.html?search=naat
==================================================*/

function searchFromURL() {

    const params = new URLSearchParams(window.location.search);

    const keyword = params.get("search");

    if (!keyword) return;

    if (heroSearch) {

        heroSearch.value = keyword;

    }

    if (librarySearch) {

        librarySearch.value = keyword;

    }

    searchBooks(keyword);

}

/*==================================================
Initialize Search
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    searchFromURL();

});
/*==================================================
CHISHTI LIBRARY
Production Script
Part 5 - Counters & Statistics
==================================================*/

/*==================================================
Book Counter
==================================================*/

function updateBookCounter() {

    if (!totalBooks) return;

    animateCounter(

        totalBooks,

        books.length

    );

}

/*==================================================
Author Counter
==================================================*/

function updateAuthorCounter() {

    if (!totalAuthors) return;

    const uniqueAuthors = [

        ...new Set(

            books.map(book => book.author)

        )

    ];

    animateCounter(

        totalAuthors,

        uniqueAuthors.length

    );

}

/*==================================================
Download Counter
==================================================*/

function getTotalDownloads() {

    const localDownloads = Number(

        localStorage.getItem(

            STORAGE.downloads

        )

    ) || 0;

    if (totalDownloads) {

        animateCounter(

            totalDownloads,

            localDownloads

        );

    }

}

/*==================================================
Visitor Counter
==================================================*/

function getVisitorCount() {

    const visitors = Number(

        localStorage.getItem(

            STORAGE.visitors

        )

    ) || 1;

    if (totalVisitors) {

        animateCounter(

            totalVisitors,

            visitors

        );

    }

}

/*==================================================
Library Statistics
==================================================*/

function calculateStatistics() {

    const stats = {

        books: books.length,

        authors: new Set(

            books.map(book => book.author)

        ).size,

        categories: new Set(

            books.map(book => book.category)

        ).size,

        views: books.reduce(

            (total, book) =>

                total + (Number(book.views) || 0),

            0

        ),

        downloads: books.reduce(

            (total, book) =>

                total + (Number(book.downloads) || 0),

            0

        )

    };

    return stats;

}

/*==================================================
Console Statistics
==================================================*/

function printStatistics() {

    const stats = calculateStatistics();

    console.table({

        Books: stats.books,

        Authors: stats.authors,

        Categories: stats.categories,

        Views: stats.views,

        Downloads: stats.downloads

    });

}

/*==================================================
Update All Counters
==================================================*/

function refreshCounters() {

    updateBookCounter();

    updateAuthorCounter();

    getVisitorCount();

    getTotalDownloads();

}

/*==================================================
Increment Book View
==================================================*/

function incrementBookView(bookId) {

    const book = books.find(

        item => item.id == bookId

    );

    if (!book) return;

    book.views = Number(book.views) + 1;

}

/*==================================================
Increment Book Download
==================================================*/

function incrementBookDownload(bookId) {

    const book = books.find(

        item => item.id == bookId

    );

    if (!book) return;

    book.downloads = Number(book.downloads) + 1;

    updateDownloadCounter();

}

/*==================================================
Popular Books
==================================================*/

function getPopularBooks(limit = 6) {

    return [...books]

        .sort(

            (a, b) =>

                b.views - a.views

        )

        .slice(0, limit);

}

/*==================================================
Newest Books
==================================================*/

function getLatestBooks(limit = 6) {

    return books

        .filter(

            book => book.latest === true

        )

        .slice(0, limit);

}

/*==================================================
Featured Authors
==================================================*/

function getFeaturedAuthors(limit = 6) {

    const authors = {};

    books.forEach(book => {

        if (!authors[book.author]) {

            authors[book.author] = 0;

        }

        authors[book.author]++;

    });

    return Object.entries(authors)

        .sort(

            (a, b) =>

                b[1] - a[1]

        )

        .slice(0, limit);

}

/*==================================================
Initialize Statistics
==================================================*/

document.addEventListener(

    "DOMContentLoaded",

    () => {

        setTimeout(() => {

            refreshCounters();

            printStatistics();

        }, 500);

    }

);
/*==================================================
CHISHTI LIBRARY
Production Script
Part 6 - Authors
==================================================*/

/*==================================================
Unique Authors
==================================================*/

function getUniqueAuthors() {

    const map = new Map();

    books.forEach(book => {

        const name = (book.author || "").trim();

        if (!name) return;

        if (!map.has(name)) {

            map.set(name, {
                name: name,
                books: []
            });

        }

        map.get(name).books.push(book);

    });

    return [...map.values()]
        .sort((a, b) => a.name.localeCompare(b.name));

}

/*==================================================
Create Author Card
==================================================*/

function createAuthorCard(author) {

    const firstBook = author.books[0];

    const cover = firstBook.cover;

    return `

    <article class="author-card fade-up">

        <div class="author-image">

            <img
                src="${cover}"
                alt="${author.name}"
                loading="lazy"
            >

        </div>

        <div class="author-content">

            <h3 class="author-name">

                ${author.name}

            </h3>

            <p class="author-books">

                ${author.books.length}
                Book${author.books.length > 1 ? "s" : ""}

            </p>

            <p class="author-bio">

                Islamic writer featured in the
                Chishti Library collection.

            </p>

            <button
                class="author-view-btn"
                data-author="${author.name}"
            >

                View Books

            </button>

        </div>

    </article>

    `;

}

/*==================================================
Render Authors
==================================================*/

function loadAuthors() {

    const container =
        document.getElementById("authorsContainer");

    if (!container) return;

    container.innerHTML = "";

    const authors = getUniqueAuthors();

    authors.forEach(author => {

        container.insertAdjacentHTML(

            "beforeend",

            createAuthorCard(author)

        );

    });

    attachAuthorButtons();

}

/*==================================================
Author Buttons
==================================================*/

function attachAuthorButtons() {

    document

        .querySelectorAll(".author-view-btn")

        .forEach(button => {

            button.addEventListener(

                "click",

                function () {

                    const author =

                        this.dataset.author;

                    window.location.href =

                        "books.html?search=" +

                        encodeURIComponent(author);

                }

            );

        });

}

/*==================================================
Author Search
==================================================*/

function searchAuthors(keyword) {

    const cards =

        document.querySelectorAll(".author-card");

    const text =

        keyword.trim().toLowerCase();

    cards.forEach(card => {

        const name =

            card

            .querySelector(".author-name")

            .textContent

            .toLowerCase();

        if (

            name.includes(text)

        ) {

            card.style.display = "";

        } else {

            card.style.display = "none";

        }

    });

}

/*==================================================
Author Search Input
==================================================*/

const authorSearch =

    document.getElementById("authorSearch");

if (authorSearch) {

    authorSearch.addEventListener(

        "input",

        e => {

            searchAuthors(

                e.target.value

            );

        }

    );

}

/*==================================================
Initialize Authors
==================================================*/

document.addEventListener(

    "DOMContentLoaded",

    () => {

        loadAuthors();

    }

);
/*==================================================
CHISHTI LIBRARY
Production Script
Part 7 - AI Chatbot
==================================================*/

/*==================================================
Chatbot State
==================================================*/

let chatbotKnowledge = [];

/*==================================================
DOM Elements
==================================================*/

const chatToggle = document.getElementById("chatToggle");
const chatWindow = document.getElementById("chatWindow");
const chatClose = document.getElementById("chatClose");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const chatSend = document.getElementById("chatSend");
const typingIndicator = document.getElementById("typingIndicator");

/*==================================================
Load Chatbot JSON
==================================================*/

async function loadChatbot() {

    try {

        const response = await fetch("chatbot.json");

        if (!response.ok) {
            throw new Error("Unable to load chatbot.json");
        }

        chatbotKnowledge = await response.json();

    } catch (error) {

        console.error(error);

        chatbotKnowledge = [];

    }

}

/*==================================================
Open / Close Chat
==================================================*/

function openChat() {

    if (!chatWindow) return;

    chatWindow.classList.add("active");

    chatInput.focus();

}

function closeChat() {

    if (!chatWindow) return;

    chatWindow.classList.remove("active");

}

if (chatToggle) {

    chatToggle.addEventListener("click", openChat);

}

if (chatClose) {

    chatClose.addEventListener("click", closeChat);

}

/*==================================================
Create Message
==================================================*/

function createMessage(text, sender = "bot") {

    if (!chatMessages) return;

    const wrapper = document.createElement("div");

    wrapper.className =
        sender === "user"
            ? "message user"
            : "message";

            if (sender === "
/*==================================================
CHISHTI LIBRARY
Production Script
Part 8 - Reader Page (PDF Viewer System)
==================================================*/

/*==================================================
Get Book ID from URL
==================================================*/

function getBookIdFromURL() {

    const params = new URLSearchParams(window.location.search);

    return params.get("book");

}

/*==================================================
Load Book into Reader
==================================================*/

function loadReaderBook() {

    const bookId = getBookIdFromURL();

    if (!bookId) return;

    const book = books.find(b => b.id == bookId);

    if (!book) {

        showToast("Book not found", "error");

        return;

    }

    const readerFrame = document.getElementById("readerFrame");

    const readerTitle = document.getElementById("readerTitle");

    if (readerFrame) {

        readerFrame.src = book.reader || book.pdf;

    }

    if (readerTitle) {

        readerTitle.textContent = book.title;

    }

    incrementBookView(bookId);

}

/*==================================================
Reader Controls
==================================================*/

function setupReaderControls() {

    const backBtn = document.getElementById("backBtn");

    const fullscreenBtn = document.getElementById("fullscreenBtn");

    const downloadBtn = document.getElementById("downloadBtn");

    const readerFrame = document.getElementById("readerFrame");

    /* Back Button */

    if (backBtn) {

        backBtn.addEventListener("click", () => {

            window.history.back();

        });

    }

    /* Fullscreen */

    if (fullscreenBtn && readerFrame) {

        fullscreenBtn.addEventListener("click", () => {

            if (readerFrame.requestFullscreen) {

                readerFrame.requestFullscreen();

            }

        });

    }

    /* Download */

    if (downloadBtn) {

        downloadBtn.addEventListener("click", () => {

            const bookId = getBookIdFromURL();

            const book = books.find(b => b.id == bookId);

            if (!book) return;

            const link = document.createElement("a");

            link.href = book.pdf;

            link.download = book.title + ".pdf";

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);

            incrementBookDownload(bookId);

            showToast("Download Started", "success");

        });

    }

}

/*==================================================
Zoom Controls (Optional UI support)
==================================================*/

let zoomLevel = 1;

function zoomIn() {

    const frame = document.getElementById("readerFrame");

    if (!frame) return;

    zoomLevel += 0.1;

    frame.style.transform = `scale(${zoomLevel})`;

}

function zoomOut() {

    const frame = document.getElementById("readerFrame");

    if (!frame) return;

    zoomLevel -= 0.1;

    if (zoomLevel < 0.5) zoomLevel = 0.5;

    frame.style.transform = `scale(${zoomLevel})`;

}

/*==================================================
Reader Init
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    if (window.location.pathname.includes("reader.html")) {

        setTimeout(() => {

            loadReaderBook();

            setupReaderControls();

        }, 500);

    }

});
/*==================================================
CHISHTI LIBRARY
Production Script
Part 9 - Navigation, Header, Smooth Scroll
==================================================*/

/*==================================================
Smooth Scroll
==================================================*/

function smoothScroll() {

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {

        anchor.addEventListener("click", function (e) {

            e.preventDefault();

            const target = document.querySelector(this.getAttribute("href"));

            if (target) {

                target.scrollIntoView({

                    behavior: "smooth",

                    block: "start"

                });

            }

        });

    });

}

/*==================================================
Header Shrink Effect
==================================================*/

function handleHeaderScroll() {

    if (!header) return;

    window.addEventListener("scroll", () => {

        if (window.scrollY > 80) {

            header.classList.add("shrink");

        } else {

            header.classList.remove("shrink");

        }

    });

}

/*==================================================
Mobile Menu Toggle
==================================================*/

function initMobileMenu() {

    const menuBtn = document.getElementById("menuToggle");

    const nav = document.getElementById("navMenu");

    if (!menuBtn || !nav) return;

    menuBtn.addEventListener("click", () => {

        nav.classList.toggle("active");

        menuBtn.classList.toggle("active");

    });

    document.querySelectorAll("#navMenu a").forEach(link => {

        link.addEventListener("click", () => {

            nav.classList.remove("active");

            menuBtn.classList.remove("active");

        });

    });

}

/*==================================================
Active Navigation Link
==================================================*/

function setActiveNav() {

    const links = document.querySelectorAll("#navMenu a");

    const currentPage = window.location.pathname.split("/").pop();

    links.forEach(link => {

        if (link.getAttribute("href") === currentPage) {

            link.classList.add("active");

        }

    });

}

/*==================================================
Scroll Reveal Helper
==================================================*/

function revealOnScroll() {

    const elements = document.querySelectorAll(".fade-up, .fade-left, .fade-right, .zoom-in");

    const observer = new IntersectionObserver(entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

            }

        });

    }, {

        threshold: 0.15

    });

    elements.forEach(el => observer.observe(el));

}

/*==================================================
Back To Top Smooth Behavior
==================================================*/

function enhanceBackToTop() {

    if (!backToTop) return;

    backToTop.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

}

/*==================================================
Initialize Part 9 Features
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    smoothScroll();

    handleHeaderScroll();

    initMobileMenu();

    setActiveNav();

    revealOnScroll();

    enhanceBackToTop();

});
/*==================================================
CHISHTI LIBRARY
Production Script
Part 10 - Loader, Background Effects & Animations
==================================================*/

/*==================================================
Loader Control
==================================================*/

window.addEventListener("load", () => {

    setTimeout(() => {

        hideLoader();

        createStars();

        initParticles();

        smoothScroll();

    }, 800);

});

/*==================================================
Create Falling Stars Background
==================================================*/

function createStars() {

    const starContainer = document.createElement("div");

    starContainer.className = "stars-container";

    document.body.appendChild(starContainer);

    for (let i = 0; i < 60; i++) {

        const star = document.createElement("span");

        star.className = "star";

        star.style.left = Math.random() * 100 + "%";

        star.style.top = Math.random() * 100 + "%";

        star.style.animationDuration = (Math.random() * 3 + 2) + "s";

        star.style.opacity = Math.random();

        starContainer.appendChild(star);

    }

}

/*==================================================
Particles Background Effect
==================================================*/

function initParticles() {

    const particleContainer = document.createElement("div");

    particleContainer.className = "particles";

    document.body.appendChild(particleContainer);

    for (let i = 0; i < 40; i++) {

        const p = document.createElement("div");

        p.className = "particle";

        p.style.left = Math.random() * 100 + "%";

        p.style.top = Math.random() * 100 + "%";

        p.style.animationDuration = (Math.random() * 5 + 3) + "s";

        particleContainer.appendChild(p);

    }

}

/*==================================================
Smooth Scroll
==================================================*/

function smoothScroll() {

    document.querySelectorAll("a[href^='#']").forEach(anchor => {

        anchor.addEventListener("click", function (e) {

            e.preventDefault();

            const target = document.querySelector(this.getAttribute("href"));

            if (target) {

                target.scrollIntoView({

                    behavior: "smooth"

                });

            }

        });

    });

}

/*==================================================
Scroll Animations (Intersection Observer)
==================================================*/

function initScrollAnimations() {

    const elements = document.querySelectorAll(".fade-up, .fade-left, .fade-right, .zoom-in");

    const observer = new IntersectionObserver(entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

            }

        });

    }, {

        threshold: 0.15

    });

    elements.forEach(el => observer.observe(el));

}

/*==================================================
Parallax Effect
==================================================*/

window.addEventListener("scroll", () => {

    const scrolled = window.scrollY;

    const stars = document.querySelectorAll(".star");

    stars.forEach((star, index) => {

        const speed = (index % 5 + 1) * 0.2;

        star.style.transform =

            `translateY(${scrolled * speed}px)`;

    });

});
/*==================================================
CHISHTI LIBRARY
Production Script
Part 11 - Search Modal, Toast, Utilities
==================================================*/

/*==================================================
Search Modal Elements
==================================================*/

const searchModal = document.getElementById("searchModal");
const openSearchBtn = document.getElementById("openSearch");
const closeSearchBtn = document.getElementById("closeSearch");
const modalSearchInput = document.getElementById("modalSearchInput");
const modalSearchResults = document.getElementById("modalSearchResults");

/*==================================================
Open Search Modal
==================================================*/

function openSearchModal() {

    if (!searchModal) return;

    searchModal.classList.add("active");

    setTimeout(() => {

        modalSearchInput?.focus();

    }, 200);

}

/*==================================================
Close Search Modal
==================================================*/

function closeSearchModal() {

    if (!searchModal) return;

    searchModal.classList.remove("active");

}

/*==================================================
Bind Search Modal Events
==================================================*/

if (openSearchBtn) {

    openSearchBtn.addEventListener("click", openSearchModal);

}

if (closeSearchBtn) {

    closeSearchBtn.addEventListener("click", closeSearchModal);

}

if (searchModal) {

    searchModal.addEventListener("click", (e) => {

        if (e.target === searchModal) {

            closeSearchModal();

        }

    });

}

/*==================================================
Modal Search Function
==================================================*/

function modalSearch(keyword) {

    const text = keyword.trim().toLowerCase();

    if (!modalSearchResults) return;

    modalSearchResults.innerHTML = "";

    if (!text) return;

    const results = books.filter(book => {

        return (

            book.title.toLowerCase().includes(text) ||

            book.author.toLowerCase().includes(text) ||

            book.category.toLowerCase().includes(text)

        );

    });

    if (results.length === 0) {

        modalSearchResults.innerHTML = `
            <div class="search-item">
                <h4>No Results Found</h4>
                <p>Try another keyword</p>
            </div>
        `;

        return;

    }

    results.forEach(book => {

        const item = document.createElement("div");

        item.className = "search-item";

        item.innerHTML = `
            <h4>${book.title}</h4>
            <p>${book.author} • ${book.category}</p>
        `;

        item.addEventListener("click", () => {

            window.location.href =
                `reader.html?book=${book.id}`;

        });

        modalSearchResults.appendChild(item);

    });

}

/*==================================================
Modal Input Listener
==================================================*/

if (modalSearchInput) {

    modalSearchInput.addEventListener("input", (e) => {

        modalSearch(e.target.value);

    });

}

/*==================================================
Toast System (Improved Safety)
==================================================*/

function showToast(message, type = "success") {

    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.className = "toast";

    toast.classList.add(type);

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}

/*==================================================
Smooth Scroll Utility
==================================================*/

function smoothScrollTo(targetId) {

    const el = document.getElementById(targetId);

    if (!el) return;

    window.scrollTo({

        top: el.offsetTop - 80,

        behavior: "smooth"

    });

}

/*==================================================
Debounce Utility (Performance)
==================================================*/

function debounce(func, delay = 300) {

    let timer;

    return function (...args) {

        clearTimeout(timer);

        timer = setTimeout(() => {

            func.apply(this, args);

        }, delay);

    };

}

/*==================================================
Throttled Scroll Handler Helper
==================================================*/

function throttle(func, limit = 100) {

    let lastFunc;

    let lastRan;

    return function () {

        const context = this;

        const args = arguments;

        if (!lastRan) {

            func.apply(context, args);

            lastRan = Date.now();

        } else {

            clearTimeout(lastFunc);

            lastFunc = setTimeout(() => {

                if ((Date.now() - lastRan) >= limit) {

                    func.apply(context, args);

                    lastRan = Date.now();

                }

            }, limit - (Date.now() - lastRan));

        }

    };

}

/*==================================================
Keyboard ESC Close Modals
==================================================*/

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        closeSearchModal();

    }

});
/*==================================================
CHISHTI LIBRARY
Production Script
Part 12 - FINAL INIT, EVENTS & SYSTEM CLEANUP
==================================================*/

/*==================================================
Smooth Scroll
==================================================*/

function smoothScroll() {

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {

        anchor.addEventListener("click", function (e) {

            e.preventDefault();

            const target = document.querySelector(this.getAttribute("href"));

            if (target) {

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });

}

/*==================================================
Global Click Handler
==================================================*/

document.addEventListener("click", (e) => {

    // Close dropdowns or modals if needed later

    if (e.target.classList.contains("overlay-close")) {

        document.querySelectorAll(".active").forEach(el => {

            el.classList.remove("active");

        });

    }

});

/*==================================================
Initialize Stars / Effects Hook
==================================================*/

function initEffects() {

    // Placeholder hook for CSS animated stars
    // Can be extended later if canvas effects added

    console.log("✨ Chishti Library Effects Loaded");

}

/*==================================================
Main Initialization Function
==================================================*/

function initApp() {

    try {

        // Core system
        smoothScroll();

        initEffects();

        // Load main data
        loadBooks();

        // Counters
        refreshCounters();

        // Authors
        loadAuthors();

        // Hide loader safely
        hideLoader();

        // Print system status
        console.log("📚 Chishti Library Loaded Successfully");

    } catch (error) {

        console.error("Init Error:", error);

        showToast("System Error Loading Library", "error");

    }

}

/*==================================================
Download Hook Override (Global Safety)
==================================================*/

document.addEventListener("click", (e) => {

    const downloadBtn = e.target.closest(".download-btn");

    if (downloadBtn) {

        const bookId = downloadBtn.dataset.book;

        if (bookId) {

            incrementBookDownload(bookId);

        }

    }

});

/*==================================================
Reader Page Handler
==================================================*/

function initReaderPage() {

    const params = new URLSearchParams(window.location.search);

    const bookId = params.get("book");

    const frame = document.getElementById("pdfFrame");

    if (!bookId || !frame) return;

    const book = books.find(b => b.id == bookId);

    if (!book) return;

    frame.src = book.reader || book.pdf;

    incrementBookView(bookId);

}

/*==================================================
Page Detection
==================================================*/

function detectPage() {

    const path = window.location.pathname;

    if (path.includes("reader.html")) {

        setTimeout(initReaderPage, 500);

    }

}

/*==================================================
Keyboard Shortcuts
==================================================*/

document.addEventListener("keydown", (e) => {

    // ESC key resets search

    if (e.key === "Escape") {

        clearSearch();

    }

});

/*==================================================
Error Handling
==================================================*/

window.addEventListener("error", (e) => {

    console.error("Global Error:", e.message);

});

/*==================================================
Network Safety (Fetch Fallback)
==================================================*/

window.addEventListener("offline", () => {

    showToast("You are offline", "warning");

});

window.addEventListener("online", () => {

    showToast("Back Online", "success");

});

/*==================================================
FINAL BOOTSTRAP
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    initApp();

    detectPage();

});
