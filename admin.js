"use strict";

/*
=========================================================
CHISHTI LIBRARY
ADMIN.JS
FULL ADMIN PANEL
=========================================================

FEATURES:

✅ Firebase Authentication
✅ Admin Login
✅ Logout
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
✅ Search Books
✅ Category Filter
✅ Latest Book
✅ Statistics
✅ Visitor Counter
=========================================================
*/


/*=========================================================
 GLOBAL VARIABLES
=========================================================*/

let adminBooks = [];
let editingBookId = null;


/*=========================================================
 WAIT FOR FIREBASE
=========================================================*/

function waitForFirebase(callback) {

    if (
        window.firebaseReady &&
        window.db &&
        window.auth &&
        window.storage
    ) {

        callback();

        return;
    }


    window.addEventListener(
        "firebaseReady",
        callback,
        { once: true }
    );

}


/*=========================================================
 DOM HELPER
=========================================================*/

function get(id) {

    return document.getElementById(id);

}


/*=========================================================
 ADMIN PAGE START
=========================================================*/

waitForFirebase(function () {

    console.log("🔥 Firebase ready for Admin Panel");

    checkAdminLogin();

    loadAdminBooks();

    loadAdminStatistics();

});


/*=========================================================
 AUTH CHECK
=========================================================*/

function checkAdminLogin() {

    auth.onAuthStateChanged(function (user) {

        const loginSection =
            get("loginSection");

        const adminSection =
            get("adminSection");

        const adminEmail =
            get("adminEmail");

        if (user) {

            console.log(
                "✅ Admin logged in:",
                user.email
            );


            if (loginSection) {

                loginSection.style.display =
                    "none";

            }


            if (adminSection) {

                adminSection.style.display =
                    "block";

            }


            if (adminEmail) {

                adminEmail.innerText =
                    user.email || "Admin";

            }

        }

        else {

            console.log(
                "ℹ️ No admin logged in"
            );


            if (loginSection) {

                loginSection.style.display =
                    "block";

            }


            if (adminSection) {

                adminSection.style.display =
                    "none";

            }

        }

    });

}


/*=========================================================
 LOGIN
=========================================================*/

async function adminLoginForm() {

    const email =
        get("loginEmail")?.value.trim();

    const password =
        get("loginPassword")?.value;


    if (!email || !password) {

        alert(
            "Please enter email and password."
        );

        return;

    }


    try {

        await auth.signInWithEmailAndPassword(
            email,
            password
        );


        alert(
            "✅ Login successful!"
        );


    }

    catch (error) {

        console.error(
            "❌ Login Error:",
            error
        );


        alert(
            "Login failed: " +
            error.message
        );

    }

}


/*=========================================================
 LOGOUT
=========================================================*/

async function adminLogout() {

    try {

        await auth.signOut();

        alert(
            "✅ Logged out successfully."
        );

    }

    catch (error) {

        console.error(
            "❌ Logout Error:",
            error
        );

    }

}


/*=========================================================
 LOAD BOOKS
=========================================================*/

async function loadAdminBooks() {

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


        snapshot.forEach(function (doc) {

            adminBooks.push({

                id: doc.id,

                ...doc.data()

            });

        });


        console.log(
            "✅ Admin Books Loaded:",
            adminBooks.length
        );


        displayAdminBooks(
            adminBooks
        );


        updateBookStatistics();


    }

    catch (error) {

        console.error(
            "❌ Load Books Error:",
            error
        );

    }

}


/*=========================================================
 DISPLAY BOOKS
=========================================================*/

function displayAdminBooks(books) {

    const container =
        get("adminBooksContainer") ||
        get("booksContainer") ||
        get("adminBookList");


    if (!container) {

        console.warn(
            "⚠️ Books container not found."
        );

        return;

    }


    container.innerHTML = "";


    if (!books.length) {

        container.innerHTML = `

            <div class="no-books">

                <h3>No Books Found</h3>

            </div>

        `;

        return;

    }


    books.forEach(function (book) {

        const cover =
            book.coverUrl || "logo.png";


        const latestBadge =
            book.latest === true
                ? `<span class="latest-badge">
                    LATEST
                   </span>`
                : "";


        container.innerHTML += `

        <div class="admin-book-card"
             data-id="${book.id}">

            <div class="admin-book-cover">

                <img
                    src="${escapeHTML(cover)}"
                    alt="${escapeHTML(book.title || "")}"
                    onerror="this.src='logo.png'"
                >

            </div>


            <div class="admin-book-info">

                ${latestBadge}

                <h3>
                    ${escapeHTML(
                        book.title || "Untitled"
                    )}
                </h3>


                <p>
                    <strong>Author:</strong>
                    ${escapeHTML(
                        book.author || "Unknown"
                    )}
                </p>


                <p>
                    <strong>Category:</strong>
                    ${escapeHTML(
                        book.category || "Other"
                    )}
                </p>


                <p>
                    ${escapeHTML(
                        book.description || ""
                    )}
                </p>


                <div class="admin-stats">

                    <span>
                        👁 ${book.views || 0}
                    </span>

                    <span>
                        ❤️ ${book.likes || 0}
                    </span>

                    <span>
                        🔗 ${book.shares || 0}
                    </span>

                    <span>
                        ⬇ ${book.downloads || 0}
                    </span>

                </div>


                <div class="admin-actions">

                    <button
                        class="edit-book-btn"
                        onclick="editBook('${book.id}')">

                        ✏️ Edit

                    </button>


                    <button
                        class="delete-book-btn"
                        onclick="deleteBook('${book.id}')">

                        🗑️ Delete

                    </button>


                    <button
                        class="latest-book-btn"
                        onclick="setLatestBook('${book.id}')">

                        ⭐ Latest

                    </button>

                </div>

            </div>

        </div>

        `;

    });

}


/*=========================================================
 ESCAPE HTML
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
 GET FORM VALUES
=========================================================*/

function getBookFormData() {

    return {

        title:
            get("bookTitle")?.value.trim() || "",

        author:
            get("bookAuthor")?.value.trim() || "",

        category:
            get("bookCategory")?.value || "Other",

        description:
            get("bookDescription")?.value.trim() || "",

        latest:
            get("bookLatest")?.checked || false

    };

}


/*=========================================================
 ADD / UPDATE BOOK
=========================================================*/

async function saveBook() {

    if (!window.currentFirebaseUser) {

        alert(
            "Please login as admin first."
        );

        return;

    }


    const data =
        getBookFormData();


    if (!data.title) {

        alert(
            "Please enter book title."
        );

        return;

    }


    if (!data.author) {

        alert(
            "Please enter author name."
        );

        return;

    }


    const coverInput =
        get("bookCover");

    const pdfInput =
        get("bookPDF");


    const coverFile =
        coverInput?.files?.[0] || null;

    const pdfFile =
        pdfInput?.files?.[0] || null;


    try {

        let bookId =
            editingBookId;


        /*=========================================
        NEW BOOK
        =========================================*/

        if (!bookId) {

            const bookRef =
                db
                    .collection("books")
                    .doc();


            bookId =
                bookRef.id;


            let coverData = null;
            let pdfData = null;


            /* COVER */

            if (coverFile) {

                coverData =
                    await uploadFirebaseFile(
                        coverFile,
                        "books/" +
                        bookId +
                        "/cover",
                        "cover-" +
                        Date.now()
                    );

            }


            /* PDF */

            if (pdfFile) {

                pdfData =
                    await uploadFirebaseFile(
                        pdfFile,
                        "books/" +
                        bookId +
                        "/pdf",
                        "book-" +
                        Date.now() +
                        ".pdf"
                    );

            }


            const bookData = {

                title:
                    data.title,

                author:
                    data.author,

                category:
                    data.category,

                description:
                    data.description,

                coverUrl:
                    coverData?.url || "",

                coverPath:
                    coverData?.path || "",

                pdfUrl:
                    pdfData?.url || "",

                pdfPath:
                    pdfData?.path || "",

                latest:
                    data.latest,

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


            /* REMOVE OTHER LATEST BOOKS */

            if (data.latest) {

                await removeOtherLatestBooks(
                    bookId
                );

            }


            alert(
                "✅ Book added successfully!"
            );

        }


        /*=========================================
        UPDATE BOOK
        =========================================*/

        else {

            const updateData = {

                title:
                    data.title,

                author:
                    data.author,

                category:
                    data.category,

                description:
                    data.description,

                latest:
                    data.latest,

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            };


            /*=====================================
            NEW COVER
            =====================================*/

            if (coverFile) {

                const coverData =
                    await uploadFirebaseFile(
                        coverFile,
                        "books/" +
                        bookId +
                        "/cover",
                        "cover-" +
                        Date.now()
                    );


                updateData.coverUrl =
                    coverData.url;

                updateData.coverPath =
                    coverData.path;

            }


            /*=====================================
            NEW PDF
            =====================================*/

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


                const pdfData =
                    await uploadFirebaseFile(
                        pdfFile,
                        "books/" +
                        bookId +
                        "/pdf",
                        "book-" +
                        Date.now() +
                        ".pdf"
                    );


                updateData.pdfUrl =
                    pdfData.url;

                updateData.pdfPath =
                    pdfData.path;

            }


            /*=====================================
            FIRESTORE UPDATE
            =====================================*/

            await db
                .collection("books")
                .doc(bookId)
                .update(
                    updateData
                );


            /* REMOVE OTHER LATEST */

            if (data.latest) {

                await removeOtherLatestBooks(
                    bookId
                );

            }


            alert(
                "✅ Book updated successfully!"
            );

        }


        resetBookForm();

        await loadAdminBooks();

        await loadAdminStatistics();

    }

    catch (error) {

        console.error(
            "❌ Save Book Error:",
            error
        );


        alert(
            "❌ Error:\n" +
            error.message
        );

    }

}


/*=========================================================
 EDIT BOOK
=========================================================*/

async function editBook(bookId) {

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


        /* FILL FORM */

        if (get("bookTitle"))
            get("bookTitle").value =
                book.title || "";


        if (get("bookAuthor"))
            get("bookAuthor").value =
                book.author || "";


        if (get("bookCategory"))
            get("bookCategory").value =
                book.category || "Other";


        if (get("bookDescription"))
            get("bookDescription").value =
                book.description || "";


        if (get("bookLatest"))
            get("bookLatest").checked =
                book.latest === true;


        /* BUTTON */

        const saveBtn =
            get("saveBookBtn") ||
            get("addBookBtn");


        if (saveBtn) {

            saveBtn.innerText =
                "💾 Update Book";

        }


        const cancelBtn =
            get("cancelEditBtn");


        if (cancelBtn) {

            cancelBtn.style.display =
                "inline-block";

        }


        /* SCROLL */

        const form =
            get("bookForm");


        if (form) {

            form.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }


        console.log(
            "✏️ Editing:",
            book.title
        );

    }

    catch (error) {

        console.error(
            "❌ Edit Book Error:",
            error
        );

    }

}


/*=========================================================
 DELETE BOOK
=========================================================*/

async function deleteBook(bookId) {

    if (!window.currentFirebaseUser) {

        alert(
            "Please login first."
        );

        return;

    }


    const confirmDelete =
        confirm(
            "⚠️ Are you sure you want to delete this book?"
        );


    if (!confirmDelete) return;


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
            "Delete failed:\n" +
            error.message
        );

    }

}


/*=========================================================
 SET LATEST BOOK
=========================================================*/

async function setLatestBook(bookId) {

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
            "❌ Latest Book Error:",
            error
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


    snapshot.forEach(function (doc) {

        if (doc.id !== currentBookId) {

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


/*=========================================================
 RESET FORM
=========================================================*/

function resetBookForm() {

    editingBookId =
        null;


    const form =
        get("bookForm");


    if (form) {

        form.reset();

    }


    const saveBtn =
        get("saveBookBtn") ||
        get("addBookBtn");


    if (saveBtn) {

        saveBtn.innerText =
            "➕ Add Book";

    }


    const cancelBtn =
        get("cancelEditBtn");


    if (cancelBtn) {

        cancelBtn.style.display =
            "none";

    }

}


/*=========================================================
 SEARCH BOOKS
=========================================================*/

function searchAdminBooks() {

    const input =
        get("adminSearch") ||
        get("searchInput");


    if (!input) return;


    const query =
        input.value
            .toLowerCase()
            .trim();


    const filtered =
        adminBooks.filter(function (book) {

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
        category === "ALL" ||
        category === "All"
    ) {

        displayAdminBooks(
            adminBooks
        );

        return;

    }


    const filtered =
        adminBooks.filter(function (book) {

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

    try {

        const snapshot =
            await db
                .collection("books")
                .get();


        let views = 0;
        let likes = 0;
        let shares = 0;
        let downloads = 0;
        let latest = 0;


        snapshot.forEach(function (doc) {

            const book =
                doc.data();


            views +=
                Number(book.views || 0);


            likes +=
                Number(book.likes || 0);


            shares +=
                Number(book.shares || 0);


            downloads +=
                Number(book.downloads || 0);


            if (
                book.latest === true
            ) {

                latest++;

            }

        });


        /* BOOKS */

        setText(
            "totalBooks",
            snapshot.size
        );


        /* VIEWS */

        setText(
            "totalViews",
            views
        );


        /* LIKES */

        setText(
            "totalLikes",
            likes
        );


        /* SHARES */

        setText(
            "totalShares",
            shares
        );


        /* DOWNLOADS */

        setText(
            "totalDownloads",
            downloads
        );


        /* LATEST */

        setText(
            "latestBooks",
            latest
        );


        /* VISITORS */

        try {

            const statistics =
                await db
                    .collection("statistics")
                    .doc("main")
                    .get();


            const visitorCount =
                statistics.exists
                    ? Number(
                        statistics.data()
                            .visitors || 0
                    )
                    : 0;


            setText(
                "totalVisitors",
                visitorCount
            );

        }

        catch (visitorError) {

            console.error(
                "Visitor statistics error:",
                visitorError
            );

        }


        console.log(
            "📊 Statistics updated"
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
 UPDATE BOOK STATISTICS
=========================================================*/

function updateBookStatistics() {

    setText(
        "totalBooks",
        adminBooks.length
    );

}


/*=========================================================
 SET TEXT
=========================================================*/

function setText(
    id,
    value
) {

    const element =
        get(id);


    if (element) {

        element.innerText =
            Number(value || 0)
                .toLocaleString();

    }

}


/*=========================================================
 FORM SUBMIT
=========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    function () {


        const form =
            get("bookForm");


        if (form) {

            form.addEventListener(
                "submit",
                function (e) {

                    e.preventDefault();

                    saveBook();

                }
            );

        }


        /* SEARCH */

        const search =
            get("adminSearch") ||
            get("searchInput");


        if (search) {

            search.addEventListener(
                "input",
                searchAdminBooks
            );

        }


        /* CANCEL */

        const cancel =
            get("cancelEditBtn");


        if (cancel) {

            cancel.addEventListener(
                "click",
                resetBookForm
            );

        }


        /* LOGIN FORM */

        const loginForm =
            get("loginForm");


        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                function (e) {

                    e.preventDefault();

                    adminLoginForm();

                }
            );

        }


        /* LOGOUT BUTTON */

        const logoutBtn =
            get("logoutBtn");


        if (logoutBtn) {

            logoutBtn.addEventListener(
                "click",
                adminLogout
            );

        }

    }
);


/*=========================================================
 GLOBAL FUNCTIONS
=========================================================*/

window.adminLoginForm =
    adminLoginForm;

window.adminLogout =
    adminLogout;

window.loadAdminBooks =
    loadAdminBooks;

window.saveBook =
    saveBook;

window.editBook =
    editBook;

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
    "✅ Admin Login"
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
    "✅ Change Book Name"
);

console.log(
    "✅ Delete Book"
);

console.log(
    "✅ Cover Upload"
);

console.log(
    "✅ PDF Upload"
);

console.log(
    "✅ Categories"
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
    "🚀 Admin Panel Ready"
);

console.log(
    "===================================="
);
