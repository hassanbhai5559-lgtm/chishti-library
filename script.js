/* =========================================================
CHISHTI LIBRARY
SCRIPT.JS
CLEAN PREMIUM VERSION
========================================================= */
"use strict";

/* =========================================================
GLOBAL BOOK DATA & CONFIGURATION
========================================================= */
let allBooks = [];
let filteredBooks = [];
window.allBooks = allBooks;
window.filteredBooks = filteredBooks;

// Fallback data agar aapka backend/JSON server available na ho
const fallbackBooks = [
    {
        id: "chishti-001",
        title: "Kashf-ul-Mahjoob",
        author: "Hazrat Data Ganj Bakhsh (R.A)",
        category: "sufism",
        cover: "assets/images/kashf.jpg"
    },
    {
        id: "chishti-002",
        title: "Fawa'id-ul-Fu'ad",
        author: "Hazrat Amir Khusrau (R.A)",
        category: "sufism",
        cover: "assets/images/fawaid.jpg"
    },
    {
        id: "chishti-003",
        title: "Siyar-ul-Auliya",
        author: "Syed Muhammad bin Mubarak Kirmani",
        category: "history",
        cover: "assets/images/siyar.jpg"
    }
];

/* =========================================================
DOM READY INITIALIZATION
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
    // Basic UI Initialization
    initLoader();
    initMobileMenu();
    initScrollTop();
    initSearch();
    initCategories();
    initPremiumAnimations();
    initCounters();

    // Fetch and render book cards
    fetchBooks();
});

/* =========================================================
FETCH & RENDER BOOKS
========================================================= */
async function fetchBooks() {
    try {
        // Apni JSON file ya API endpoint ka path yahan adjust kar sakte hain
        const response = await fetch("books.json");
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        allBooks = await response.json();
    } catch (error) {
        console.warn("Could not fetch books.json, loading fallback data...", error);
        allBooks = fallbackBooks;
    } finally {
        filteredBooks = [...allBooks];
        window.allBooks = allBooks;
        window.filteredBooks = filteredBooks;
        renderBooks(filteredBooks);
    }
}

function renderBooks(booksToRender) {
    const container = document.getElementById("books-container") || document.querySelector(".books-grid");
    if (!container) return;

    container.innerHTML = "";

    if (!booksToRender || booksToRender.length === 0) {
        container.innerHTML = `
            <div class="no-books-found" style="grid-column: 1/-1; text-align: center; padding: 40px 20px;">
                <p style="font-size: 1.2rem; color: #666;">Koi kitab nahi mili (No books found).</p>
            </div>
        `;
        return;
    }

    booksToRender.forEach(book => {
        const card = document.createElement("div");
        card.classList.add("book-card");

        // Clean Card Layout - Chatbot, Like, Share, aur Comment buttons HATA DIYE GAYE HAIN
        card.innerHTML = `
            <div class="book-cover" onclick="openReader('${book.id}')" style="cursor: pointer;">
                <img src="${book.cover || 'assets/images/placeholder.jpg'}" alt="${book.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/200x300?text=No+Cover'">
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
READER HTML REDIRECT LINK FIX
========================================================= */
function openReader(bookId) {
    if (bookId) {
        // Dynamic book parameter pass kiya ja raha hai
        window.location.href = `reader.html?id=${encodeURIComponent(bookId)}`;
    } else {
        console.error("Book ID is missing!");
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
            (book.author && book.author.toLowerCase().includes(query)) ||
            (book.category && book.category.toLowerCase().includes(query))
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
            
            if (!selectedCat || selectedCat.toLowerCase() === "all") {
                filteredBooks = [...allBooks];
            } else {
                filteredBooks = allBooks.filter(book => 
                    book.category && book.category.toLowerCase() === selectedCat.toLowerCase()
                );
            }
            
            window.filteredBooks = filteredBooks;
            renderBooks(filteredBooks);
        });
    });
}

/* =========================================================
UI & ANIMATION HELPER FUNCTIONS
========================================================= */
function initLoader() {
    const loader = document.getElementById("loader") || document.querySelector(".preloader");
    if (loader) {
        window.addEventListener("load", () => {
            loader.style.opacity = "0";
            setTimeout(() => {
                loader.style.display = "none";
            }, 500);
        });
    }
}

function initMobileMenu() {
    const menuToggle = document.querySelector(".menu-toggle") || document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu") || document.querySelector(".nav-links");
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", () => {
            navMenu.classList.toggle("active");
            menuToggle.classList.toggle("open");
        });

        // Close menu when clicking outside
        document.addEventListener("click", (e) => {
            if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove("active");
                menuToggle.classList.remove("open");
            }
        });
    }
}

function initScrollTop() {
    const scrollTopBtn = document.querySelector(".scroll-top") || document.getElementById("scrollTopBtn");
    if (!scrollTopBtn) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add("visible");
            scrollTopBtn.style.display = "block";
        } else {
            scrollTopBtn.classList.remove("visible");
            scrollTopBtn.style.display = "none";
        }
    });

    scrollTopBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

function initPremiumAnimations() {
    const animatedElements = document.querySelectorAll(".animate-on-scroll");
    if (!animatedElements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("animated");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    animatedElements.forEach(el => observer.observe(el));
}

function initCounters() {
    const counters = document.querySelectorAll(".counter-number");
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = +counter.getAttribute("data-target");
                if (!target) return;

                let count = 0;
                const duration = 2000; // 2 Seconds
                const stepTime = Math.abs(Math.floor(duration / target));

                const timer = setInterval(() => {
                    count += 1;
                    counter.innerText = count;
                    if (count >= target) {
                        counter.innerText = target;
                        clearInterval(timer);
                    }
                }, stepTime > 0 ? stepTime : 10);

                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}
