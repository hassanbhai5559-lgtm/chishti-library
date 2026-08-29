"use strict";

/*=========================================
CHISHTI LIBRARY
ADMIN.JS
=========================================*/


/*=========================================
ELEMENTS
=========================================*/

const loginScreen =
    document.getElementById("loginScreen");

const adminApp =
    document.getElementById("adminApp");

const loginForm =
    document.getElementById("loginForm");

const loginError =
    document.getElementById("loginError");

const logoutBtn =
    document.getElementById("logoutBtn");

const adminEmail =
    document.getElementById("adminEmail");

const booksTable =
    document.getElementById("booksTable");

const bookForm =
    document.getElementById("bookForm");

const bookMessage =
    document.getElementById("bookMessage");

const coverFile =
    document.getElementById("coverFile");

const pdfFile =
    document.getElementById("pdfFile");

const coverStatus =
    document.getElementById("coverStatus");

const pdfStatus =
    document.getElementById("pdfStatus");


let books = [];


/*=========================================
AUTH STATE
=========================================*/

auth.onAuthStateChanged(function(user) {

    if (user) {

        loginScreen.classList.add("hidden");

        adminApp.classList.remove("hidden");

        adminEmail.innerText =
            user.email || "Admin";

        loadDashboard();

        loadBooks();

        loadComments();

    } else {

        loginScreen.classList.remove("hidden");

        adminApp.classList.add("hidden");

    }

});


/*=========================================
LOGIN
=========================================*/

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(e) {

            e.preventDefault();

            loginError.innerText = "";

            const email =
                document
                .getElementById("loginEmail")
                .value
                .trim();

            const password =
                document
                .getElementById("loginPassword")
                .value;

            try {

                await auth.signInWithEmailAndPassword(
                    email,
                    password
                );

            }

            catch(error) {

                console.error(
                    "Login Error:",
                    error
                );

                loginError.innerText =
                    "❌ Invalid email or password.";

            }

        }
    );

}


/*=========================================
LOGOUT
=========================================*/

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async function() {

            await auth.signOut();

        }
    );

}


/*=========================================
NAVIGATION
=========================================*/

document
.querySelectorAll(".nav-btn")
.forEach(function(button) {

    button.addEventListener(
        "click",
        function() {

            openSection(
                button.dataset.section
            );

            document
            .querySelectorAll(".nav-btn")
            .forEach(function(btn) {

                btn.classList.remove("active");

            });

            button.classList.add("active");

        }
    );

});


function openSection(sectionId) {

    document
    .querySelectorAll(".admin-section")
    .forEach(function(section) {

        section.classList.remove(
            "active-section"
        );

    });

    const section =
        document.getElementById(sectionId);

    if (section) {

        section.classList.add(
            "active-section"
        );

    }

    const titles = {

        dashboard: "Dashboard",

        books: "Books",

        addBook: "Add Book",

        comments: "Comments"

    };

    document.getElementById(
        "pageTitle"
    ).innerText =
        titles[sectionId] || "Admin";


    document
    .querySelector(".sidebar")
    ?.classList.remove("show");

}


/*=========================================
MOBILE MENU
=========================================*/

const mobileMenu =
    document.getElementById("mobileMenu");

if (mobileMenu) {

    mobileMenu.onclick = function() {

        document
        .querySelector(".sidebar")
        .classList.toggle("show");

    };

}


/*=========================================
GO ADD BOOK
=========================================*/

const goAddBook =
    document.getElementById("goAddBook");

if (goAddBook) {

    goAddBook.onclick = function() {

        resetBookForm();

        openSection("addBook");

        document
        .querySelectorAll(".nav-btn")
        .forEach(btn =>
            btn.classList.remove("active")
        );

        document
        .querySelector(
            '[data-section="addBook"]'
        )
        ?.classList.add("active");

    };

}


/*=========================================
DASHBOARD
=========================================*/

async function loadDashboard() {

    try {

        const stats =
            await getStatistics();

        const snapshot =
            await db
            .collection("books")
            .get();


        let views = 0;
        let likes = 0;
        let shares = 0;
        let downloads = 0;


        snapshot.forEach(function(doc) {

            const book = doc.data();

            views +=
                Number(book.views || 0);

            likes +=
                Number(book.likes || 0);

            shares +=
                Number(book.shares || 0);

            downloads +=
                Number(book.downloads || 0);

        });


        document.getElementById(
            "totalBooks"
        ).innerText =
            snapshot.size;

        document.getElementById(
            "totalVisitors"
        ).innerText =
            Number(stats.visitors || 0);

        document.getElementById(
            "totalViews"
        ).innerText =
            views;

        document.getElementById(
            "totalLikes"
        ).innerText =
            likes;

        document.getElementById(
            "totalShares"
        ).innerText =
            shares;

        document.getElementById(
            "totalDownloads"
        ).innerText =
            downloads;

    }

    catch(error) {

        console.error(
            "Dashboard Error:",
            error
        );

    }

}


/*=========================================
STATISTICS
=========================================*/

async function getStatistics() {

    const doc =
        await db
        .collection("statistics")
        .doc("main")
        .get();

    if (!doc.exists) {

        return {
            visitors: 0
        };

    }

    return doc.data();

}


/*=========================================
LOAD BOOKS
=========================================*/

async function loadBooks() {

    try {

        const snapshot =
            await db
            .collection("books")
            .orderBy(
                "createdAt",
                "desc"
            )
            .get();

        books = [];

        snapshot.forEach(function(doc) {

            books.push({

                id: doc.id,

                ...doc.data()

            });

        });

        renderBooks();

    }

    catch(error) {

        console.error(
            "Books Error:",
            error
        );

        /*
        If createdAt orderBy fails because
        old documents don't have createdAt,
        load without orderBy.
        */

        try {

            const snapshot =
                await db
                .collection("books")
                .get();

            books = [];

            snapshot.forEach(function(doc) {

                books.push({

                    id: doc.id,

                    ...doc.data()

                });

            });

            renderBooks();

        }

        catch(err) {

            console.error(err);

        }

    }

}


/*=========================================
RENDER BOOKS
=========================================*/

function renderBooks() {

    if (!booksTable) return;

    booksTable.innerHTML = "";

    if (books.length === 0) {

        booksTable.innerHTML = `
            <tr>
                <td colspan="8">
                    No books found.
                </td>
            </tr>
        `;

        return;

    }


    books.forEach(function(book) {

        const cover =
            book.coverUrl ||
            book.cover ||
            "logo.png";


        const title =
            book.title || "Untitled";

        const author =
            book.author || "Unknown";

        const category =
            book.category || "Other";


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                <img
                    src="${cover}"
                    class="book-cover"
                    onerror="this.src='logo.png'"
                >
            </td>

            <td>${escapeHTML(title)}</td>

            <td>${escapeHTML(author)}</td>

            <td>${escapeHTML(category)}</td>

            <td>${Number(book.views || 0)}</td>

            <td>${Number(book.downloads || 0)}</td>

            <td>
                ${
                    book.latest === true
                    ? "⭐ Yes"
                    : "No"
                }
            </td>

            <td>

                <button
                    class="action-btn edit-btn"
                    onclick="editBook('${book.id}')"
                >
                    ✏️
                </button>

                <button
                    class="action-btn delete-btn"
                    onclick="deleteBook('${book.id}')"
                >
                    🗑️
                </button>

            </td>
        `;

        booksTable.appendChild(row);

    });

}


/*=========================================
ADD / UPDATE BOOK
=========================================*/

if (bookForm) {

    bookForm.addEventListener(
        "submit",
        async function(e) {

            e.preventDefault();

            const saveBtn =
                document.getElementById(
                    "saveBookBtn"
                );

            saveBtn.disabled = true;

            saveBtn.innerText =
                "⏳ Saving...";


            try {

                const editingId =
                    document.getElementById(
                        "editingBookId"
                    ).value;


                const title =
                    document.getElementById(
                        "bookTitle"
                    ).value.trim();


                const author =
                    document.getElementById(
                        "bookAuthor"
                    ).value.trim();


                const category =
                    document.getElementById(
                        "bookCategory"
                    ).value;


                const language =
                    document.getElementById(
                        "bookLanguage"
                    ).value;


                const description =
                    document.getElementById(
                        "bookDescription"
                    ).value.trim();


                const latest =
                    document.getElementById(
                        "bookLatest"
                    ).checked;


                let coverUrl = "";
                let coverPath = "";

                let pdfUrl = "";
                let pdfPath = "";


                /*
                =========================
                EXISTING BOOK
                =========================
                */

                if (editingId) {

                    const oldBook =
                        books.find(
                            b =>
                                b.id === editingId
                        );

                    coverUrl =
                        oldBook?.coverUrl ||
                        oldBook?.cover ||
                        "";

                    coverPath =
                        oldBook?.coverPath ||
                        "";

                    pdfUrl =
                        oldBook?.pdfUrl ||
                        oldBook?.pdf ||
                        "";

                    pdfPath =
                        oldBook?.pdfPath ||
                        "";

                }


                /*
                =========================
                CREATE ID
                =========================
                */

                const bookId =
                    editingId ||
                    db
                    .collection("books")
                    .doc()
                    .id;


                /*
                =========================
                COVER
                =========================
                */

                if (
                    coverFile.files.length > 0
                ) {

                    const file =
                        coverFile.files[0];

                    const extension =
                        file.name
                        .split(".")
                        .pop()
                        .toLowerCase();

                    const path =
                        `books/${bookId}/cover/cover-${Date.now()}.${extension}`;

                    const ref =
                        storage.ref(path);

                    const upload =
                        await ref.put(file);

                    coverUrl =
                        await upload
                        .ref
                        .getDownloadURL();

                    coverPath = path;

                }


                /*
                =========================
                PDF
                =========================
                */

                if (
                    pdfFile.files.length > 0
                ) {

                    const file =
                        pdfFile.files[0];


                    if (
                        file.type !==
                        "application/pdf"
                    ) {

                        throw new Error(
                            "Only PDF files are allowed."
                        );

                    }


                    const path =
                        `books/${bookId}/pdf/book-${Date.now()}.pdf`;


                    const ref =
                        storage.ref(path);


                    const upload =
                        await ref.put(file);


                    pdfUrl =
                        await upload
                        .ref
                        .getDownloadURL();

                    pdfPath = path;

                }


                /*
                =========================
                DATA
                =========================
                */

                const data = {

                    title,

                    author,

                    category,

                    language,

                    description,

                    coverUrl,

                    coverPath,

                    pdfUrl,

                    pdfPath,

                    latest,

                    updatedAt:
                        firebase.firestore
                        .FieldValue
                        .serverTimestamp()

                };


                /*
                =========================
                UPDATE
                =========================
                */

                if (editingId) {

                    await db
                    .collection("books")
                    .doc(editingId)
                    .update(data);


                    /*
                    If latest selected,
                    remove latest from others.
                    */

                    if (latest) {

                        await removeOtherLatest(
                            editingId
                        );

                    }


                    showMessage(
                        "✅ Book updated successfully."
                    );

                }


                /*
                =========================
                ADD
                =========================
                */

                else {

                    data.views = 0;
                    data.likes = 0;
                    data.shares = 0;
                    data.downloads = 0;
                    data.comments = 0;

                    data.createdAt =
                        firebase.firestore
                        .FieldValue
                        .serverTimestamp();


                    await db
                    .collection("books")
                    .doc(bookId)
                    .set(data);


                    if (latest) {

                        await removeOtherLatest(
                            bookId
                        );

                    }


                    showMessage(
                        "✅ Book added successfully."
                    );

                }


                resetBookForm();

                await loadBooks();

                await loadDashboard();

            }

            catch(error) {

                console.error(
                    "Book Save Error:",
                    error
                );

                showMessage(
                    "❌ " +
                    (error.message ||
                    "Something went wrong.")
                );

            }

            finally {

                saveBtn.disabled = false;

                saveBtn.innerText =
                    "💾 Save Book";

            }

        }
    );

}


/*=========================================
REMOVE OTHER LATEST
=========================================*/

async function removeOtherLatest(currentId) {

    const snapshot =
        await db
        .collection("books")
        .where(
            "latest",
            "==",
            true
        )
        .get();


    const batch =
        db.batch();


    snapshot.forEach(function(doc) {

        if (doc.id !== currentId) {

            batch.update(
                doc.ref,
                {
                    latest: false
                }
            );

        }

    });


    await batch.commit();

}


/*=========================================
EDIT BOOK
=========================================*/

window.editBook =
async function(bookId) {

    const book =
        books.find(
            b => b.id === bookId
        );

    if (!book) return;


    document.getElementById(
        "editingBookId"
    ).value = book.id;


    document.getElementById(
        "bookTitle"
    ).value =
        book.title || "";


    document.getElementById(
        "bookAuthor"
    ).value =
        book.author || "";


    document.getElementById(
        "bookCategory"
    ).value =
        book.category || "Other";


    document.getElementById(
        "bookLanguage"
    ).value =
        book.language || "Urdu";


    document.getElementById(
        "bookDescription"
    ).value =
        book.description || "";


    document.getElementById(
        "bookLatest"
    ).checked =
        book.latest === true;


    document.getElementById(
        "bookFormTitle"
    ).innerText =
        "Edit Book";


    document.getElementById(
        "saveBookBtn"
    ).innerText =
        "💾 Update Book";


    coverStatus.innerText =
        book.coverUrl
        ? "Existing cover will be kept"
        : "No cover selected";


    pdfStatus.innerText =
        book.pdfUrl
        ? "Existing PDF will be kept"
        : "No PDF selected";


    openSection("addBook");

};


/*=========================================
DELETE BOOK
=========================================*/

window.deleteBook =
async function(bookId) {

    const book =
        books.find(
            b => b.id === bookId
        );

    if (!book) return;


    const confirmed =
        confirm(
            `Delete "${book.title}"?`
        );


    if (!confirmed) return;


    try {

        await db
        .collection("books")
        .doc(bookId)
        .delete();


        /*
        Delete Storage folder
        */

        try {

            const folderRef =
                storage.ref(
                    `books/${bookId}`
                );

            const result =
                await folderRef.listAll();


            const deletePromises =
                result.items.map(
                    item =>
                        item.delete()
                );


            await Promise.all(
                deletePromises
            );

        }

        catch(storageError) {

            console.warn(
                "Storage delete warning:",
                storageError
            );

        }


        alert(
            "✅ Book deleted."
        );


        await loadBooks();

        await loadDashboard();

    }

    catch(error) {

        console.error(
            "Delete Error:",
            error
        );

        alert(
            "❌ Could not delete book."
        );

    }

};


/*=========================================
CANCEL EDIT
=========================================*/

const cancelEdit =
    document.getElementById(
        "cancelEdit"
    );

if (cancelEdit) {

    cancelEdit.onclick =
        resetBookForm;

}


function resetBookForm() {

    if (!bookForm) return;

    bookForm.reset();

    document.getElementById(
        "editingBookId"
    ).value = "";


    document.getElementById(
        "bookFormTitle"
    ).innerText =
        "Add New Book";


    document.getElementById(
        "saveBookBtn"
    ).innerText =
        "💾 Save Book";


    coverStatus.innerText =
        "No cover selected";


    pdfStatus.innerText =
        "No PDF selected";


    bookMessage.innerText = "";

}


/*=========================================
FILE STATUS
=========================================*/

if (coverFile) {

    coverFile.addEventListener(
        "change",
        function() {

            coverStatus.innerText =
                this.files.length
                ? "✅ " +
                  this.files[0].name
                : "No cover selected";

        }
    );

}


if (pdfFile) {

    pdfFile.addEventListener(
        "change",
        function() {

            pdfStatus.innerText =
                this.files.length
                ? "✅ " +
                  this.files[0].name
                : "No PDF selected";

        }
    );

}


/*=========================================
COMMENTS
=========================================*/

async function loadComments() {

    const container =
        document.getElementById(
            "commentsContainer"
        );

    if (!container) return;


    container.innerHTML =
        `<p class="loading">
            Loading comments...
        </p>`;


    try {

        const snapshot =
            await db
            .collection("books")
            .get();


        const allComments = [];


        for (
            const bookDoc
            of snapshot.docs
        ) {

            const book =
                bookDoc.data();


            const commentsSnapshot =
                await db
                .collection("books")
                .doc(bookDoc.id)
                .collection("comments")
                .get();


            commentsSnapshot.forEach(
                function(commentDoc) {

                    allComments.push({

                        id:
                            commentDoc.id,

                        bookId:
                            bookDoc.id,

                        bookTitle:
                            book.title || "Book",

                        ...commentDoc.data()

                    });

                }
            );

        }


        container.innerHTML = "";


        if (
            allComments.length === 0
        ) {

            container.innerHTML =
                `<p class="loading">
                    No comments found.
                </p>`;

            return;

        }


        allComments.forEach(
            function(comment) {

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "comment-card";


                card.innerHTML = `

                    <h3>
                        ${escapeHTML(
                            comment.name ||
                            "Visitor"
                        )}
                    </h3>

                    <div class="comment-book">
                        📚 ${
                            escapeHTML(
                                comment.bookTitle
                            )
                        }
                    </div>

                    <p>
                        ${escapeHTML(
                            comment.comment || ""
                        )}
                    </p>

                    <button
                        class="action-btn delete-btn"
                        onclick="deleteComment(
                            '${comment.bookId}',
                            '${comment.id}'
                        )"
                    >
                        🗑️ Delete
                    </button>

                `;


                container.appendChild(card);

            }
        );

    }

    catch(error) {

        console.error(
            "Comments Error:",
            error
        );

        container.innerHTML =
            `<p>
                ❌ Unable to load comments.
            </p>`;

    }

}


/*=========================================
DELETE COMMENT
=========================================*/

window.deleteComment =
async function(
    bookId,
    commentId
) {

    if (
        !confirm(
            "Delete this comment?"
        )
    ) return;


    try {

        await db
        .collection("books")
        .doc(bookId)
        .collection("comments")
        .doc(commentId)
        .delete();


        /*
        Update comments counter
        */

        const bookRef =
            db
            .collection("books")
            .doc(bookId);


        const bookDoc =
            await bookRef.get();


        if (bookDoc.exists) {

            const current =
                Number(
                    bookDoc.data().comments ||
                    0
                );


            await bookRef.update({

                comments:
                    Math.max(
                        0,
                        current - 1
                    )

            });

        }


        await loadComments();

        await loadDashboard();

    }

    catch(error) {

        console.error(
            "Comment delete error:",
            error
        );

    }

};


/*=========================================
MESSAGE
=========================================*/

function showMessage(message) {

    bookMessage.innerText =
        message;

}


/*=========================================
ESCAPE HTML
=========================================*/

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/*=========================================
CONSOLE
=========================================*/

console.log(
    "===================================="
);

console.log(
    "📚 CHISHTI LIBRARY ADMIN"
);

console.log(
    "✅ Firebase Auth"
);

console.log(
    "✅ Dashboard"
);

console.log(
    "✅ Books"
);

console.log(
    "✅ Add / Edit / Delete"
);

console.log(
    "✅ PDF Upload"
);

console.log(
    "✅ Cover Upload"
);

console.log(
    "✅ Visitor Statistics"
);

console.log(
    "✅ Comments"
);

console.log(
    "🚀 Admin Panel Ready"
);

console.log(
    "===================================="
);
