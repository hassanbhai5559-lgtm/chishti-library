let knowledge = [];
let libraryBooks = [];

/* =========================
   LOAD KNOWLEDGE (CHAT DATA)
========================= */
fetch("knowledge.json")
  .then(res => res.json())
  .then(data => {
    knowledge = data;
    console.log("Knowledge loaded");
  })
  .catch(err => console.log("Knowledge error:", err));

/* =========================
   LOAD BOOKS
========================= */
fetch("books.json")
  .then(res => res.json())
  .then(data => {
    libraryBooks = data;

    loadFeaturedBooks(data);
    loadLatestBooks(data);
    loadOfflineBooks();
  })
  .catch(err => console.log("Books error:", err));

/* =========================
   SEARCH KNOWLEDGE
========================= */
function searchKnowledge(text) {
  if (!knowledge.length) return null;

  text = text.toLowerCase();

  for (const item of knowledge) {
    for (const key of item.keywords) {
      if (text.includes(key.toLowerCase())) {
        return item.answer_en;
      }
    }
  }

  return null;
}

/* =========================
   SMART BOOK SEARCH
========================= */
function smartBookSearch(text) {
  text = text.toLowerCase();

  for (const book of libraryBooks) {
    const title = book.title.toLowerCase();

    if (text.includes(title) || title.includes(text)) {
      return book;
    }
  }

  return null;
}

/* =========================
   BOT REPLY (MAIN FIX)
========================= */
function botReply(text) {

  // 1. knowledge check
  let answer = searchKnowledge(text);

  if (answer) {
    typeMessage(answer);
    return;
  }

  // 2. book search
  const result = smartBookSearch(text);

  if (result) {
    typeMessage(`
<b>📚 ${result.title}</b><br>
👤 ${result.author}<br><br>

<a href="${result.reader}" target="_blank">📖 Read Online</a><br>
<a href="${result.pdf}" target="_blank">⬇ Download PDF</a>
    `);
    return;
  }

  // 3. fallback replies
  if (text.includes("book")) {
    typeMessage("📚 Please type a book name.");
  }
  else if (text.includes("author")) {
    typeMessage("👤 Hazrat Allama Saim Chishti.");
  }
  else if (text.includes("download")) {
    typeMessage("⬇ Use download button under each book.");
  }
  else if (text.includes("offline")) {
    typeMessage("📥 Offline books saved in local storage.");
  }
  else {
    typeMessage("🤖 Please search using a book title.");
  }
}

/* =========================
   CHAT SEND SYSTEM
========================= */
const aiInput = document.getElementById("aiInput");
const sendBtn = document.getElementById("sendBtn");
const chatBody = document.getElementById("chatBody");

function addMessage(msg, type) {
  if (!chatBody) return;

  const div = document.createElement("div");
  div.className = type === "user" ? "user-message" : "bot-message";
  div.textContent = msg;

  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function typeMessage(msg) {
  if (!chatBody) return;

  const div = document.createElement("div");
  div.className = "bot-message";
  div.innerHTML = msg;

  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
}

/* =========================
   SEND MESSAGE
========================= */
function sendMessage() {
  if (!aiInput) return;

  const text = aiInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  botReply(text);

  aiInput.value = "";
}

if (sendBtn) {
  sendBtn.addEventListener("click", sendMessage);
}

if (aiInput) {
  aiInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
}

/* =========================
   OFFLINE BOOKS
========================= */
function saveOfflineBook(title, cover, pdf) {
  let books = JSON.parse(localStorage.getItem("offlineBooks")) || [];

  books.push({ title, cover, pdf });

  localStorage.setItem("offlineBooks", JSON.stringify(books));
}

function loadOfflineBooks() {
  const container = document.getElementById("offlineBooks");
  if (!container) return;

  let books = JSON.parse(localStorage.getItem("offlineBooks")) || [];

  container.innerHTML = "";

  books.forEach(book => {
    container.innerHTML += `
      <div class="book-card">
        <img src="${book.cover}">
        <h3>${book.title}</h3>
        <a href="${book.pdf}" class="btn">📖 Open</a>
      </div>
    `;
  });
}

/* =========================
   FEATURED BOOKS
========================= */
function loadFeaturedBooks(books) {
  const container = document.getElementById("featuredBooks");
  if (!container) return;

  container.innerHTML = "";

  books.slice(0, 6).forEach(book => {
    container.innerHTML += `
      <div class="book-card">
        <img src="${book.cover}">
        <h3>${book.title}</h3>
        <p>${book.author}</p>

        <a href="${book.reader}" class="btn">📖 Read</a>

        <a href="${book.pdf}" class="btn"
           onclick="saveOfflineBook('${book.title}','${book.cover}','${book.pdf}')">
           ⬇ Download
        </a>
      </div>
    `;
  });
}

/* =========================
   LATEST BOOKS
========================= */
function loadLatestBooks(books) {
  const container = document.getElementById("latestBooks");
  if (!container) return;

  container.innerHTML = "";

  books.slice(-6).reverse().forEach(book => {
    container.innerHTML += `
      <div class="book-card">
        <img src="${book.cover}">
        <h3>${book.title}</h3>
        <p>${book.author}</p>
        <a href="${book.reader}" class="btn">📖 Read</a>
      </div>
    `;
  });
}

/* =========================
   LOADER FIX
========================= */
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  const website = document.getElementById("website");

  setTimeout(() => {
    if (loader) loader.style.display = "none";
    if (website) website.style.display = "block";
  }, 1500);
});

console.log("✅ Chishti Library Fully Fixed");
const chatButton = document.getElementById("chatButton");
const chatBox = document.getElementById("chatBox");
const closeChat = document.getElementById("closeChat");

// chat open
chatButton.addEventListener("click", () => {
  chatBox.style.display = "block";
});

// chat close
closeChat.addEventListener("click", () => {
  chatBox.style.display = "none";
});
