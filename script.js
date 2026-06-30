/* =========================================================
   CHISHTI LIBRARY - MASTER SCRIPT (Mobile Optimized)
   ========================================================= */

// 1. LOADER LOGIC
window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    const website = document.getElementById("website");
    
    setTimeout(() => {
        if(loader) loader.style.display = "none";
        if(website) website.style.display = "block";
    }, 1500);
});

// 2. CHAT LOGIC
const chatBtn = document.getElementById("chatButton");
const chatBox = document.getElementById("chatBox");
const closeChat = document.getElementById("closeChat");
const chatBody = document.getElementById("chatBody");
const aiInput = document.getElementById("aiInput");

if (chatBtn) chatBtn.addEventListener("click", () => chatBox.style.display = "flex");
if (closeChat) closeChat.addEventListener("click", () => chatBox.style.display = "none");

// Mobile Chat: Scroll on focus (keyboard fix)
if (aiInput) {
    aiInput.addEventListener('focus', () => {
        setTimeout(() => {
            chatBody.scrollTop = chatBody.scrollHeight;
        }, 300);
    });
}

// Chat: Auto-scroll on new message
function typeMessage(msg) {
    if (!chatBody) return;
    const div = document.createElement("div");
    div.className = "bot-message";
    div.innerHTML = msg;
    chatBody.appendChild(div);
    
    chatBody.scrollTo({
        top: chatBody.scrollHeight,
        behavior: 'smooth'
    });
}

// 3. BOOK LOADING LOGIC (Performance Optimized)
fetch("books.json")
    .then(res => res.json())
    .then(data => {
        const feat = document.getElementById("featuredBooks");
        const lat = document.getElementById("latestBooks");

        // Featured (First 3)
        if (feat) {
            data.slice(0, 3).forEach(b => {
                feat.innerHTML += `
                <div class="book-card">
                    <img src="${b.cover}" loading="lazy" alt="${b.title}">
                    <h3>${b.title}</h3>
                    <a href="${b.reader}" class="btn">Read</a>
                </div>`;
            });
        }

        // Latest (Last 3)
        if (lat) {
            data.slice(-3).reverse().forEach(b => {
                lat.innerHTML += `
                <div class="book-card">
                    <img src="${b.cover}" loading="lazy" alt="${b.title}">
                    <h3>${b.title}</h3>
                    <a href="${b.reader}" class="btn">Read</a>
                </div>`;
            });
        }
    })
    .catch(err => console.error("Error loading books:", err));
