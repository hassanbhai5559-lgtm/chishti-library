let knowledge = [];
let libraryBooks = [];

/* =========================
   LOAD DATA (SAFE + WAIT READY)
========================= */
async function loadData() {
  try {
    const res1 = await fetch("knowledge.json");
    knowledge = await res1.json();

    const res2 = await fetch("books.json");
    libraryBooks = await res2.json();

    console.log("Data loaded successfully");
  } catch (error) {
    console.log("Error loading data:", error);
  }
}

loadData();

/* =========================
   SMART MATCH ENGINE
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
   KNOWLEDGE SEARCH
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

/* =========================
   BOOK SEARCH
========================= */
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
   TYPE ANIMATION (CHATGPT STYLE)
========================= */
function typeMessage(msg) {
  const chatBody = document.getElementById("chatBody");

  let div = document.createElement("div");
  div.className = "bot-message";
  chatBody.appendChild(div);

  let i = 0;
  div.innerHTML = "";

  function typing() {
    if (i < msg.length) {
      div.innerHTML += msg.charAt(i);
      i++;
      setTimeout(typing, 10);
    }
  }

  typing();
  chatBody.scrollTop = chatBody.scrollHeight;
}

/* =========================
   BOT ENGINE
========================= */
function botReply(text) {

  text = text.toLowerCase();

  // greeting
  if (text.includes("hi") || text.includes("hello")) {
    return typeMessage("👋 Assalam-o-Alaikum! Main Chishti Library AI hoon. Aap books ya authors ke baare mein pooch sakte hain.");
  }

  // knowledge
  let k = searchKnowledge(text);
  if (k) return typeMessage(k);

  // book
  let b = searchBook(text);
  if (b) {
    return typeMessage(
`📚 ${b.title}
👤 Author: ${b.author}

📖 Read Online: ${b.reader}
⬇ Download PDF: ${b.pdf}`
    );
  }

  // fallback
  return typeMessage("🤖 Mujhe samajh nahi aaya. Please book ka naam ya topic likhein.");
}

/* =========================
   CHAT UI FIXED
========================= */
const aiInput = document.getElementById("aiInput");
const sendBtn = document.getElementById("sendBtn");

function addUser(msg) {
  const chatBody = document.getElementById("chatBody");

  let div = document.createElement("div");
  div.className = "user-message";
  div.textContent = msg;

  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
}

/* SEND MESSAGE */
function sendMessage() {
  let text = aiInput.value.trim();
  if (!text) return;

  addUser(text);
  botReply(text);

  aiInput.value = "";
}

/* EVENTS */
sendBtn.addEventListener("click", sendMessage);

aiInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
