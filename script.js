let knowledge = [];
let libraryBooks = [];

/* =========================
   AUTO LOAD DATA (SAFE)
========================= */
async function loadData() {
  try {
    const res1 = await fetch("knowledge.json");
    knowledge = await res1.json();

    const res2 = await fetch("books.json");
    libraryBooks = await res2.json();

    console.log("✅ Data loaded");
  } catch (err) {
    console.log("❌ Data load error", err);
  }
}

loadData();

/* =========================
   MATCH ENGINE
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
   SEARCH SYSTEM
========================= */
function searchKnowledge(text) {
  let best = null;
  let bestScore = 0;

  for (let item of knowledge || []) {
    for (let key of item?.keywords || []) {
      let score = matchScore(text, key);
      if (score > bestScore) {
        bestScore = score;
        best = item;
      }
    }
  }

  return bestScore > 0.5 ? best.answer_en : null;
}

function searchBook(text) {
  let best = null;
  let bestScore = 0;

  for (let book of libraryBooks || []) {
    let score = matchScore(text, book?.title || "");
    if (score > bestScore) {
      bestScore = score;
      best = book;
    }
  }

  return bestScore > 0.5 ? best : null;
}

/* =========================
   TYPE MESSAGE (AI STYLE)
========================= */
function typeMessage(msg) {
  const chatBody = document.getElementById("chatBody");
  if (!chatBody) return;

  let div = document.createElement("div");
  div.className = "bot-message";
  chatBody.appendChild(div);

  let i = 0;
  div.innerHTML = "";

  function typing() {
    if (i < msg.length) {
      div.innerHTML += msg.charAt(i);
      i++;
      setTimeout(typing, 8);
    }
  }

  typing();
  chatBody.scrollTop = chatBody.scrollHeight;
}

/* =========================
   CHAT BOT
========================= */
function botReply(text) {
  text = text.toLowerCase();

  if (text.includes("hi") || text.includes("hello")) {
    return typeMessage("👋 Assalam-o-Alaikum! Main Chishti Library AI hoon.");
  }

  let k = searchKnowledge(text);
  if (k) return typeMessage(k);

  let b = searchBook(text);
  if (b) {
    return typeMessage(
`📚 ${b.title}
👤 ${b.author}
📖 ${b.reader}
⬇ ${b.pdf}`
    );
  }

  return typeMessage("🤖 Mujhe samajh nahi aaya.");
}

/* =========================
   CHAT UI SAFE
========================= */
const aiInput = document.getElementById("aiInput");
const sendBtn = document.getElementById("sendBtn");

function addUser(msg) {
  const chatBody = document.getElementById("chatBody");
  if (!chatBody) return;

  let div = document.createElement("div");
  div.className = "user-message";
  div.textContent = msg;

  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function sendMessage() {
  if (!aiInput) return;

  let text = aiInput.value.trim();
  if (!text) return;

  addUser(text);
  botReply(text);

  aiInput.value = "";
}

if (sendBtn) sendBtn.addEventListener("click", sendMessage);

if (aiInput) {
  aiInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });
}

/* =========================
   AUTO DAY/NIGHT THEME
========================= */
function autoTheme() {
  let hour = new Date().getHours();
  let body = document.body;

  body.classList.remove("light", "dark", "yellow");

  if (hour >= 6 && hour < 18) {
    // DAY MODE (WHITE + YELLOW)
    body.classList.add("light");
  } else {
    // NIGHT MODE (BLACK + WHITE)
    body.classList.add("dark");
  }
}

/* =========================
   FIX LOADER (NO STUCK)
========================= */
window.addEventListener("load", () => {
  autoTheme();

  setTimeout(() => {
    let loader = document.getElementById("loader");
    let website = document.getElementById("website");

    if (loader) loader.style.display = "none";
    if (website) website.style.display = "block";
  }, 900);
});
