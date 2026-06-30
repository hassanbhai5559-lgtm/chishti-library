// Loader
window.addEventListener('load', () => {
    document.getElementById('loader').style.display = 'none';
});

// Counter Animation Logic
const counters = document.querySelectorAll('.counter');
const animateCounters = () => {
    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const inc = target / 100;
            if(count < target) {
                counter.innerText = Math.ceil(count + inc);
                setTimeout(updateCount, 20);
            }
        };
        updateCount();
    });
};

// Fetch Books & Render
async function fetchBooks() {
    const res = await fetch('books.json');
    const data = await res.json();
    const grid = document.getElementById('booksGrid');
    
    // Auto Counters
    document.getElementById('totalBooks').setAttribute('data-target', data.length);
    animateCounters();

    data.forEach(book => {
        grid.innerHTML += `
            <div class="book-card">
                <h3>${book.title}</h3>
                <p>${book.author}</p>
                <button class="btn" onclick="addToOffline(${book.id})">Download</button>
            </div>
        `;
    });
}

// Simple Offline Storage
function addToOffline(id) {
    let offline = JSON.parse(localStorage.getItem('offline')) || [];
    offline.push(id);
    localStorage.setItem('offline', JSON.stringify(offline));
    alert('Added to offline library!');
}

fetchBooks();
