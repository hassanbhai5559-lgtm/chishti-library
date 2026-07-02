/* =========================
CHISHTI LIBRARY - FINAL JS
FIXED + PREMIUM VERSION
========================= */

/* ================= LOADER ================= */
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");

  if (loader) {
    setTimeout(() => {
      loader.style.opacity = "0";
      loader.style.visibility = "hidden";
    }, 1500);
  }
});

/* ================= MOBILE MENU ================= */
const menuBtn = document.querySelector(".mobile-menu");
const menu = document.querySelector(".menu");

if (menuBtn && menu) {
  menuBtn.addEventListener("click", () => {
    menu.classList.toggle("active");
  });
}

/* ================= VISITOR COUNTER ================= */
let v = localStorage.getItem("visitors");

if (!v) v = 1;
else v = Number(v) + 1;

localStorage.setItem("visitors", v);

const visitorCounter = document.getElementById("visitorCounter");

if (visitorCounter) {
  visitorCounter.innerText = v;
}

/* ================= BOOK DATA ================= */
let allBooks = [];

/* ================= LOAD BOOKS ================= */
async function loadBooks() {
  try {
    const res = await fetch("books.json");
    allBooks = await res.json();

    renderBooks(allBooks);
  } catch (err) {
    console.log("Books load error:", err);
  }
}

loadBooks();

/* ================= RENDER BOOKS ================= */
function renderBooks(books) {
  const container = document.getElementById("booksContainer");
  if (!container) return;

  container.innerHTML = "";

  books.forEach((book) => {
    container.innerHTML += `
      <div class="book-card">
        <img src="${book.cover}" alt="${book.title}" style="width:100%">
        <div style="padding:15px">
          <h3>${book.title}</h3>
          <p>${book.author}</p>
          <span>${book.category}</span>
          <br><br>
          <a class="btn" href="${book.reader || book.pdf}">
            Read Online
          </a>
        </div>
      </div>
    `;
  });
}

/* ================= SEARCH ================= */
const searchInput = document.getElementById("searchInput");

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase();

    const filtered = allBooks.filter((b) =>
      b.title.toLowerCase().includes(value) ||
      b.author.toLowerCase().includes(value) ||
      b.category.toLowerCase().includes(value)
    );

    renderBooks(filtered);
  });
}

/* ================= CATEGORY FILTER ================= */
function filterBooks(category) {
  if (category === "All") {
    renderBooks(allBooks);
    return;
  }

  const filtered = allBooks.filter(
    (b) => b.category === category
  );

  renderBooks(filtered);
}

/* ================= CHATBOT ================= */
const chatBtn = document.getElementById("chatBtn");
const chatWindow = document.getElementById("chatWindow");
const closeChat = document.getElementById("closeChat");
const chatMessages = document.getElementById("chatMessages");
const userInput = document.getElementById("userInput");
const typing = document.getElementById("typing");

if (chatBtn) {
  chatBtn.addEventListener("click", () => {
    chatWindow.style.display = "flex";
  });
}

if (closeChat) {
  closeChat.addEventListener("click", () => {
    chatWindow.style.display = "none";
  });
}

/* ================= AI RESPONSE ================= */
function aiReply(msg) {
  msg = msg.toLowerCase();

  if (msg.includes("book")) {
    return "📚 Aap books section me jaa kar Islamic books read kar sakte ho.";
  }

  if (msg.includes("author")) {
    return "✍️ Authors section me Hazrat Allama Saim Chishti ki details available hain.";
  }

  if (msg.includes("download")) {
    return "⬇️ Har book ke sath download button diya gaya hai.";
  }

  if (msg.includes("assalam")) {
    return "Wa Alaikum Assalam 🤍 Welcome to Chishti Library";
  }

  return "🤖 Mujhe samajh nahi aaya, please books ya author ke bare me poochain.";
}

/* ================= SEND MESSAGE ================= */
function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  chatMessages.innerHTML += `
    <div style="margin:10px;text-align:right;">
      <b>You:</b> ${text}
    </div>
  `;

  userInput.value = "";

  if (typing) typing.style.display = "block";

  setTimeout(() => {
    if (typing) typing.style.display = "none";

    chatMessages.innerHTML += `
      <div style="margin:10px;background:#f1f1f1;padding:10px;border-radius:10px;">
        <b>AI:</b> ${aiReply(text)}
      </div>
    `;

    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 800);
}

/* ================= ENTER KEY ================= */
if (userInput) {
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });
}
