let books = [];

/* LOAD BOOKS */
fetch("books.json")
.then(res => res.json())
.then(data => {
  books = data;
  renderBooks(books);
});

/* RENDER BOOKS */
function renderBooks(data){
  let box = document.getElementById("booksContainer");
  box.innerHTML = "";

  data.forEach(b => {
    box.innerHTML += `
      <div class="book">
        <img src="${b.cover}">
        <h3>${b.title}</h3>
        <p>${b.author}</p>

        <a href="${b.reader}" target="_blank">Read Online</a><br>
        <a href="${b.pdf}" download>Download</a>
      </div>
    `;
  });
}

/* SEARCH */
document.getElementById("searchInput").addEventListener("keyup", function(){
  let val = this.value.toLowerCase();

  let filtered = books.filter(b =>
    b.title.toLowerCase().includes(val) ||
    b.author.toLowerCase().includes(val) ||
    b.category.toLowerCase().includes(val)
  );

  renderBooks(filtered);
});

/* FILTER */
function filterBooks(cat){

  if(cat === "All"){
    renderBooks(books);
    return;
  }

  let filtered = books.filter(b => b.category === cat);
  renderBooks(filtered);
}

/* CHAT */
document.getElementById("chatBtn").onclick = () => {
  document.getElementById("chatWindow").classList.toggle("show");
};

function sendMessage(){

  let input = document.getElementById("userInput");
  let msg = input.value;
  let chat = document.getElementById("chatMessages");

  if(msg === "") return;

  chat.innerHTML += `<div>User: ${msg}</div>`;

  // SIMPLE AI
  let reply = "Mujhe samajh nahi aaya 😅";

  let found = books.find(b => msg.toLowerCase().includes(b.title.toLowerCase()));

  if(found){
    reply = `📚 ${found.title} by ${found.author}`;
  }

  chat.innerHTML += `<div>Bot: ${reply}</div>`;

  input.value = "";
}
