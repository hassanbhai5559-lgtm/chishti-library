/* =========================================================
CHISHTI LIBRARY
SCRIPT.JS
CLEAN PREMIUM VERSION
========================================================= */
"use strict";

/* =========================================================
GLOBAL BOOK DATA
========================================================= */
let allBooks = [];
let filteredBooks = [];
window.allBooks = allBooks;
window.filteredBooks = filteredBooks;

/* =========================================================
DOM READY
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
    initLoader();
    initMobileMenu();
    initScrollTop();
    initSearch();
    initCategories();
    initPremiumAnimations();
    initCounters();
    
    // Fetch and render books
    fetchBooks();
});

/* =========================================================
FETCH & RENDER BOOKS
========================================================= */
async function fetchBooks() {
    try {
        // Apne JSON / API endpoint ke mutabiq url change kar sakte hain
        const response = await fetch("books.json"); 
        allBooks = await response.json();
        filteredBooks = [...allBooks];
        window.allBooks = allBooks;
        window.filteredBooks = filteredBooks;
        
        renderBooks(filteredBooks);
    } catch (error) {
        console.error("Error loading books:", error);
    }
}

function renderBooks(booksToRender) {
    const container = document.getElementById("books-container") || document.querySelector(".books-grid");
    if (!container) return;

    container.innerHTML = "";

    if (booksToRender.length === 0) {
        container.innerHTML = `<p class="no-books">No books found.</p>`;
        return;
    }

    booksToRender.forEach(book => {
        const card = document.createElement("div");
        card.classList.add("book-card");

        // Clean Card Layout - Chatbot, Like, Share, Comment SAB Removed
        card.innerHTML = `
            <div class="book-cover">
                <img src="${book.cover || 'placeholder.jpg'}" alt="${book.title}" loading="lazy">
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">${book.author || 'Unknown Author'}</p>
                <button class="read-btn" onclick="openReader('${book.id}')">Read Now</button>
            </div>
        `;

        container.appendChild(card);
    });
}

/* =========================================================
READER REDIRECT
========================================================= */
function openReader(bookId) {
    if (bookId) {
        window.location.href = `reader.html?id=${encodeURIComponent(bookId)}`;
    }
}
window.openReader = openReader;

/* =========================================================
SEARCH & CATEGORY FILTERS
========================================================= */
function initSearch() {
    const searchInput = document.getElementById("search-input") || document.querySelector(".search-box input");
    if (!searchInput) return;

    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        filteredBooks = allBooks.filter(book => 
            book.title.toLowerCase().includes(query) || 
            (book.author && book.author.toLowerCase().includes(query))
        );
        window.filteredBooks = filteredBooks;
        renderBooks(filteredBooks);
    });
}

function initCategories() {
    const categoryBtns = document.querySelectorAll(".category-btn");
    if (!categoryBtns.length) return;

    categoryBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            categoryBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const selectedCat = btn.getAttribute("data-category");
            if (!selectedCat || selectedCat === "all") {
                filteredBooks = [...allBooks];
            } else {
                filteredBooks = allBooks.filter(book => book.category === selectedCat);
            }
            window.filteredBooks = filteredBooks;
            renderBooks(filteredBooks);
        });
    });
}

/* =========================================================
UI HELPER FUNCTIONS
========================================================= */
function initLoader() {
    const loader = document.getElementById("loader") || document.querySelector(".preloader");
    if (loader) {
        window.addEventListener("load", () => {
            loader.style.opacity = "0";
            setTimeout(() => loader.style.display = "none", 500);
        });
    }
}

function initMobileMenu() {
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav-menu");
    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", () => {
            navMenu.classList.toggle("active");
            menuToggle.classList.toggle("open");
        });
    }
}

function initScrollTop() {
    const scrollTopBtn = document.querySelector(".scroll-top");
    if (!scrollTopBtn) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add("visible");
        } else {
            scrollTopBtn.classList.remove("visible");
        }
    });

    scrollTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

function initPremiumAnimations() {
    // Basic Intersection Observer for scroll animations
    const animatedElements = document.querySelectorAll(".animate-on-scroll");
    if (!animatedElements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("animated");
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(el => observer.observe(el));
}

function initCounters() {
    const counters = document.querySelectorAll(".counter-number");
    if (!counters.length) return;

    counters.forEach(counter => {
        const target = +counter.getAttribute("data-target");
        if (!target) return;

        let count = 0;
        const speed = target / 50; // Speed factor

        const updateCount = () => {
            count += speed;
            if (count < target) {
                counter.innerText = Math.ceil(count);
                setTimeout(updateCount, 30);
            } else {
                counter.innerText = target;
            }
        };

        updateCount();
    });
}
