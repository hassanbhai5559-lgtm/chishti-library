"use strict";

/*
=========================================================
 CHISHTI LIBRARY
 ADMIN.JS
 FULL ADMIN PANEL
=========================================================

 FEATURES
 --------------------------------------------------------
 ✅ Firebase Authentication
 ✅ Admin Auth Check
 ✅ Firestore Books
 ✅ Add Book
 ✅ Edit Book
 ✅ Change Book Name
 ✅ Change Author
 ✅ Change Category
 ✅ Change Description
 ✅ Cover Upload
 ✅ PDF Upload
 ✅ Delete Book
 ✅ Search
 ✅ Category Filter
 ✅ Latest Book
 ✅ Statistics
 ✅ Visitor Statistics
 ✅ Logout
=========================================================
*/


/*=========================================================
 GLOBAL
=========================================================*/

let adminBooks = [];
let editingBookId = null;


/*=========================================================
 DOM HELPER
=========================================================*/

function $(id) {
    return document.getElementById(id);
}


/*=========================================================
 TEXT HELPER
=========================================================*/

function setText(id, value) {

    const element = $(id);

    if (!element) return;

    element.innerText =
        Number(value || 0).toLocaleString();
}


/*=========================================================
 HTML ESCAPE
=========================================================*/

function escapeHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/*=========================================================
 FIREBASE CHECK
=========================================================*/

function firebaseIsReady() {

    return (
        typeof firebase !== "undefined" &&
        window.db &&
        window.auth &&
        window.storage
    );

}


/*=========================================================
 START ADMIN PANEL
=========================================================*/

function startAdminPanel() {

    if (!firebaseIsReady()) {

        console.error(
            "❌ Firebase is not ready."
        );

        return;

    }

    console.log(
        "🔥 Firebase ready."
    );


    auth.onAuthStateChanged(function(user) {

        if (!user) {

            console.warn(
                "⚠️ No admin logged in."
            );

            showLoginRequired();

            return;

        }


        console.log(
            "✅ Admin authenticated:",
            user.email
        );


        showAdminPanel(user);

        loadAdminBooks();

        loadAdminStatistics();

    });

}


/*=========================================================
 SHOW LOGIN REQUIRED
=========================================================*/

function showLoginRequired() {

    const loginSection =
        $("loginSection");

    const adminSection =
        $("adminSection");


    if (loginSection) {

        loginSection.style.display =
            "block";

    }


    if (adminSection) {

        adminSection.style.display =
            "none";

    }

}


/*=========================================================
 SHOW ADMIN PANEL
=========================================================*/

function showAdminPanel(user) {

    const loginSection =
        $("loginSection");

    const adminSection =
        $("adminSection");


    if (loginSection) {

        loginSection.style.display =
            "none";

    }


    if (adminSection) {

        adminSection.style.display =
            "block";

    }


    const adminEmail =
        $("adminEmail");


    if (adminEmail) {

        adminEmail.innerText =
            user.email || "Admin";

    }

}


/*=========================================================
 LOGOUT
=========================================================*/

async function adminLogout() {

    try {

        await auth.signOut();

        console.log(
            "✅ Admin logged out."
        );


        window.location.href =
            "./login.html";

    }

    catch (error) {

        console.error(
            "❌ Logout Error:",
            error
        );

        alert(
            "Logout failed: " +
            error.message
        );

    }

}


/*=========================================================
 LOAD BOOKS
=========================================================*/

async function loadAdminBooks() {

    if (!firebaseIsReady()) return;


    try {

        const snapshot =
            await db
                .collection("books")
                .orderBy(
                    "createdAt",
                    "desc"
                )
                .get();


        adminBooks = [];


        snapshot.forEach(function(doc) {

            adminBooks.push({

                id: doc.id,

                ...doc.data()

            });

        });


        console.log(
            "✅ Books Loaded:",
            adminBooks.length
        );


        displayAdminBooks(
            adminBooks
        );


        setText(
            "totalBooks",
            adminBooks.length
        );

    }

    catch (error) {

        console.error(
            "❌ Books Load Error:",
            error
        );

        /*
        If some old Firestore books don't have
        createdAt, load without orderBy.
        */

        try {

            const snapshot =
                await db
                    .collection("books")
                    .get();


            adminBooks = [];


            snapshot.forEach(function(doc) {

                adminBooks.push({

                    id: doc.id,

                    ...doc.data()

                });

            });


            displayAdminBooks(
                adminBooks
            );


            setText(
                "totalBooks",
                adminBooks.length
            );


        }

        catch (secondError) {

            console.error(
                "❌ Backup Book Load Error:",
                secondError
            );

        }

    }

}


/*=========================================================
 DISPLAY BOOKS
=========================================================*/

function displayAdminBooks(books) {

    const container =
        $("adminBooksContainer") ||
        $("adminBookList") ||
        $("booksContainer");


    if (!container) {

        console.warn(
            "⚠️ adminBooksContainer not found."
        );

        return;

    }


    container.innerHTML = "";


    if (!books.length) {

        container.innerHTML = `

            <div class="no-books">

                <h3>No Books Found</h3>

                <p>Add your first book.</p>

            </div>

        `;

        return;

    }


    books.forEach(function(book) {

        const cover =
            book.coverUrl ||
            book.cover ||
            "logo.png";


        const latest =
            book.latest === true
                ? `
                    <span class="latest-badge">
                        ⭐ LATEST
                    </span>
                  `
                : "";


        container.innerHTML += `

            <div
                class="admin-book-card"
                data-id="${escapeHTML(book.id)}"
            >

                <div class="admin-book-cover">

                    <img
                        src="${escapeHTML(cover)}"
                        alt="${escapeHTML(book.title)}"
                        onerror="this.src='logo.png'"
                    >

                </div>


                <div class="admin-book-info">

                    ${latest}


                    <h3>
                        ${escapeHTML(
                            book.title ||
                            "Untitled Book"
                        )}
                    </h3>


                    <p>
                        <strong>Author:</strong>
                        ${escapeHTML(
                            book.author ||
                            "Unknown"
                        )}
                    </p>


                    <p>
                        <strong>Category:</strong>
                        ${escapeHTML(
                            book.category ||
                            "Other"
                        )}
                    </p>


                    <p>
                        ${escapeHTML(
                            book.description ||
                            ""
                        )}
                    </p>


                    <div class="admin-book-stats">

                        <span>
                            👁 ${Number(
                                book.views || 0
                            ).toLocaleString()}
                        </span>

                        <span>
                            ❤️ ${Number(
                                book.likes || 0
                            ).toLocaleString()}
                        </span>

                        <span>
                            🔗 ${Number(
                                book.shares || 0
                            ).toLocaleString()}
                        </span>

                        <span>
                            ⬇ ${Number(
                                book.downloads || 0
                            ).toLocaleString()}
                        </span>

                    </div>


                    <div class="admin-actions">

                        <button
                            type="button"
                            class="edit-book-btn"
                            onclick="editBook('${book.id}')"
                        >
                            ✏️ Edit
                        </button>


                        <button
                            type="button"
                            class="delete-book-btn"
                            onclick="deleteBook('${book.id}')"
                        >
                            🗑️ Delete
                        </button>


                        <button
                            type="button"
                            class="latest-book-btn"
                            onclick="setLatestBook('${book.id}')"
                        >
                            ⭐ Latest
                        </button>

                    </div>

                </div>

            </div>

        `;

    });

}


/*=========================================================
 ADD BOOK
=========================================================*/

async function addNewBook() {

    if (!auth.currentUser) {

        alert(
            "Please login first."
        );

        return;

    }


    const title =
        $("bookTitle")?.value.trim() || "";


    const author =
        $("bookAuthor")?.value.trim() || "";


    const category =
        $("bookCategory")?.value ||
        "Other";


    const description =
        $("bookDescription")?.value.trim() ||
        "";


    const latest =
        $("bookLatest")?.checked ||
        false;


    const coverFile =
        $("bookCover")?.files?.[0] ||
        null;


    const pdfFile =
        $("bookPDF")?.files?.[0] ||
        null;


    if (!title) {

        alert(
            "Please enter the book title."
        );

        return;

    }


    if (!author) {

        alert(
            "Please enter the author name."
        );

        return;

    }


    if (!pdfFile) {

        alert(
            "Please select a PDF."
        );

        return;

    }


    if (
        pdfFile.type !==
        "application/pdf"
    ) {

        alert(
            "Only PDF files are allowed."
        );

        return;

    }


    try {

        const bookRef =
            db
                .collection("books")
                .doc();


        const bookId =
            bookRef.id;


        let coverURL = "";
        let coverPath = "";

        let pdfURL = "";
        let pdfPath = "";


        /*=========================================
         COVER
        =========================================*/

        if (coverFile) {

            const coverResult =
                await uploadFirebaseFile(
                    coverFile,
                    "books/" +
                    bookId +
                    "/cover",
                    "cover-" +
                    Date.now()
                );


            coverURL =
                coverResult.url;

            coverPath =
                coverResult.path;

        }


        /*=========================================
         PDF
        =========================================*/

        const pdfResult =
            await uploadFirebaseFile(
                pdfFile,
                "books/" +
                bookId +
                "/pdf",
                "book-" +
                Date.now() +
                ".pdf"
            );


        pdfURL =
            pdfResult.url;

        pdfPath =
            pdfResult.path;


        /*=========================================
         FIRESTORE DATA
        =========================================*/

        const bookData = {

            title: title,

            author: author,

            category: category,

            description: description,

            coverUrl: coverURL,

            coverPath: coverPath,

            pdfUrl: pdfURL,

            pdfPath: pdfPath,

            latest: latest,

            views: 0,

            likes: 0,

            shares: 0,

            downloads: 0,

            comments: 0,

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        };


        await bookRef.set(
            bookData
        );


        /*=========================================
         LATEST
        =========================================*/

        if (latest) {

            await removeOtherLatestBooks(
                bookId
            );

        }


        alert(
            "✅ Book added successfully!"
        );


        resetBookForm();


        await loadAdminBooks();

        await loadAdminStatistics();

    }

    catch (error) {

        console.error(
            "❌ Add Book Error:",
            error
        );


        alert(
            "❌ Add Book Failed:\n" +
            error.message
        );

    }

}


/*=========================================================
 EDIT BOOK
=========================================================*/

async function editBook(bookId) {

    if (!bookId) return;


    try {

        const doc =
            await db
                .collection("books")
                .doc(bookId)
                .get();


        if (!doc.exists) {

            alert(
                "Book not found."
            );

            return;

        }


        const book =
            doc.data();


        editingBookId =
            bookId;


        /*=========================================
         FILL FORM
        =========================================*/

        if ($("bookTitle")) {

            $("bookTitle").value =
                book.title || "";

        }


        if ($("bookAuthor")) {

            $("bookAuthor").value =
                book.author || "";

        }


        if ($("bookCategory")) {

            $("bookCategory").value =
                book.category || "Other";

        }


        if ($("bookDescription")) {

            $("bookDescription").value =
                book.description || "";

        }


        if ($("bookLatest")) {

            $("bookLatest").checked =
                book.latest === true;

        }


        /*=========================================
         UPDATE BUTTON
        =========================================*/

        const saveButton =
            $("saveBookBtn") ||
            $("addBookBtn");


        if (saveButton) {

            saveButton.innerText =
                "💾 Update Book";

        }


        const cancelButton =
            $("cancelEditBtn");


        if (cancelButton) {

            cancelButton.style.display =
                "inline-block";

        }


        /*=========================================
         SCROLL TO FORM
        =========================================*/

        const form =
            $("bookForm");


        if (form) {

            form.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        }


        console.log(
            "✏️ Editing book:",
            bookId,
            book.title
        );

    }

    catch (error) {

        console.error(
            "❌ Edit Error:",
            error
        );


        alert(
            "Unable to edit book:\n" +
            error.message
        );

    }

}


/*=========================================================
 UPDATE BOOK
=========================================================*/

async function updateExistingBook() {

    if (!editingBookId) {

        return addNewBook();

    }


    if (!auth.currentUser) {

        alert(
            "Please login first."
        );

        return;

    }


    const title =
        $("bookTitle")?.value.trim() || "";


    const author =
        $("bookAuthor")?.value.trim() || "";


    const category =
        $("bookCategory")?.value ||
        "Other";


    const description =
        $("bookDescription")?.value.trim() ||
        "";


    const latest =
        $("bookLatest")?.checked ||
        false;


    const coverFile =
        $("bookCover")?.files?.[0] ||
        null;


    const pdfFile =
        $("bookPDF")?.files?.[0] ||
        null;


    if (!title) {

        alert(
            "Please enter the book title."
        );

        return;

    }


    if (!author) {

        alert(
            "Please enter the author name."
        );

        return;

    }


    try {

        /*=========================================
         UPDATE DATA
        =========================================*/

        const updateData = {

            title: title,

            author: author,

            category: category,

            description: description,

            latest: latest,

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        };


        /*=========================================
         NEW COVER
        =========================================*/

        if (coverFile) {

            const coverResult =
                await uploadFirebaseFile(

                    coverFile,

                    "books/" +
                    editingBookId +
                    "/cover",

                    "cover-" +
                    Date.now()

                );


            updateData.coverUrl =
                coverResult.url;


            updateData.coverPath =
                coverResult.path;

        }


        /*=========================================
         NEW PDF
        =========================================*/

        if (pdfFile) {

            if (
                pdfFile.type !==
                "application/pdf"
            ) {

                alert(
                    "Only PDF files are allowed."
                );

                return;

            }


            const pdfResult =
                await uploadFirebaseFile(

                    pdfFile,

                    "books/" +
                    editingBookId +
                    "/pdf",

                    "book-" +
                    Date.now() +
                    ".pdf"

                );


            updateData.pdfUrl =
                pdfResult.url;


            updateData.pdfPath =
                pdfResult.path;

        }


        /*=========================================
         FIRESTORE UPDATE
        =========================================*/

        await db
            .collection("books")
            .doc(editingBookId)
            .update(
                updateData
            );


        /*=========================================
         LATEST
        =========================================*/

        if (latest) {

            await removeOtherLatestBooks(
                editingBookId
            );

        }


        console.log(
            "✅ Book updated:",
            editingBookId
        );


        alert(
            "✅ Book updated successfully!"
        );


        resetBookForm();


        await loadAdminBooks();

        await loadAdminStatistics();

    }

    catch (error) {

        console.error(
            "❌ Update Book Error:",
            error
        );


        alert(
            "❌ Update failed:\n" +
            error.message
        );

    }

}


/*=========================================================
 SAVE BOOK
=========================================================*/

async function saveBook() {

    if (editingBookId) {

        await updateExistingBook();

    }

    else {

        await addNewBook();

    }

}


/*=========================================================
 DELETE BOOK
=========================================================*/

async function deleteBook(bookId) {

    if (!auth.currentUser) {

        alert(
            "Please login first."
        );

        return;

    }


    const book =
        adminBooks.find(
            item => item.id === bookId
        );


    const bookName =
        book?.title ||
        "this book";


    const confirmed =
        confirm(
            "⚠️ Delete \"" +
            bookName +
            "\"?\n\n" +
            "This will remove the Firestore book record."
        );


    if (!confirmed) return;


    try {

        await db
            .collection("books")
            .doc(bookId)
            .delete();


        alert(
            "🗑️ Book deleted successfully!"
        );


        await loadAdminBooks();

        await loadAdminStatistics();

    }

    catch (error) {

        console.error(
            "❌ Delete Error:",
            error
        );


        alert(
            "❌ Delete failed:\n" +
            error.message
        );

    }

}


/*=========================================================
 SET LATEST BOOK
=========================================================*/

async function setLatestBook(bookId) {

    if (!bookId) return;


    try {

        await removeOtherLatestBooks(
            bookId
        );


        await db
            .collection("books")
            .doc(bookId)
            .update({

                latest: true,

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            });


        alert(
            "⭐ Latest book updated!"
        );


        await loadAdminBooks();

    }

    catch (error) {

        console.error(
            "❌ Latest Error:",
            error
        );


        alert(
            "Could not set latest book:\n" +
            error.message
        );

    }

}


/*=========================================================
 REMOVE OTHER LATEST BOOKS
=========================================================*/

async function removeOtherLatestBooks(
    currentBookId
) {

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


    let changed = false;


    snapshot.forEach(function(doc) {

        if (
            doc.id !==
            currentBookId
        ) {

            batch.update(
                doc.ref,
                {
                    latest: false
                }
            );


            changed = true;

        }

    });


    if (changed) {

        await batch.commit();

    }

}


/*=========================================================
 RESET FORM
=========================================================*/

function resetBookForm() {

    editingBookId =
        null;


    const form =
        $("bookForm");


    if (form) {

        form.reset();

    }


    const saveButton =
        $("saveBookBtn") ||
        $("addBookBtn");


    if (saveButton) {

        saveButton.innerText =
            "➕ Add Book";

    }


    const cancelButton =
        $("cancelEditBtn");


    if (cancelButton) {

        cancelButton.style.display =
            "none";

    }


    console.log(
        "↩️ Book form reset."
    );

}


/*=========================================================
 SEARCH
=========================================================*/

function searchAdminBooks() {

    const input =
        $("adminSearch") ||
        $("searchInput");


    if (!input) return;


    const query =
        input.value
            .toLowerCase()
            .trim();


    if (!query) {

        displayAdminBooks(
            adminBooks
        );

        return;

    }


    const filtered =
        adminBooks.filter(function(book) {

            return (

                (book.title || "")
                    .toLowerCase()
                    .includes(query)

                ||

                (book.author || "")
                    .toLowerCase()
                    .includes(query)

                ||

                (book.category || "")
                    .toLowerCase()
                    .includes(query)

            );

        });


    displayAdminBooks(
        filtered
    );

}


/*=========================================================
 CATEGORY FILTER
=========================================================*/

function filterAdminBooks(category) {

    if (
        !category ||
        category === "All" ||
        category === "ALL"
    ) {

        displayAdminBooks(
            adminBooks
        );

        return;

    }


    const filtered =
        adminBooks.filter(function(book) {

            return (
                book.category === category
            );

        });


    displayAdminBooks(
        filtered
    );

}


/*=========================================================
 STATISTICS
=========================================================*/

async function loadAdminStatistics() {

    if (!firebaseIsReady()) return;


    try {

        const snapshot =
            await db
                .collection("books")
                .get();


        let views = 0;
        let likes = 0;
        let shares = 0;
        let downloads = 0;
        let comments = 0;
        let latest = 0;


        snapshot.forEach(function(doc) {

            const book =
                doc.data();


            views +=
                Number(
                    book.views || 0
                );


            likes +=
                Number(
                    book.likes || 0
                );


            shares +=
                Number(
                    book.shares || 0
                );


            downloads +=
                Number(
                    book.downloads || 0
                );


            comments +=
                Number(
                    book.comments || 0
                );


            if (
                book.latest === true
            ) {

                latest++;

            }

        });


        setText(
            "totalBooks",
            snapshot.size
        );


        setText(
            "totalViews",
            views
        );


        setText(
            "totalLikes",
            likes
        );


        setText(
            "totalShares",
            shares
        );


        setText(
            "totalDownloads",
            downloads
        );


        setText(
            "totalComments",
            comments
        );


        setText(
            "latestBooks",
            latest
        );


        /*=========================================
         VISITORS
        =========================================*/

        const statsDoc =
            await db
                .collection("statistics")
                .doc("main")
                .get();


        let visitors = 0;


        if (statsDoc.exists) {

            visitors =
                Number(
                    statsDoc.data()
                        .visitors || 0
                );

        }


        setText(
            "totalVisitors",
            visitors
        );


        setText(
            "visitorCounter",
            visitors
        );


        console.log(
            "📊 Statistics loaded."
        );

    }

    catch (error) {

        console.error(
            "❌ Statistics Error:",
            error
        );

    }

}


/*=========================================================
 UPLOAD FIREBASE FILE
=========================================================*/

async function uploadFirebaseFile(
    file,
    folder,
    fileName
) {

    if (!file) {

        throw new Error(
            "No file selected."
        );

    }


    if (!window.storage) {

        throw new Error(
            "Firebase Storage is not ready."
        );

    }


    const path =
        folder +
        "/" +
        fileName;


    const reference =
        storage.ref(path);


    const snapshot =
        await reference.put(file);


    const url =
        await snapshot.ref
            .getDownloadURL();


    console.log(
        "✅ Uploaded:",
        path
    );


    return {

        url: url,

        path: path

    };

}


/*=========================================================
 REFRESH
=========================================================*/

async function refreshAdminPanel() {

    await loadAdminBooks();

    await loadAdminStatistics();

}


/*=========================================================
 DOM READY
=========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "📋 Admin DOM ready."
        );


        /*=====================================
         BOOK FORM
        =====================================*/

        const form =
            $("bookForm");


        if (form) {

            form.addEventListener(
                "submit",
                function(event) {

                    event.preventDefault();

                    saveBook();

                }
            );

        }


        /*=====================================
         CANCEL EDIT
        =====================================*/

        const cancel =
            $("cancelEditBtn");


        if (cancel) {

            cancel.addEventListener(
                "click",
                function() {

                    resetBookForm();

                }
            );

        }


        /*=====================================
         SEARCH
        =====================================*/

        const search =
            $("adminSearch") ||
            $("searchInput");


        if (search) {

            search.addEventListener(
                "input",
                function() {

                    searchAdminBooks();

                }
            );

        }


        /*=====================================
         LOGOUT
        =====================================*/

        const logout =
            $("logoutBtn");


        if (logout) {

            logout.addEventListener(
                "click",
                function() {

                    adminLogout();

                }
            );

        }


        /*=====================================
         REFRESH
        =====================================*/

        const refresh =
            $("refreshBtn");


        if (refresh) {

            refresh.addEventListener(
                "click",
                function() {

                    refreshAdminPanel();

                }
            );

        }

    }
);


/*=========================================================
 GLOBAL FUNCTIONS
=========================================================*/

window.loadAdminBooks =
    loadAdminBooks;

window.displayAdminBooks =
    displayAdminBooks;

window.addNewBook =
    addNewBook;

window.saveBook =
    saveBook;

window.editBook =
    editBook;

window.updateExistingBook =
    updateExistingBook;

window.deleteBook =
    deleteBook;

window.setLatestBook =
    setLatestBook;

window.resetBookForm =
    resetBookForm;

window.searchAdminBooks =
    searchAdminBooks;

window.filterAdminBooks =
    filterAdminBooks;

window.loadAdminStatistics =
    loadAdminStatistics;

window.refreshAdminPanel =
    refreshAdminPanel;

window.adminLogout =
    adminLogout;


/*=========================================================
 START
=========================================================*/

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startAdminPanel
    );

}

else {

    startAdminPanel();

}


/*=========================================================
 CONSOLE
=========================================================*/

console.log(
    "===================================="
);

console.log(
    "📚 CHISHTI LIBRARY ADMIN"
);

console.log(
    "===================================="
);

console.log(
    "✅ Firebase Authentication"
);

console.log(
    "✅ Firestore"
);

console.log(
    "✅ Add Book"
);

console.log(
    "✅ Edit Book"
);

console.log(
    "✅ Book Name Update"
);

console.log(
    "✅ Author Update"
);

console.log(
    "✅ Category Update"
);

console.log(
    "✅ Description Update"
);

console.log(
    "✅ Cover Upload"
);

console.log(
    "✅ PDF Upload"
);

console.log(
    "✅ Delete Book"
);

console.log(
    "✅ Search"
);

console.log(
    "✅ Latest Book"
);

console.log(
    "✅ Statistics"
);

console.log(
    "✅ Visitor Counter"
);

console.log(
    "🚀 ADMIN PANEL READY"
);

console.log(
    "===================================="
);
