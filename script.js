let books = [];

/* LOADER */
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loader").style.display = "none";
  }, 1000);
});

/* LOAD BOOKS */
fetch("books.json")
.then(res => res.json())
.then(data => {
  books = data;
  showBooks();
});

/* SHOW BOOKS */
function showBooks(){

  let box = document.getElementById("booksContainer");

  box.innerHTML = "";

  books.forEach(b=>{

    box.innerHTML += `
      <div style="background:#222;padding:10px;border-radius:10px;">
        <h3>${b.title}</h3>
        <p>${b.author}</p>
      </div>
    `;

  });

}

/* CHAT OPEN */
document.getElementById("chatBtn").onclick = () => {
  document.getElementById("chatWindow").classList.toggle("show");
};

/* SEND MESSAGE */
function sendMessage(){

  let input = document.getElementById("userInput");
  let msg = input.value.trim().toLowerCase();
  let chat = document.getElementById("chatMessages");

  if(msg === "") return;

  chat.innerHTML += `<div><b>You:</b> ${msg}</div>`;

  chat.innerHTML += `<div><b>Bot:</b> ${getReply(msg)}</div>`;

  input.value = "";

}

/* BOT LOGIC */
function getReply(msg){

  let found = books.find(b =>
    msg.includes(b.title.toLowerCase()) ||
    msg.includes(b.author.toLowerCase())
  );

  if(found){
    return `📚 ${found.title} by ${found.author}`;
  }

  if(msg.includes("hello")){
    return "👋 Assalam o Alaikum!";
  }

  if(msg.includes("books")){
    return "📚 Library ready hai!";
  }

  return "🤖 Sorry, mujhe samajh nahi aaya.";
}
