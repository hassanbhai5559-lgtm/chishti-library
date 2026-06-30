fetch("books.json")
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById("booksContainer");
        data.forEach(b => {
            container.innerHTML += `
                <div class="book-card">
                    <img src="${b.cover}" width="100%">
                    <h3>${b.title}</h3>
                    <a href="${b.reader}">Read</a>
                </div>
            `;
        });
    });
