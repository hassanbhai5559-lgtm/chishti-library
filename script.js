// Loader Logic
window.addEventListener("load", () => {
    setTimeout(() => {
        document.getElementById("loader").style.display = "none";
        document.getElementById("website").style.display = "block";
    }, 1500);
});

// Chat Logic
const chatBtn = document.getElementById("chatButton");
const chatBox = document.getElementById("chatBox");
const closeChat = document.getElementById("closeChat");

chatBtn.addEventListener("click", () => chatBox.style.display = "flex");
closeChat.addEventListener("click", () => chatBox.style.display = "none");

// Book Loading Logic
fetch("books.json")
    .then(res => res.json())
    .then(data => {
        const feat = document.getElementById("featuredBooks");
        const lat = document.getElementById("latestBooks");
        
        data.slice(0, 3).forEach(b => {
            feat.innerHTML += `<div class="book-card"><img src="${b.cover}"><h3>${b.title}</h3><a href="${b.reader}" class="btn">Read</a></div>`;
        });
    });
