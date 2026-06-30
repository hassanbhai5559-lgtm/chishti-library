// Load Data & Animations
async function loadData() {
    const booksRes = await fetch('books.json');
    const books = await booksRes.json();
    
    // 1. Auto Counters Animation
    animateCounter('totalBooks', books.length);
    animateCounter('totalReaders', 1200);
    animateCounter('totalDownloads', 850);
    
    // 2. Load Books
    const grid = document.getElementById('booksGrid');
    books.forEach(b => {
        grid.innerHTML += `
            <div class="book-card">
                <img src="${b.cover}" loading="lazy" alt="${b.title}">
                <h3>${b.title}</h3>
                <p>${b.author}</p>
                <a href="${b.reader}" class="btn">Read</a>
            </div>
        `;
    });
}

// Counter Function
function animateCounter(id, target) {
    let count = 0;
    const speed = target / 50;
    const update = () => {
        count += speed;
        if(count < target) {
            document.getElementById(id).innerText = Math.ceil(count);
            setTimeout(update, 30);
        } else {
            document.getElementById(id).innerText = target + "+";
        }
    };
    update();
}

// Chatbot Animation
const chatBtn = document.getElementById('chatBtn');
const chatBox = document.getElementById('chatBox');

chatBtn.onclick = () => {
    chatBox.classList.toggle('hidden');
    chatBox.style.animation = "fadeIn 0.5s";
};

loadData();
