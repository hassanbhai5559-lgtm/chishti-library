let knowledge = [];
let libraryBooks = [];

/* =========================
   LOAD DATA SAFELY
========================= */
async function loadData() {
  try {
    const k = await fetch("knowledge.json");
    knowledge = await k.json();

    const b = await fetch("books.json");
    libraryBooks = await b.json();
  } catch (error) {
    console.log("Data load error:", error);
  }
}

loadData();

/* =========================
   SMART MATCH FUNCTION
========================= */
function matchScore(text, keyword) {
  if (!text || !keyword) return 0;

  text = text.toLowerCase();
  keyword = keyword.toLowerCase();

  let words = keyword.split(" ");
  let score = 0;

  for (let w of words) {
    if (text.includes(w)) score++;
  }

  return score / words.length;
}

/* =========================
   SEARCH KNOWLEDGE
========================= */
function searchKnowledge(text) {
  let best = null;
  let bestScore = 0;

  for (let item of knowledge || []) {
    for (let key of item.keywords || []) {
      let score = matchScore(text, key);

      if (score > bestScore) {
        bestScore = score;
        best = item;
      }
    }
  }

  return bestScore > 0.5 ? best.answer_en : null;
}

/* =========================
   SEARCH BOOK
========================= */
function searchBook(text) {
  let best = null;
  let bestScore = 0;

  for (let book of libraryBooks || []) {
    let score = matchScore(text, book.title);

    if (score > bestScore) {
      bestScore = score;
      best = book;
    }
  }

  return bestScore > 0.5 ? best : null;
}

/* =========================
   TYPE WRITER EFFECT (AI STYLE)
========================= */
function typeWriter(element, text, speed = 20) {
  let i = 0;
  element.innerHTML = "";

  function typing() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(typing, speed);
    }
  }

  typing();
}

/* =========================
   BOT RESPONSE ENGINE
========================= */
function botReply(text) {
  text = text.toLowerCase();

  let chatBody = document.getElementById("chatBody");

  let div = document.createElement("div");
  div.className = "bot-message";
  chatBody.appendChild(div);

  /* GREETING */
  if (text.includes("hi") || text.includes("hello")) {
    typeWriter(div, "👋 Assalam-o-Alaikum! Main Chishti Library AI hoon. Aap books, authors ya topics ke baare mein pooch sakte hain.");
    return;
  }

  /* KNOWLEDGE */
  let k = searchKnowledge(text);
  if (k) {
    typeWriter(div, k);
    return;
  }

  /* BOOK SEARCH */
  let b = searchBook(text);
  if (b) {
    typeWriter(div,
`📚 ${b.title}
👤 Author: ${b.author}

👉 Read Online: ${b.reader}
⬇ Download PDF: ${b.pdf}`);
    return;
  }

  /* FALLBACK */
  typeWriter(div, "🤖 Mujhe samajh nahi aaya. Please book ka naam ya topic clearly likhein.");
}

/* =========================
   CHAT CONTROLS
========================= */
const aiInput = document.getElementById("aiInput");
const sendBtn = document.getElementById("sendBtn");

function addUser(msg) {
  let chatBody = document.getElementById("chatBody");

  let div = document.createElement("div");
  div.className = "user-message";
  div.textContent = msg;
  chatBody.appendChild(div);

  chatBody.scrollTop = chatBody.scrollHeight;
}

function sendMessage() {
  let text = aiInput.value.trim();
  if (!text) return;

  addUser(text);
  botReply(text);

  aiInput.value = "";
}

/* =========================
   EVENTS
========================= */
sendBtn.addEventListener("click", sendMessage);

aiInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
