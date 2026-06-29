let knowledge = [];
let libraryBooks = [];

/* LOAD DATA */
fetch("knowledge.json")
  .then(res => res.json())
  .then(data => knowledge = data);

fetch("books.json")
  .then(res => res.json())
  .then(data => libraryBooks = data);

/* SMART MATCH */
function matchScore(text, keyword) {
  text = text.toLowerCase();
  keyword = keyword.toLowerCase();

  let words = keyword.split(" ");
  let score = 0;

  for (let w of words) {
    if (text.includes(w)) score++;
  }

  return score / words.length;
}

/* KNOWLEDGE SEARCH */
function searchKnowledge(text) {
  let best = null;
  let bestScore = 0;

  for (let item of knowledge) {
    for (let key of item.keywords) {
      let score = matchScore(text, key);

      if (score > bestScore) {
        bestScore = score;
        best = item;
      }
    }
  }

  return bestScore > 0.5 ? best.answer_en : null;
}

/* BOOK SEARCH */
function searchBook(text) {
  let best = null;
  let bestScore = 0;

  for (let book of libraryBooks) {
    let score = matchScore(text, book.title);

    if (score > bestScore) {
      bestScore = score;
      best = book;
    }
  }

  return bestScore > 0.5 ? best : null;
}

/* BOT RESPONSE */
function botReply(text) {

  text = text.toLowerCase();

  /* GREETING */
  if (text.includes("hi") || text.includes("hello")) {
    return typeMessage("👋 Assalam-o-Alaikum! Main Chishti Library AI hoon. Aap books ya author ke bare mein pooch sakte hain.");
  }

  /* KNOWLEDGE */
  let k = searchKnowledge(text);
  if (k) {
    return typeMessage(k);
  }

  /* BOOK */
  let b = searchBook(text);
  if (b) {
    return typeMessage(`
📚 <b>${b.title}</b><br>
👤 Author: ${b.author}<br>
📖 <a href="${b.reader}" target="_blank">Read Online</a><br>
⬇ <a href="${b.pdf}" target="_blank">Download PDF</a>
    `);
  }

  /* FALLBACK */
  typeMessage("🤖 Main samajh nahi saka. Please book ka exact naam ya topic likhein.");
}

/* CHAT SEND */
const aiInput = document.getElementById("aiInput");
const chatBody = document.getElementById("chatBody");
const sendBtn = document.getElementById("sendBtn");

function addUser(msg) {
  chatBody.innerHTML += `<div class="user-message">${msg}</div>`;
}

function typeMessage(msg) {
  let div = document.createElement("div");
  div.className = "bot-message";
  chatBody.appendChild(div);

  div.innerHTML = msg;
  chatBody.scrollTop = chatBody.scrollHeight;
}

function sendMessage() {
  let text = aiInput.value.trim();
  if (!text) return;

  addUser(text);
  botReply(text);
  aiInput.value = "";
}

sendBtn.addEventListener("click", sendMessage);

aiInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
