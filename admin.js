/* =========================================================
   CHISHTI LIBRARY
   PREMIUM ADMIN PANEL
   FIREBASE FIRESTORE + STORAGE + AUTH

   FEATURES
   ---------------------------------------------------------
   ✅ Firebase Login
   ✅ Auth Persistence
   ✅ Dashboard
   ✅ Add Book
   ✅ Edit Book
   ✅ Update Book
   ✅ Delete Book
   ✅ Cover Upload
   ✅ PDF Upload
   ✅ Latest Book
   ✅ Categories
   ✅ Search
   ✅ Comments
   ✅ Visitor Counter
   ✅ Views
   ✅ Likes
   ✅ Shares
   ✅ Downloads
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       SHORTCUTS
    ===================================================== */

    const $ = id =>
        document.getElementById(id);


    /* =====================================================
       FIREBASE
    ===================================================== */

    const auth =
        window.auth ||
        firebase.auth();

    const db =
        window.db ||
        firebase.firestore();

    const storage =
        window.storage ||
        firebase.storage();


    /* =====================================================
       STATE
    ===================================================== */

    let adminBooks = [];

    let adminComments = [];

    let editingBookId = "";


    /* =====================================================
       ADMIN EMAIL
       Optional client-side protection.
    ===================================================== */

    const ADMIN_EMAILS = [
        /*
         * Put your admin email here.
         *
         * Example:
         *
         * "youradmin@gmail.com"
         */

        "YOUR_ADMIN_EMAIL@gmail.com"
    ];


    /* =====================================================
       TOAST
    ===================================================== */

    function toast(
        message,
        type = "success"
    ) {

        let box =
            document.getElementById(
                "adminToast"
            );


        if (!box) {

            box =
                document.createElement(
                    "div"
                );

            box.id =
                "adminToast";

            document.body.appendChild(
                box
            );

        }


        box.className =
            "admin-toast " +
            type;


        box.textContent =
            message;


        requestAnimationFrame(() => {

            box.classList.add(
                "show"
            );

        });


        setTimeout(() => {

            box.classList.remove(
                "show"
            );

        }, 3000);

    }


    /* =====================================================
       MESSAGE
    ===================================================== */

    function showMessage(
        message,
        type = "success"
    ) {

        const box =
            $("bookMessage");


        if (!box) return;


        box.textContent =
            message;


        box.className =
            "book-message " +
            type;

    }


    /* =====================================================
       FORMAT NUMBER
    ===================================================== */

    function number(value) {

        return Number(value) || 0;

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function esc(value) {

        return String(
            value ?? ""
        )

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            )

            .replace(
                /"/g,
                "&quot;"
            )

            .replace(
                /'/g,
                "&#039;"
            );

    }


    /* =====================================================
       AUTH STATE
    ===================================================== */

    auth.onAuthStateChanged(
        async user => {

            const loginScreen =
                $("loginScreen");

            const adminApp =
                $("adminApp");


            if (!user) {

                if (loginScreen) {

                    loginScreen.classList.remove(
                        "hidden"
                    );

                }

                if (adminApp) {

                    adminApp.classList.add(
                        "hidden"
                    );

                }

                return;

            }


            /*
             * Optional email protection.
             */

            const configuredEmails =
                ADMIN_EMAILS.filter(
                    email =>
                        email &&
                        !email.includes(
                            "YOUR_ADMIN"
                        )
                );


            if (
                configuredEmails.length &&
                !configuredEmails.includes(
                    user.email
                )
            ) {

                console.warn(
                    "Unauthorized admin:",
                    user.email
                );


                await auth.signOut();


                toast(
                    "This account is not authorized.",
                    "error"
                );


                return;

            }


            if (loginScreen) {

                loginScreen.classList.add(
                    "hidden"
                );

            }


            if (adminApp) {

                adminApp.classList.remove(
                    "hidden"
                );

            }


            const emailElement =
                $("adminEmail");


            if (emailElement) {

                emailElement.textContent =
                    user.email ||
                    "Admin";

            }


            await loadEverything();

        }
    );


    /* =====================================================
       LOGIN
    ===================================================== */

    const loginForm =
        $("loginForm");


    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const email =
                    $("loginEmail")
                        ?.value
                        .trim();


                const password =
                    $("loginPassword")
                        ?.value;


                const errorBox =
                    $("loginError");


                if (errorBox) {

                    errorBox.textContent =
                        "";

                }


                if (!email || !password) {

                    if (errorBox) {

                        errorBox.textContent =
                            "Email and password are required.";

                    }

                    return;

                }


                const button =
                    loginForm.querySelector(
                        "button[type='submit']"
                    );


                const oldText =
                    button
                        ? button.innerHTML
                        : "";


                try {

                    if (button) {

                        button.disabled =
                            true;

                        button.innerHTML =
                            "⏳ Logging in...";

                    }


                    await auth.signInWithEmailAndPassword(
                        email,
                        password
                    );


                    toast(
                        "Login successful!"
                    );


                } catch (error) {

                    console.error(
                        "Login error:",
                        error
                    );


                    let message =
                        "Login failed.";


                    switch (
                        error.code
                    ) {

                        case "auth/invalid-credential":

                            message =
                                "Incorrect email or password.";

                            break;


                        case "auth/user-not-found":

                            message =
                                "Admin account not found.";

                            break;


                        case "auth/wrong-password":

                            message =
                                "Incorrect password.";

                            break;


                        case "auth/too-many-requests":

                            message =
                                "Too many attempts. Try again later.";

                            break;


                        case "auth/network-request-failed":

                            message =
                                "Network error. Check your internet.";

                            break;


                        default:

                            message =
                                error.message ||
                                "Login failed.";

                    }


                    if (errorBox) {

                        errorBox.textContent =
                            message;

                    }


                } finally {

                    if (button) {

                        button.disabled =
                            false;

                        button.innerHTML =
                            oldText ||
                            "🔐 Login";

                    }

                }

            }
        );

    }


    /* =====================================================
       LOGOUT
    ===================================================== */

    const logoutBtn =
        $("logoutBtn");


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            async () => {

                try {

                    await auth.signOut();

                    toast(
                        "Logged out."
                    );

                } catch (error) {

                    console.error(
                        error
                    );

                }

            }
        );

    }


    /* =====================================================
       SECTION NAVIGATION
    ===================================================== */

    function openSection(
        sectionId
    ) {

        document
            .querySelectorAll(
                ".admin-section"
            )
            .forEach(section => {

                section.classList.remove(
                    "active-section"
                );

            });


        document
            .querySelectorAll(
                ".nav-btn"
            )
            .forEach(button => {

                button.classList.remove(
                    "active"
                );

            });


        const section =
            $(sectionId);


        if (section) {

            section.classList.add(
                "active-section"
            );

        }


        const button =
            document.querySelector(
                `.nav-btn[data-section="${sectionId}"]`
            );


        if (button) {

            button.classList.add(
                "active"
            );

        }


        const titles = {

            dashboard:
                "Dashboard",

            books:
                "Books",

            addBook:
                editingBookId
                    ? "Edit Book"
                    : "Add Book",

            comments:
                "Comments"

        };


        const title =
            $("pageTitle");


        if (title) {

            title.textContent =
                titles[sectionId] ||
                "Admin Panel";

        }


        const sidebar =
            document.querySelector(
                ".sidebar"
            );


        if (sidebar) {

            sidebar.classList.remove(
                "mobile-open"
            );

        }

    }


    document
        .querySelectorAll(
            ".nav-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openSection(
                        button.dataset.section
                    );

                }
            );

        });


    const goAddBook =
        $("goAddBook");


    if (goAddBook) {

        goAddBook.addEventListener(
            "click",
            () => {

                resetForm();

                openSection(
                    "addBook"
                );

            }
        );

    }


    const mobileMenu =
        $("mobileMenu");


    if (mobileMenu) {

        mobileMenu.addEventListener(
            "click",
            () => {

                const sidebar =
                    document.querySelector(
                        ".sidebar"
                    );


                if (sidebar) {

                    sidebar.classList.toggle(
                        "mobile-open"
                    );

                }

            }
        );

    }


    /* =====================================================
       LOAD EVERYTHING
    ===================================================== */

    async function loadEverything() {

        await Promise.all([
            loadBooks(),
            loadComments(),
            loadVisitors()
        ]);

        updateDashboard();

    }


    /* =====================================================
       LOAD BOOKS
    ===================================================== */

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


            adminBooks =
                snapshot.docs.map(
                    doc => ({

                        id:
                            doc.id,

                        ...doc.data()

                    })
                );


            renderBooks();

            updateDashboard();


            console.log(
                "✅ Firebase books:",
                adminBooks.length
            );


        } catch (error) {

            console.error(
                "Books load error:",
                error
            );


            /*
             * Fallback if createdAt is missing.
             */

            try {

                const snapshot =
                    await db
                        .collection("books")
                        .get();


                adminBooks =
                    snapshot.docs.map(
                        doc => ({

                            id:
                                doc.id,

                            ...doc.data()

                        })
                    );


                renderBooks();

                updateDashboard();

            } catch (secondError) {

                console.error(
                    secondError
                );

                toast(
                    "Books could not be loaded.",
                    "error"
                );

            }

        }

    }


    /* =====================================================
       RENDER BOOK TABLE
    ===================================================== */

    function renderBooks() {

        const table =
            $("booksTable");


        if (!table) return;


        table.innerHTML =
            "";


        if (!adminBooks.length) {

            table.innerHTML = `

                <tr>

                    <td
                        colspan="8"
                        style="text-align:center;padding:40px"
                    >
                        📚 No books found.
                    </td>

                </tr>

            `;

            return;

        }


        adminBooks.forEach(
            book => {

                const tr =
                    document.createElement(
                        "tr"
                    );


                tr.innerHTML = `

                    <td>

                        <img
                            src="${esc(
                                book.cover ||
                                "logo.png"
                            )}"
                            alt=""
                            class="admin-cover"
                            onerror="this.src='logo.png'"
                        >

                    </td>


                    <td>

                        <strong>
                            ${esc(
                                book.title ||
                                "Untitled"
                            )}
                        </strong>

                    </td>


                    <td>
                        ${esc(
                            book.author ||
                            "Unknown"
                        )}
                    </td>


                    <td>
                        ${esc(
                            book.category ||
                            "Other"
                        )}
                    </td>


                    <td>
                        ${number(
                            book.views
                        )}
                    </td>


                    <td>
                        ${number(
                            book.downloads
                        )}
                    </td>


                    <td>

                        ${
                            book.latest
                                ? `<span class="latest-badge">⭐ Latest</span>`
                                : "—"
                        }

                    </td>


                    <td>

                        <div class="table-actions">

                            <button
                                type="button"
                                class="edit-btn"
                                data-edit="${esc(book.id)}"
                            >
                                ✏️ Edit
                            </button>


                            <button
                                type="button"
                                class="delete-btn"
                                data-delete="${esc(book.id)}"
                            >
                                🗑️ Delete
                            </button>

                        </div>

                    </td>

                `;


                table.appendChild(
                    tr
                );

            }
        );


        table
            .querySelectorAll(
                "[data-edit]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        editBook(
                            button.dataset.edit
                        );

                    }
                );

            });


        table
            .querySelectorAll(
                "[data-delete]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteBook(
                            button.dataset.delete
                        );

                    }
                );

            });

    }


    /* =====================================================
       EDIT BOOK
    ===================================================== */

    function editBook(
        id
    ) {

        const book =
            adminBooks.find(
                item =>
                    item.id === id
            );


        if (!book) {

            toast(
                "Book not found.",
                "error"
            );

            return;

        }


        editingBookId =
            id;


        $("editingBookId").value =
            id;


        $("bookTitle").value =
            book.title ||
            "";


        $("bookAuthor").value =
            book.author ||
            "";


        $("bookCategory").value =
            book.category ||
            "Other";


        $("bookLanguage").value =
            book.language ||
            "Urdu";


        $("bookDescription").value =
            book.description ||
            "";


        $("bookLatest").checked =
            book.latest === true;


        const title =
            $("bookFormTitle");


        if (title) {

            title.textContent =
                "Edit Book";

        }


        const button =
            $("saveBookBtn");


        if (button) {

            button.innerHTML =
                "💾 Update Book";

        }


        const coverStatus =
            $("coverStatus");


        if (coverStatus) {

            coverStatus.innerHTML =
                book.cover
                    ? "🖼️ Existing cover will be kept"
                    : "No cover selected";

        }


        const pdfStatus =
            $("pdfStatus");


        if (pdfStatus) {

            pdfStatus.innerHTML =
                book.pdf
                    ? "📄 Existing PDF will be kept"
                    : "No PDF selected";

        }


        showMessage(
            "",
            ""
        );


        openSection(
            "addBook"
        );

    }


    /* =====================================================
       UPLOAD FILE
    ===================================================== */

    async function uploadFile(
        file,
        folder,
        bookId
    ) {

        if (!file) {

            return null;

        }


        const maxSize =
            100 *
            1024 *
            1024;


        if (
            file.size >
            maxSize
        ) {

            throw new Error(
                "File is larger than 100 MB."
            );

        }


        const safeName =
            file.name
                .replace(
                    /[^a-zA-Z0-9._-]/g,
                    "_"
                );


        const unique =
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .slice(2);


        const path =
            `books/${bookId}/${folder}/${unique}-${safeName}`;


        const storageRef =
            storage.ref(
                path
            );


        await storageRef.put(
            file
        );


        const url =
            await storageRef.getDownloadURL();


        return {

            url,

            path

        };

    }


    /* =====================================================
       BOOK FORM
    ===================================================== */

    const bookForm =
        $("bookForm");


    if (bookForm) {

        bookForm.addEventListener(
            "submit",
            saveBook
        );

    }


    async function saveBook(
        event
    ) {

        event.preventDefault();


        const title =
            $("bookTitle")
                .value
                .trim();


        const author =
            $("bookAuthor")
                .value
                .trim();


        const category =
            $("bookCategory")
                .value;


        const language =
            $("bookLanguage")
                .value;


        const description =
            $("bookDescription")
                .value
                .trim();


        const latest =
            $("bookLatest")
                .checked;


        const coverFile =
            $("coverFile")
                ?.files[0] ||
            null;


        const pdfFile =
            $("pdfFile")
                ?.files[0] ||
            null;


        const id =
            $("editingBookId")
                .value
                .trim();


        const button =
            $("saveBookBtn");


        if (!title) {

            showMessage(
                "Please enter book title.",
                "error"
            );

            return;

        }


        if (!author) {

            showMessage(
                "Please enter author.",
                "error"
            );

            return;

        }


        if (!description) {

            showMessage(
                "Please enter description.",
                "error"
            );

            return;

        }


        let oldBook =
            null;


        if (id) {

            oldBook =
                adminBooks.find(
                    book =>
                        book.id === id
                );

        }


        try {

            if (button) {

                button.disabled =
                    true;

                button.innerHTML =
                    id
                        ? "⏳ Updating..."
                        : "⏳ Saving...";

            }


            showMessage(
                "Saving book...",
                "loading"
            );


            /*
             * Create document first
             * for new books.
             */

            let bookRef;


            if (id) {

                bookRef =
                    db
                        .collection("books")
                        .doc(id);

            } else {

                bookRef =
                    db
                        .collection("books")
                        .doc();

            }


            let cover =
                oldBook?.cover ||
                "";


            let pdf =
                oldBook?.pdf ||
                "";


            /*
             * Upload cover
             */

            if (coverFile) {

                showMessage(
                    "Uploading cover...",
                    "loading"
                );


                const uploaded =
                    await uploadFile(
                        coverFile,
                        "covers",
                        bookRef.id
                    );


                cover =
                    uploaded.url;

            }


            /*
             * Upload PDF
             */

            if (pdfFile) {

                showMessage(
                    "Uploading PDF...",
                    "loading"
                );


                const uploaded =
                    await uploadFile(
                        pdfFile,
                        "pdfs",
                        bookRef.id
                    );


                pdf =
                    uploaded.url;

            }


            /*
             * Latest handling
             */

            if (latest) {

                const latestBooks =
                    adminBooks.filter(
                        book =>
                            book.latest === true &&
                            book.id !== bookRef.id
                    );


                await Promise.all(

                    latestBooks.map(
                        book =>
                            db
                                .collection("books")
                                .doc(book.id)
                                .update({

                                    latest:
                                        false,

                                    updatedAt:
                                        firebase.firestore.FieldValue
                                            .serverTimestamp()

                                })
                    )

                );

            }


            /*
             * Preserve statistics.
             */

            const views =
                number(
                    oldBook?.views
                );


            const likes =
                number(
                    oldBook?.likes
                );


            const shares =
                number(
                    oldBook?.shares
                );


            const downloads =
                number(
                    oldBook?.downloads
                );


            const data = {

                title,

                author,

                category,

                language,

                description,

                cover,

                pdf,

                latest,

                views,

                likes,

                shares,

                downloads,

                updatedAt:
                    firebase.firestore.FieldValue
                        .serverTimestamp()

            };


            /*
             * CREATE
             */

            if (!id) {

                data.createdAt =
                    firebase.firestore.FieldValue
                        .serverTimestamp();


                await bookRef.set(
                    data
                );


                toast(
                    "✅ Book added successfully!"
                );


            }

            /*
             * UPDATE
             */

            else {

                await bookRef.update(
                    data
                );


                toast(
                    "✅ Book updated successfully!"
                );

            }


            /*
             * Reload Firebase.
             */

            resetForm();

            await loadBooks();

            updateDashboard();


            openSection(
                "books"
            );


        } catch (error) {

            console.error(
                "Save book error:",
                error
            );


            showMessage(
                "Error: " +
                (
                    error.message ||
                    "Could not save book."
                ),
                "error"
            );


            toast(
                "❌ Save failed.",
                "error"
            );


        } finally {

            if (button) {

                button.disabled =
                    false;

                button.innerHTML =
                    "💾 Save Book";

            }

        }

    }


    /* =====================================================
       DELETE BOOK
    ===================================================== */

    async function deleteBook(
        id
    ) {

        const book =
            adminBooks.find(
                item =>
                    item.id === id
            );


        if (!book) return;


        const confirmed =
            confirm(
                `Delete "${book.title || "this book"}"?\n\nThis cannot be undone.`
            );


        if (!confirmed) {

            return;

        }


        try {

            await db
                .collection("books")
                .doc(id)
                .delete();


            toast(
                "🗑️ Book deleted."
            );


            await loadBooks();

            updateDashboard();


        } catch (error) {

            console.error(
                "Delete error:",
                error
            );


            toast(
                "Delete failed: " +
                error.message,
                "error"
            );

        }

    }


    /* =====================================================
       RESET FORM
    ===================================================== */

    function resetForm() {

        editingBookId =
            "";


        const form =
            $("bookForm");


        if (form) {

            form.reset();

        }


        $("editingBookId").value =
            "";


        const title =
            $("bookFormTitle");


        if (title) {

            title.textContent =
                "Add New Book";

        }


        const button =
            $("saveBookBtn");


        if (button) {

            button.innerHTML =
                "💾 Save Book";

        }


        const coverStatus =
            $("coverStatus");


        if (coverStatus) {

            coverStatus.textContent =
                "No cover selected";

        }


        const pdfStatus =
            $("pdfStatus");


        if (pdfStatus) {

            pdfStatus.textContent =
                "No PDF selected";

        }


        showMessage(
            "",
            ""
        );

    }


    const cancelEdit =
        $("cancelEdit");


    if (cancelEdit) {

        cancelEdit.addEventListener(
            "click",
            () => {

                resetForm();

                openSection(
                    "books"
                );

            }
        );

    }


    /* =====================================================
       FILE STATUS
    ===================================================== */

    const coverFile =
        $("coverFile");


    if (coverFile) {

        coverFile.addEventListener(
            "change",
            function () {

                const file =
                    this.files[0];


                if (!file) {

                    $("coverStatus").textContent =
                        "No cover selected";

                    return;

                }


                $("coverStatus").textContent =
                    "📕 " +
                    file.name;

            }
        );

    }


    const pdfFile =
        $("pdfFile");


    if (pdfFile) {

        pdfFile.addEventListener(
            "change",
            function () {

                const file =
                    this.files[0];


                if (!file) {

                    $("pdfStatus").textContent =
                        "No PDF selected";

                    return;

                }


                $("pdfStatus").textContent =
                    "📄 " +
                    file.name;

            }
        );

    }


    /* =====================================================
       LOAD COMMENTS
    ===================================================== */

    async function loadComments() {

        const container =
            $("commentsContainer");


        if (!container) return;


        try {

            const snapshot =
                await db
                    .collection("comments")
                    .orderBy(
                        "createdAt",
                        "desc"
                    )
                    .get();


            adminComments =
                snapshot.docs.map(
                    doc => ({

                        id:
                            doc.id,

                        ...doc.data()

                    })
                );


            renderComments();


        } catch (error) {

            console.error(
                "Comments error:",
                error
            );


            /*
             * Fallback without orderBy.
             */

            try {

                const snapshot =
                    await db
                        .collection("comments")
                        .get();


                adminComments =
                    snapshot.docs.map(
                        doc => ({

                            id:
                                doc.id,

                            ...doc.data()

                        })
                    );


                renderComments();


            } catch (secondError) {

                console.error(
                    secondError
                );


                container.innerHTML = `

                    <p class="loading">
                        Unable to load comments.
                    </p>

                `;

            }

        }

    }


    /* =====================================================
       RENDER COMMENTS
    ===================================================== */

    function renderComments() {

        const container =
            $("commentsContainer");


        if (!container) return;


        container.innerHTML =
            "";


        if (!adminComments.length) {

            container.innerHTML = `

                <div class="empty-comments">

                    💬 No comments yet.

                </div>

            `;

            return;

        }


        adminComments.forEach(
            comment => {

                const book =
                    adminBooks.find(
                        item =>
                            item.id ===
                            comment.bookId
                    );


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "comment-admin-card";


                card.innerHTML = `

                    <div>

                        <strong>
                            ${esc(
                                comment.name ||
                                comment.userName ||
                                "Visitor"
                            )}
                        </strong>

                        <span>
                            ${esc(
                                book?.title ||
                                comment.bookTitle ||
                                "Book"
                            )}
                        </span>

                    </div>


                    <p>
                        ${esc(
                            comment.text ||
                            comment.comment ||
                            comment.message ||
                            ""
                        )}
                    </p>


                    <button
                        type="button"
                        class="delete-comment"
                        data-comment="${esc(comment.id)}"
                    >
                        🗑️ Delete
                    </button>

                `;


                container.appendChild(
                    card
                );

            }
        );


        container
            .querySelectorAll(
                "[data-comment]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteComment(
                            button.dataset.comment
                        );

                    }
                );

            });

    }


    /* =====================================================
       DELETE COMMENT
    ===================================================== */

    async function deleteComment(
        id
    ) {

        if (
            !confirm(
                "Delete this comment?"
            )
        ) {

            return;

        }


        try {

            await db
                .collection("comments")
                .doc(id)
                .delete();


            toast(
                "Comment deleted."
            );


            await loadComments();


        } catch (error) {

            console.error(
                error
            );


            toast(
                "Comment delete failed.",
                "error"
            );

        }

    }


    /* =====================================================
       VISITORS
    ===================================================== */

    async function loadVisitors() {

        try {

            const doc =
                await db
                    .collection("counter")
                    .doc("visitors")
                    .get();


            const count =
                doc.exists
                    ? number(
                        doc.data()?.count
                    )
                    : 0;


            const element =
                $("totalVisitors");


            if (element) {

                element.textContent =
                    count;

            }


        } catch (error) {

            console.error(
                "Visitor count error:",
                error
            );


            const element =
                $("totalVisitors");


            if (element) {

                element.textContent =
                    "0";

            }

        }

    }


    /* =====================================================
       DASHBOARD
    ===================================================== */

    function updateDashboard() {

        let views = 0;

        let likes = 0;

        let shares = 0;

        let downloads = 0;


        adminBooks.forEach(
            book => {

                views +=
                    number(
                        book.views
                    );


                likes +=
                    number(
                        book.likes
                    );


                shares +=
                    number(
                        book.shares
                    );


                downloads +=
                    number(
                        book.downloads
                    );

            }
        );


        if ($("totalBooks")) {

            $("totalBooks").textContent =
                adminBooks.length;

        }


        if ($("totalViews")) {

            $("totalViews").textContent =
                views;

        }


        if ($("totalLikes")) {

            $("totalLikes").textContent =
                likes;

        }


        if ($("totalShares")) {

            $("totalShares").textContent =
                shares;

        }


        if ($("totalDownloads")) {

            $("totalDownloads").textContent =
                downloads;

        }

    }


    /* =====================================================
       START
    ===================================================== */

    console.log(
        "======================================"
    );

    console.log(
        "📚 CHISHTI LIBRARY ADMIN"
    );

    console.log(
        "🔥 Firebase Auth Ready"
    );

    console.log(
        "🔥 Firestore Ready"
    );

    console.log(
        "🔥 Storage Ready"
    );

    console.log(
        "✏️ Edit Ready"
    );

    console.log(
        "➕ Add Ready"
    );

    console.log(
        "🗑️ Delete Ready"
    );

    console.log(
        "======================================"

    );

})();
