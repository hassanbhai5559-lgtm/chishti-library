"use strict";

/*
=========================================================
CHISHTI LIBRARY
ADMIN.JS
FULL ADMIN PANEL
=========================================================

FEATURES

✅ Firebase Login
✅ Admin Redirect
✅ Auth Protection
✅ Logout
✅ Add Book
✅ Edit Book
✅ Delete Book
✅ Book List
✅ Search Books
✅ Category Filter
✅ Latest Book
✅ Upload Cover
✅ Upload PDF
✅ Visitor Statistics
✅ Book Statistics
=========================================================
*/


/*=========================================================
 FIREBASE READY CHECK
=========================================================*/

function firebaseReady() {

    if (
        typeof firebase === "undefined" ||
        !firebase.apps ||
        !firebase.apps.length
    ) {

        console.error("❌ Firebase is not loaded.");

        return false;
    }

    return true;
}


/*=========================================================
 ELEMENT HELPER
=========================================================*/

function byId(id) {

    return document.getElementById(id);

}


/*=========================================================
 LOGIN
=========================================================*/

async function adminLogin() {

    const emailInput =
        byId("adminEmail") ||
        byId("email") ||
        byId("loginEmail");

    const passwordInput =
        byId("adminPassword") ||
        byId("password") ||
        byId("loginPassword");

    if (!emailInput || !passwordInput) {

        console.error(
            "❌ Login fields not found."
        );

        return;
    }

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;


    if (!email || !password) {

        alert(
            "Please enter email and password."
        );

        return;
    }


    if (!firebaseReady()) {

        alert(
            "Firebase is not loaded."
        );

        return;
    }


    try {

        const result =
            await firebase
                .auth()
                .signInWithEmailAndPassword(
                    email,
                    password
                );


        console.log(
            "✅ Login successful!",
            result.user.email
        );


        /*
        =====================================================
        EXACT ADMIN URL
        =====================================================
        */

        window.location.href =
            "https://hassanbhai5559-lgtm.github.io/chishti-library/admin.html";


    }

    catch (error) {

        console.error(
            "❌ Login Error:",
            error
        );


        let message =
            error.message ||
            "Login failed.";


        alert(
            "Login failed: " + message
        );

    }

}


/*=========================================================
 LOGIN BUTTON
=========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const loginBtn =
            byId("loginBtn") ||
            byId("adminLoginBtn") ||
            document.querySelector(
                ".login-btn"
            );


        if (loginBtn) {

            loginBtn.addEventListener(
                "click",
                function (e) {

                    e.preventDefault();

                    adminLogin();

                }
            );

        }


        const loginForm =
            byId("loginForm");


        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                function (e) {

                    e.preventDefault();

                    adminLogin();

                }
            );

        }

    }
);


/*=========================================================
 ENTER KEY LOGIN
=========================================================*/

document.addEventListener(
    "keydown",
    function (e) {

        if (
            e.key === "Enter" &&
            (
                byId("adminEmail") ||
                byId("email")
            )
        ) {

            const active =
                document.activeElement;


            if (
                active &&
                (
                    active.id === "adminEmail" ||
                    active.id === "adminPassword" ||
                    active.id === "email" ||
                    active.id === "password"
                )
            ) {

                e.preventDefault();

                adminLogin();

            }

        }

    }
);


/*=========================================================
 AUTH STATE
=========================================================*/

function protectAdminPage() {

    if (!firebaseReady()) return;


    firebase
        .auth()
        .onAuthStateChanged(
            function (user) {

                const currentPage =
                    window.location.pathname
                        .split("/")
                        .pop()
                        .toLowerCase();


                /*
                =============================================
                ADMIN PAGE PROTECTION
                =============================================
                */

                if (
                    currentPage === "admin.html"
                ) {

                    if (!user) {

                        console.warn(
                            "⚠️ No admin logged in."
                        );


                        window.location.href =
                            "https://hassanbhai5559-lgtm.github.io/chishti-library/login.html";

                        return;

                    }


                    console.log(
                        "✅ Admin authenticated:",
                        user.email
                    );


                    const emailElement =
                        byId("adminEmailDisplay") ||
                        byId("userEmail") ||
                        byId("adminUser");


                    if (emailElement) {

                        emailElement.innerText =
                            user.email || "";

                    }

                }

            }
        );

}


/*=========================================================
 LOGOUT
=========================================================*/

async function adminLogout() {

    if (!firebaseReady()) return;


    try {

        await firebase
            .auth()
            .signOut();


        console.log(
            "✅ Admin logged out"
        );


        window.location.href =
            "https://hassanbhai5559-lgtm.github.io/chishti-library/login.html";


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
 LOGOUT BUTTON
=========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const logoutBtn =
            byId("logoutBtn") ||
            byId("adminLogoutBtn") ||
            document.querySelector(
                ".logout-btn"
            );


        if (logoutBtn) {

            logoutBtn.addEventListener(
                "click",
                function (e) {

                    e.preventDefault();

                    adminLogout();

                }
            );

        }

    }
);


/*=========================================================
 LOAD BOOKS
=========================================================*/

async function loadAdminBooks() {

    if (!firebaseReady()) return;


    const container =
        byId("adminBooks") ||
        byId("booksList") ||
        byId("adminBooksContainer");


    if (!container) {

        console.log(
            "ℹ️ Admin book container not found."
        );

        return;

    }


    try {

        const snapshot =
            await firebase
                .firestore()
                .collection("books")
                .orderBy(
                    "createdAt",
                    "desc"
                )
                .get();


        container.innerHTML = "";


        if (snapshot.empty) {

            container.innerHTML = `
                <div class="no-books">
                    No books found.
                </div>
            `;

            return;

        }


        snapshot.forEach(
            function (doc) {

                const book =
                    doc.data();


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "admin-book-card";


                card.innerHTML = `

                    <img
                        src="${book.coverUrl || book.cover || "logo.png"}"
                        alt="${book.title || "Book"}"
                    >

                    <div class="admin-book-info">

                        <h3>
                            ${book.title || "Untitled"}
                        </h3>

                        <p>
                            ${book.author || "Unknown Author"}
                        </p>

                        <span>
                            ${book.category || "Other"}
                        </span>

                        <div class="admin-book-stats">

                            👁 ${book.views || 0}

                            ❤️ ${book.likes || 0}

                            🔗 ${book.shares || 0}

                            ⬇ ${book.downloads || 0}

                        </div>

                        <div class="admin-book-actions">

                            <button
                                class="edit-book-btn"
                                data-id="${doc.id}">
                                ✏️ Edit
                            </button>

                            <button
                                class="delete-book-btn"
                                data-id="${doc.id}">
                                🗑️ Delete
                            </button>

                        </div>

                    </div>

                `;


                container.appendChild(card);

            }
        );


        attachBookActions();


        console.log(
            "✅ Admin books loaded:",
            snapshot.size
        );

    }

    catch (error) {

        console.error(
            "❌ Load books error:",
            error
        );

    }

}


/*=========================================================
 ADD BOOK
=========================================================*/

async function addAdminBook() {

    if (!firebaseReady()) return;


    const title =
        byId("bookTitle")?.value.trim() || "";

    const author =
        byId("bookAuthor")?.value.trim() || "";

    const category =
        byId("bookCategory")?.value || "Other";

    const description =
        byId("bookDescription")?.value.trim() || "";


    const coverInput =
        byId("bookCover");

    const pdfInput =
        byId("bookPDF");


    if (!title) {

        alert(
            "Please enter book title."
        );

        return;

    }


    if (!author) {

        alert(
            "Please enter author."
        );

        return;

    }


    if (
        !pdfInput ||
        !pdfInput.files ||
        !pdfInput.files[0]
    ) {

        alert(
            "Please select a PDF."
        );

        return;

    }


    try {

        const db =
            firebase.firestore();

        const storage =
            firebase.storage();


        const bookRef =
            db.collection("books").doc();


        const bookId =
            bookRef.id;


        /*
        =============================================
        UPLOAD COVER
        =============================================
        */

        let coverUrl = "";
        let coverPath = "";


        if (
            coverInput &&
            coverInput.files &&
            coverInput.files[0]
        ) {

            const coverFile =
                coverInput.files[0];


            const coverRef =
                storage
                    .ref()
                    .child(
                        `books/${bookId}/cover/${Date.now()}-${coverFile.name}`
                    );


            await coverRef.put(
                coverFile
            );


            coverUrl =
                await coverRef.getDownloadURL();


            coverPath =
                coverRef.fullPath;

        }


        /*
        =============================================
        UPLOAD PDF
        =============================================
        */

        const pdfFile =
            pdfInput.files[0];


        if (
            pdfFile.type !==
            "application/pdf"
        ) {

            alert(
                "Only PDF files are allowed."
            );

            return;

        }


        const pdfRef =
            storage
                .ref()
                .child(
                    `books/${bookId}/pdf/${Date.now()}-${pdfFile.name}`
                );


        await pdfRef.put(
            pdfFile
        );


        const pdfUrl =
            await pdfRef.getDownloadURL();


        const pdfPath =
            pdfRef.fullPath;


        /*
        =============================================
        SAVE BOOK
        =============================================
        */

        await bookRef.set({

            title:
                title,

            author:
                author,

            category:
                category,

            description:
                description,

            coverUrl:
                coverUrl,

            coverPath:
                coverPath,

            pdfUrl:
                pdfUrl,

            pdfPath:
                pdfPath,

            latest:
                byId("bookLatest")?.checked ||
                false,

            views:
                0,

            likes:
                0,

            shares:
                0,

            downloads:
                0,

            comments:
                0,

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        alert(
            "✅ Book added successfully!"
        );


        clearBookForm();

        loadAdminBooks();


    }

    catch (error) {

        console.error(
            "❌ Add book error:",
            error
        );


        alert(
            "Book upload failed: " +
            error.message
        );

    }

}


/*=========================================================
 CLEAR BOOK FORM
=========================================================*/

function clearBookForm() {

    const fields = [

        "bookTitle",
        "bookAuthor",
        "bookDescription"

    ];


    fields.forEach(
        function (id) {

            const element =
                byId(id);


            if (element) {

                element.value = "";

            }

        }
    );


    const category =
        byId("bookCategory");


    if (category) {

        category.value =
            "Quran";

    }


    const latest =
        byId("bookLatest");


    if (latest) {

        latest.checked =
            false;

    }


    const cover =
        byId("bookCover");


    const pdf =
        byId("bookPDF");


    if (cover) cover.value = "";

    if (pdf) pdf.value = "";

}


/*=========================================================
 DELETE BOOK
=========================================================*/

async function deleteAdminBook(bookId) {

    if (!bookId) return;


    const confirmDelete =
        confirm(
            "Are you sure you want to delete this book?"
        );


    if (!confirmDelete) return;


    try {

        await firebase
            .firestore()
            .collection("books")
            .doc(bookId)
            .delete();


        alert(
            "🗑️ Book deleted successfully!"
        );


        loadAdminBooks();

    }

    catch (error) {

        console.error(
            "❌ Delete error:",
            error
        );


        alert(
            "Delete failed: " +
            error.message
        );

    }

}


/*=========================================================
 EDIT BOOK
=========================================================*/

async function editAdminBook(bookId) {

    if (!bookId) return;


    try {

        const doc =
            await firebase
                .firestore()
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


        const title =
            byId("bookTitle");


        const author =
            byId("bookAuthor");


        const category =
            byId("bookCategory");


        const description =
            byId("bookDescription");


        if (title)
            title.value =
                book.title || "";


        if (author)
            author.value =
                book.author || "";


        if (category)
            category.value =
                book.category || "Other";


        if (description)
            description.value =
                book.description || "";


        /*
        Store editing ID
        */

        const form =
            byId("bookForm");


        if (form) {

            form.dataset.editingId =
                bookId;

        }


        const submitBtn =
            byId("addBookBtn") ||
            byId("saveBookBtn");


        if (submitBtn) {

            submitBtn.innerText =
                "💾 Update Book";

        }


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });


    }

    catch (error) {

        console.error(
            "❌ Edit error:",
            error
        );

    }

}


/*=========================================================
 UPDATE BOOK
=========================================================*/

async function updateAdminBook(
    bookId
) {

    if (!bookId) return;


    const title =
        byId("bookTitle")?.value.trim() || "";

    const author =
        byId("bookAuthor")?.value.trim() || "";

    const category =
        byId("bookCategory")?.value || "Other";

    const description =
        byId("bookDescription")?.value.trim() || "";


    if (!title) {

        alert(
            "Book title is required."
        );

        return;

    }


    try {

        await firebase
            .firestore()
            .collection("books")
            .doc(bookId)
            .update({

                title:
                    title,

                author:
                    author,

                category:
                    category,

                description:
                    description,

                latest:
                    byId("bookLatest")?.checked ||
                    false,

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            });


        alert(
            "✅ Book updated successfully!"
        );


        clearBookForm();


        const form =
            byId("bookForm");


        if (form) {

            delete form.dataset.editingId;

        }


        const submitBtn =
            byId("addBookBtn") ||
            byId("saveBookBtn");


        if (submitBtn) {

            submitBtn.innerText =
                "➕ Add Book";

        }


        loadAdminBooks();

    }

    catch (error) {

        console.error(
            "❌ Update error:",
            error
        );


        alert(
            "Update failed: " +
            error.message
        );

    }

}


/*=========================================================
 BOOK ACTIONS
=========================================================*/

function attachBookActions() {

    document
        .querySelectorAll(
            ".delete-book-btn"
        )
        .forEach(
            function (button) {

                button.onclick =
                    function () {

                        deleteAdminBook(
                            button.dataset.id
                        );

                    };

            }
        );


    document
        .querySelectorAll(
            ".edit-book-btn"
        )
        .forEach(
            function (button) {

                button.onclick =
                    function () {

                        editAdminBook(
                            button.dataset.id
                        );

                    };

            }
        );

}


/*=========================================================
 BOOK FORM SUBMIT
=========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const form =
            byId("bookForm");


        if (!form) return;


        form.addEventListener(
            "submit",
            async function (e) {

                e.preventDefault();


                const editingId =
                    form.dataset.editingId;


                if (editingId) {

                    await updateAdminBook(
                        editingId
                    );

                }

                else {

                    await addAdminBook();

                }

            }
        );

    }
);


/*=========================================================
 SEARCH BOOKS
=========================================================*/

function searchAdminBooks() {

    const input =
        byId("adminSearch") ||
        byId("searchBooks");


    if (!input) return;


    const value =
        input.value
            .toLowerCase()
            .trim();


    document
        .querySelectorAll(
            ".admin-book-card"
        )
        .forEach(
            function (card) {

                const text =
                    card.innerText
                        .toLowerCase();


                card.style.display =
                    text.includes(value)
                        ? ""
                        : "none";

            }
        );

}


/*=========================================================
 CATEGORY FILTER
=========================================================*/

function filterAdminCategory(
    category
) {

    document
        .querySelectorAll(
            ".admin-book-card"
        )
        .forEach(
            function (card) {

                if (
                    category === "All"
                ) {

                    card.style.display =
                        "";

                    return;

                }


                const text =
                    card.innerText
                        .toLowerCase();


                card.style.display =
                    text.includes(
                        category.toLowerCase()
                    )
                        ? ""
                        : "none";

            }
        );

}


/*=========================================================
 STATISTICS
=========================================================*/

async function loadAdminStatistics() {

    if (!firebaseReady()) return;


    try {

        const db =
            firebase.firestore();


        /*
        =============================================
        VISITORS
        =============================================
        */

        const statsDoc =
            await db
                .collection("statistics")
                .doc("main")
                .get();


        const stats =
            statsDoc.exists
                ? statsDoc.data()
                : {};


        const visitorValue =
            Number(
                stats.visitors || 0
            );


        const visitorElement =
            byId("visitorCounter") ||
            byId("totalVisitors");


        if (visitorElement) {

            visitorElement.innerText =
                visitorValue;

        }


        /*
        =============================================
        BOOK STATISTICS
        =============================================
        */

        const snapshot =
            await db
                .collection("books")
                .get();


        let views = 0;
        let likes = 0;
        let shares = 0;
        let downloads = 0;


        snapshot.forEach(
            function (doc) {

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

            }
        );


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


        console.log(
            "✅ Statistics loaded"
        );

    }

    catch (error) {

        console.error(
            "❌ Statistics error:",
            error
        );

    }

}


/*=========================================================
 SET TEXT
=========================================================*/

function setText(
    id,
    value
) {

    const element =
        byId(id);


    if (element) {

        element.innerText =
            value;

    }

}


/*=========================================================
 LATEST BOOK
=========================================================*/

async function setLatestBook(
    bookId
) {

    if (!bookId) return;


    try {

        /*
        Remove latest from all books
        */

        const snapshot =
            await firebase
                .firestore()
                .collection("books")
                .where(
                    "latest",
                    "==",
                    true
                )
                .get();


        const batch =
            firebase
                .firestore()
                .batch();


        snapshot.forEach(
            function (doc) {

                batch.update(
                    doc.ref,
                    {
                        latest: false
                    }
                );

            }
        );


        const selected =
            firebase
                .firestore()
                .collection("books")
                .doc(bookId);


        batch.update(
            selected,
            {
                latest: true
            }
        );


        await batch.commit();


        console.log(
            "⭐ Latest book updated"
        );


        loadAdminBooks();

    }

    catch (error) {

        console.error(
            "❌ Latest book error:",
            error
        );

    }

}


/*=========================================================
 INITIALIZE ADMIN
=========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        protectAdminPage();

        loadAdminBooks();

        loadAdminStatistics();


        /*
        =============================================
        SEARCH LISTENER
        =============================================
        */

        const search =
            byId("adminSearch") ||
            byId("searchBooks");


        if (search) {

            search.addEventListener(
                "input",
                searchAdminBooks
            );

        }


        /*
        =============================================
        ADD BOOK BUTTON
        =============================================
        */

        const addButton =
            byId("addBookBtn");


        if (
            addButton &&
            addButton.tagName !== "SUBMIT"
        ) {

            addButton.addEventListener(
                "click",
                function () {

                    const form =
                        byId("bookForm");


                    if (form) {

                        form.requestSubmit();

                    }

                    else {

                        addAdminBook();

                    }

                }
            );

        }

    }
);


/*=========================================================
 GLOBAL FUNCTIONS
=========================================================*/

window.adminLogin =
    adminLogin;

window.adminLogout =
    adminLogout;

window.loadAdminBooks =
    loadAdminBooks;

window.addAdminBook =
    addAdminBook;

window.editAdminBook =
    editAdminBook;

window.updateAdminBook =
    updateAdminBook;

window.deleteAdminBook =
    deleteAdminBook;

window.searchAdminBooks =
    searchAdminBooks;

window.filterAdminCategory =
    filterAdminCategory;

window.loadAdminStatistics =
    loadAdminStatistics;

window.setLatestBook =
    setLatestBook;


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
    "✅ Login System"
);

console.log(
    "✅ Redirect System"
);

console.log(
    "✅ Authentication Protection"
);

console.log(
    "✅ Logout"
);

console.log(
    "✅ Book Upload"
);

console.log(
    "✅ Book Edit"
);

console.log(
    "✅ Book Delete"
);

console.log(
    "✅ Book Search"
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
    "🚀 Admin Panel Ready"
);

console.log(
    "===================================="
);
