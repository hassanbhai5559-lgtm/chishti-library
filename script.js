/* ==========================================================================
   CHISHTI LIBRARY - GOLDEN MASTER PRODUCTION ENGINE (v3.0)
   - Queue-based Chatbot (No collision)
   - Weighted Ranking Search
   - Safe DOM Construction (No XSS)
   - Roman Urdu & Command Support
   ========================================================================== */

let knowledge = [];
let libraryBooks = [];
const msgQueue = [];
let isTyping = false;

/* =========================
   1. UTILS & HELPERS
========================= */
const ROMAN_URDU = ["kitab", "namaz", "roza", "hajj", "tasawwuf", "naat", "quran", "islam"];

function createEl(tag, className, text = "") {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
}

/* =========================
   2. DATA LOADING (Robust)
========================= */
async function loadData() {
    try {
        const [knowRes, bookRes] = await Promise.all([
            fetch("knowledge.json"), fetch("books.json")
        ]);

        if (!knowRes.ok || !bookRes.ok) throw new Error("JSON Fetch Failed");

        const k = await knowRes.json();
        const b = await bookRes.json();

        knowledge = Array.isArray(k) ? k : [];
        libraryBooks = Array.isArray(b) ? b : [];

        renderLibrary();
    } catch (err) {
        console.error("❌ Critical Load Error:", err);
        const chat = document.getElementById("chatBody");
        if (chat) chat.appendChild(createEl("div", "bot-message", "⚠️ Unable to load library. Please check connection."));
    }
}

/* =========================
   3. WEIGHTED SEARCH ENGINE
========================= */
function searchEngine(query) {
    const q = query.toLowerCase().trim();
    let matches = [];

    libraryBooks.forEach(book => {
        let score = 0;
        const title = (book.title || "").toLowerCase();
        const author = (book.author || "").toLowerCase();
        const keywords = Array.isArray(book.keywords) ? book.keywords.join(" ").toLowerCase() : "";

        if (title.includes(q)) score += 100;
        else if (author.includes(q)) score += 80;
        else if (keywords.includes(q)) score += 60;

        if (score > 0) matches.push({ book, score });
    });

    return matches.sort((a, b) => b.score - a.score)[0]?.book || null;
}

/* =========================
   4. CHATBOT QUEUE SYSTEM
========================= */
function processQueue() {
    if (isTyping || msgQueue.length === 0) return;
    
    const msg = msgQueue.shift();
    isTyping = true;
    
    const chatBody = document.getElementById("chatBody");
    const div = createEl("div", "bot-message");
    chatBody.appendChild(div);

    let i = 0;
    const typing = setInterval(() => {
        if (i < msg.length) {
            div.textContent += msg.charAt(i);
            i++;
            chatBody.scrollTop = chatBody.scrollHeight;
        } else {
            clearInterval(typing);
            isTyping = false;
            processQueue();
        }
    }, Math.random() * 15 + 5);
}

function botReply(input) {
    const text = input.toLowerCase().trim();
    
    // Command Handlers
    if (["help", "hi", "salam"].includes(text)) {
        msgQueue.push("Assalam-o-Alaikum! Try: 'books', 'latest', or ask about a topic.");
    } else if (text === "books" || text === "show books") {
        msgQueue.push(libraryBooks.slice(0, 5).map(b => "📚 " + b.title).join("\n"));
    } else if (text === "latest") {
        msgQueue.push(libraryBooks.slice(-5).map(b => "🆕 " + b.title).join("\n"));
    } else {
        // Knowledge
        const match = knowledge.find(k => (k.keywords || []).some(key => text.includes(key.toLowerCase())));
        if (match) {
            const lang = (text.match(/[\u0600-\u06FF]/)) ? 'ur' : (ROMAN_URDU.some(w => text.includes(w)) ? 'ur' : 'en');
            msgQueue.push(match.answer?.[lang] || match.answer || "Information found.");
        } else {
            // Book
            const book = searchEngine(text);
            if (book) {
                const div = createEl("div", "bot-message");
                div.appendChild(createEl("strong", null, book.title));
                div.appendChild(document.createElement("br"));
                const btn = createEl("a", "btn", "Read PDF");
                btn.href = book.pdf || "#";
                btn.target = "_blank";
                btn.rel = "noopener noreferrer";
                if (!book.pdf) btn.disabled = true;
                div.appendChild(btn);
                document.getElementById("chatBody").appendChild(div);
            } else {
                msgQueue.push("Sorry, I couldn't find that. Try searching for a book title.");
            }
        }
    }
    processQueue();
}

/* =========================
   5. UI RENDERING
========================= */
function renderLibrary() {
    const featured = document.getElementById("featuredBooks");
    const latest = document.getElementById("latestBooks");
    
    if (featured) featured.innerHTML = "";
    if (latest) latest.innerHTML = "";

    libraryBooks.slice(0, 4).forEach(b => featured?.appendChild(createBookCard(b)));
    libraryBooks.slice(-4).reverse().forEach(b => latest?.appendChild(createBookCard(b)));
}

function createBookCard(b) {
    const div = createEl("div", "book-card");
    const img = document.createElement("img");
    img.src = b.cover || "default.png";
    img.alt = b.title;
    img.onerror = function() { this.onerror=null; this.src='default.png'; };
    
    div.appendChild(img);
    div.appendChild(createEl("h3", null, b.title));
    div.appendChild(createEl("p", null, b.author));
    
    const a = createEl("a", "btn", "Read PDF");
    a.href = b.pdf || "#";
    if (!b.pdf) a.style.pointerEvents = "none";
    div.appendChild(a);
    return div;
}

/* =========================
   6. INIT & EVENTS
========================= */
document.addEventListener("DOMContentLoaded", () => {
    // Theme
    const h = new Date().getHours();
    document.body.className = (h >= 6 && h < 18) ? "light" : "dark";
    
    document.getElementById("themeBtn")?.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        document.body.classList.toggle("light");
    });

    // Chat
    document.getElementById("chatButton")?.addEventListener("click", () => document.getElementById("chatBox").style.display = "block");
    document.getElementById("closeChat")?.addEventListener("click", () => document.getElementById("chatBox").style.display = "none");
    
    document.getElementById("sendBtn")?.addEventListener("click", () => {
        const input = document.getElementById("aiInput");
        if (!input.value.trim()) return;
        const msg = input.value;
        const chat = document.getElementById("chatBody");
        chat.appendChild(createEl("div", "user-message", msg));
        input.value = "";
        botReply(msg);
    });

    loadData();
});

window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    if (loader) {
        loader.classList.add("fade-out");
        setTimeout(() => loader.parentNode?.removeChild(loader), 500);
    }
});
