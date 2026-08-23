/* =========================================================
   CHISHTI LIBRARY — ADMIN PANEL
   Firebase Auth + Firestore + Storage
   ========================================================= */

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";


/* =========================================================
   FIREBASE CONFIG
   ========================================================= */

const firebaseConfig = {
  apiKey: "AIzaSyD9fWqS3Yx0XxXxXxXxXxXxXxXxXx",
  authDomain: "chishti-library.firebaseapp.com",
  projectId: "chishti-library",
  storageBucket: "chishti-library.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000000000"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


/* =========================================================
   ELEMENTS
   ========================================================= */

const loginView = document.getElementById("loginView");
const adminView = document.getElementById("adminView");

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const logoutBtn = document.getElementById("logoutBtn");

const bookForm = document.getElementById("bookForm");

const bookIdInput = document.getElementById("bookId");
const titleInput = document.getElementById("title");
const authorInput = document.getElementById("author");
const categoryInput = document.getElementById("category");
const descriptionInput = document.getElementById("description");

const coverInput = document.getElementById("cover");
const pdfInput = document.getElementById("pdf");

const latestInput = document.getElementById("latest");

const booksContainer =
  document.getElementById("booksContainer");

const searchInput =
  document.getElementById("searchInput");

const categoryFilter =
  document.getElementById("categoryFilter");

const cancelEditBtn =
  document.getElementById("cancelEditBtn");

const formTitle =
  document.getElementById("formTitle");

const totalBooks =
  document.getElementById("totalBooks");

const totalViews =
  document.getElementById("totalViews");

const totalLikes =
  document.getElementById("totalLikes");

const totalDownloads =
  document.getElementById("totalDownloads");

const loading =
  document.getElementById("loading");

const message =
  document.getElementById("message");


/* =========================================================
   STATE
   ========================================================= */

let books = [];

let editingBookId = null;

let oldCoverURL = "";
let oldPdfURL = "";


/* =========================================================
   HELPERS
   ========================================================= */

function showMessage(text, type = "success") {

  if (!message) return;

  message.textContent = text;
  message.className = `message ${type}`;

  setTimeout(() => {
    message.textContent = "";
    message.className = "message";
  }, 4000);
}


function setLoading(value) {

  if (!loading) return;

  loading.style.display =
    value ? "flex" : "none";
}


function escapeHTML(value = "") {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function slugify(text) {

  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


/* =========================================================
   AUTH
   ========================================================= */

onAuthStateChanged(auth, async (user) => {

  if (user) {

    if (loginView) {
      loginView.style.display = "none";
    }

    if (adminView) {
      adminView.style.display = "block";
    }

    await loadBooks();

  } else {

    if (loginView) {
      loginView.style.display = "flex";
    }

    if (adminView) {
      adminView.style.display = "none";
    }

  }

});


/* =========================================================
   LOGIN
   ========================================================= */

if (loginForm) {

  loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email =
      emailInput.value.trim();

    const password =
      passwordInput.value;

    if (!email || !password) {

      showMessage(
        "Email aur password enter karein.",
        "error"
      );

      return;
    }

    try {

      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      showMessage(
        "Login successful!",
        "success"
      );

    } catch (error) {

      console.error(error);

      showMessage(
        "Login failed: " + getFirebaseError(error),
        "error"
      );

    } finally {

      setLoading(false);

    }

  });

}


/* =========================================================
   LOGOUT
   ========================================================= */

if (logoutBtn) {

  logoutBtn.addEventListener("click", async () => {

    try {

      await signOut(auth);

      showMessage(
        "Logged out successfully.",
        "success"
      );

    } catch (error) {

      console.error(error);

      showMessage(
        "Logout failed.",
        "error"
      );

    }

  });

}


/* =========================================================
   LOAD BOOKS
   ========================================================= */

async function loadBooks() {

  try {

    setLoading(true);

    const booksRef =
      collection(db, "books");

    const q =
      query(
        booksRef,
        orderBy("createdAt", "desc")
      );

    const snapshot =
      await getDocs(q);

    books = [];

    snapshot.forEach((item) => {

      books.push({
        id: item.id,
        ...item.data()
      });

    });

    renderBooks();
    updateStats();
    updateCategories();

  } catch (error) {

    console.error(error);

    showMessage(
      "Books load nahi ho sakin: " +
      getFirebaseError(error),
      "error"
    );

  } finally {

    setLoading(false);

  }

}


/* =========================================================
   RENDER BOOKS
   ========================================================= */

function renderBooks() {

  if (!booksContainer) return;

  const search =
    searchInput
      ? searchInput.value
          .trim()
          .toLowerCase()
      : "";

  const category =
    categoryFilter
      ? categoryFilter.value
      : "all";

  let filtered =
    books.filter((book) => {

      const title =
        String(book.title || "")
          .toLowerCase();

      const author =
        String(book.author || "")
          .toLowerCase();

      const bookCategory =
        String(book.category || "")
          .toLowerCase();

      const matchesSearch =
        !search ||
        title.includes(search) ||
        author.includes(search) ||
        bookCategory.includes(search);

      const matchesCategory =
        category === "all" ||
        bookCategory === category.toLowerCase();

      return matchesSearch && matchesCategory;

    });


  if (!filtered.length) {

    booksContainer.innerHTML = `
      <div class="empty">
        <h3>No books found</h3>
        <p>Abhi koi matching book nahi mili.</p>
      </div>
    `;

    return;
  }


  booksContainer.innerHTML =
    filtered.map(book => {

      return `
        <div class="book-card">

          <div class="book-cover">

            ${
              book.cover
                ? `<img
                    src="${escapeHTML(book.cover)}"
                    alt="${escapeHTML(book.title)}"
                    loading="lazy"
                  >`
                : `<div class="no-cover">
                    📚
                  </div>`
            }

          </div>


          <div class="book-info">

            <div class="book-top">

              <span class="category">
                ${escapeHTML(book.category || "Other")}
              </span>

              ${
                book.latest
                  ? `<span class="latest">
                      Latest
                    </span>`
                  : ""
              }

            </div>


            <h3>
              ${escapeHTML(book.title || "Untitled")}
            </h3>


            <p class="author">
              ${escapeHTML(book.author || "Unknown Author")}
            </p>


            <p class="description">
              ${escapeHTML(book.description || "")}
            </p>


            <div class="stats">

              <span>
                👁️ ${Number(book.views || 0)}
              </span>

              <span>
                ❤️ ${Number(book.likes || 0)}
              </span>

              <span>
                ⬇️ ${Number(book.downloads || 0)}
              </span>

            </div>


            <div class="actions">

              <button
                class="edit-btn"
                data-id="${book.id}"
              >
                ✏️ Edit
              </button>

              <button
                class="delete-btn"
                data-id="${book.id}"
              >
                🗑️ Delete
              </button>

            </div>

          </div>

        </div>
      `;

    }).join("");


  document
    .querySelectorAll(".edit-btn")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => editBook(button.dataset.id)
      );

    });


  document
    .querySelectorAll(".delete-btn")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => deleteBook(button.dataset.id)
      );

    });

}


/* =========================================================
   UPDATE STATS
   ========================================================= */

function updateStats() {

  const total =
    books.length;

  const views =
    books.reduce(
      (sum, book) =>
        sum + Number(book.views || 0),
      0
    );

  const likes =
    books.reduce(
      (sum, book) =>
        sum + Number(book.likes || 0),
      0
    );

  const downloads =
    books.reduce(
      (sum, book) =>
        sum + Number(book.downloads || 0),
      0
    );


  if (totalBooks)
    totalBooks.textContent = total;

  if (totalViews)
    totalViews.textContent = views;

  if (totalLikes)
    totalLikes.textContent = likes;

  if (totalDownloads)
    totalDownloads.textContent = downloads;

}


/* =========================================================
   CATEGORIES
   ========================================================= */

function updateCategories() {

  if (!categoryFilter) return;

  const current =
    categoryFilter.value;

  const categories =
    [...new Set(
      books
        .map(book =>
          String(book.category || "").trim()
        )
        .filter(Boolean)
    )]
    .sort();


  categoryFilter.innerHTML =
    `<option value="all">All Categories</option>` +
    categories
      .map(category => `
        <option value="${escapeHTML(category)}">
          ${escapeHTML(category)}
        </option>
      `)
      .join("");


  if (
    categories.includes(current)
  ) {

    categoryFilter.value =
      current;

  }

}


/* =========================================================
   SEARCH / FILTER
   ========================================================= */

if (searchInput) {

  searchInput.addEventListener(
    "input",
    renderBooks
  );

}


if (categoryFilter) {

  categoryFilter.addEventListener(
    "change",
    renderBooks
  );

}


/* =========================================================
   ADD / UPDATE BOOK
   ========================================================= */

if (bookForm) {

  bookForm.addEventListener(
    "submit",
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

        const title =
          titleInput.value.trim();

        const author =
          authorInput.value.trim();

        const category =
          categoryInput.value.trim();

        const description =
          descriptionInput.value.trim();

        const latest =
          latestInput
            ? latestInput.checked
            : false;


        if (!title) {

          showMessage(
            "Book title required hai.",
            "error"
          );

          return;
        }


        if (!author) {

          showMessage(
            "Author required hai.",
            "error"
          );

          return;
        }


        if (!category) {

          showMessage(
            "Category required hai.",
            "error"
          );

          return;
        }


        let coverURL =
          oldCoverURL;

        let pdfURL =
          oldPdfURL;


        /* =========================
           COVER UPLOAD
           ========================= */

        if (
          coverInput &&
          coverInput.files &&
          coverInput.files.length
        ) {

          const file =
            coverInput.files[0];

          coverURL =
            await uploadFile(
              file,
              `books/covers/${Date.now()}-${slugify(file.name)}`
            );

        }


        /* =========================
           PDF UPLOAD
           ========================= */

        if (
          pdfInput &&
          pdfInput.files &&
          pdfInput.files.length
        ) {

          const file =
            pdfInput.files[0];

          pdfURL =
            await uploadFile(
              file,
              `books/pdfs/${Date.now()}-${slugify(file.name)}`
            );

        }


        const bookData = {

          title,
          author,
          category,
          description,

          cover: coverURL || "",
          pdf: pdfURL || "",

          latest,

          views: 0,
          likes: 0,
          downloads: 0,

          updatedAt:
            serverTimestamp()

        };


        /* =========================
           UPDATE
           ========================= */

        if (editingBookId) {

          const existing =
            books.find(
              book =>
                book.id === editingBookId
            );


          if (existing) {

            bookData.views =
              Number(existing.views || 0);

            bookData.likes =
              Number(existing.likes || 0);

            bookData.downloads =
              Number(existing.downloads || 0);

            bookData.createdAt =
              existing.createdAt ||
              serverTimestamp();

          }


          await updateDoc(
            doc(
              db,
              "books",
              editingBookId
            ),
            bookData
          );


          showMessage(
            "Book successfully updated! ✅",
            "success"
          );

        }

        /* =========================
           ADD
           ========================= */

        else {

          bookData.createdAt =
            serverTimestamp();

          await addDoc(
            collection(db, "books"),
            bookData
          );


          showMessage(
            "New book successfully added! 📚",
            "success"
          );

        }


        resetForm();

        await loadBooks();

      } catch (error) {

        console.error(error);

        showMessage(
          "Book save nahi ho saki: " +
          getFirebaseError(error),
          "error"
        );

      } finally {

        setLoading(false);

      }

    }
  );

}


/* =========================================================
   UPLOAD FILE
   ========================================================= */

async function uploadFile(
  file,
  path
) {

  if (!file) return "";

  const storageRef =
    ref(storage, path);

  await uploadBytes(
    storageRef,
    file
  );

  return await getDownloadURL(
    storageRef
  );

}


/* =========================================================
   EDIT BOOK
   ========================================================= */

async function editBook(id) {

  try {

    const book =
      books.find(
        item => item.id === id
      );

    if (!book) return;


    editingBookId =
      id;

    oldCoverURL =
      book.cover || "";

    oldPdfURL =
      book.pdf || "";


    if (bookIdInput)
      bookIdInput.value = id;

    if (titleInput)
      titleInput.value =
        book.title || "";

    if (authorInput)
      authorInput.value =
        book.author || "";

    if (categoryInput)
      categoryInput.value =
        book.category || "";

    if (descriptionInput)
      descriptionInput.value =
        book.description || "";

    if (latestInput)
      latestInput.checked =
        Boolean(book.latest);


    if (formTitle)
      formTitle.textContent =
        "Edit Book";


    if (cancelEditBtn)
      cancelEditBtn.style.display =
        "inline-flex";


    bookForm.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });


  } catch (error) {

    console.error(error);

    showMessage(
      "Book edit nahi ho saki.",
      "error"
    );

  }

}


/* =========================================================
   DELETE BOOK
   ========================================================= */

async function deleteBook(id) {

  const book =
    books.find(
      item => item.id === id
    );

  if (!book) return;


  const confirmed =
    confirm(
      `Delete "${book.title}"?\n\nYe action undo nahi ho sakta.`
    );


  if (!confirmed) return;


  try {

    setLoading(true);


    await deleteDoc(
      doc(
        db,
        "books",
        id
      )
    );


    showMessage(
      "Book deleted successfully. 🗑️",
      "success"
    );


    await loadBooks();


  } catch (error) {

    console.error(error);

    showMessage(
      "Book delete nahi ho saki: " +
      getFirebaseError(error),
      "error"
    );

  } finally {

    setLoading(false);

  }

}


/* =========================================================
   RESET FORM
   ========================================================= */

function resetForm() {

  editingBookId =
    null;

  oldCoverURL =
    "";

  oldPdfURL =
    "";


  if (bookForm)
    bookForm.reset();


  if (bookIdInput)
    bookIdInput.value = "";


  if (formTitle)
    formTitle.textContent =
      "Add New Book";


  if (cancelEditBtn)
    cancelEditBtn.style.display =
      "none";

}


/* =========================================================
   CANCEL EDIT
   ========================================================= */

if (cancelEditBtn) {

  cancelEditBtn.addEventListener(
    "click",
    resetForm
  );

}


/* =========================================================
   FIREBASE ERROR HANDLER
   ========================================================= */

function getFirebaseError(error) {

  const code =
    error?.code || "";

  const errors = {

    "auth/invalid-credential":
      "Email ya password incorrect hai.",

    "auth/invalid-login-credentials":
      "Email ya password incorrect hai.",

    "auth/user-not-found":
      "Admin account nahi mila.",

    "auth/wrong-password":
      "Password incorrect hai.",

    "auth/invalid-email":
      "Email address invalid hai.",

    "auth/too-many-requests":
      "Too many attempts. Thori der baad try karein.",

    "permission-denied":
      "Firebase permission denied.",

    "storage/unauthorized":
      "Storage permission denied.",

    "storage/canceled":
      "Upload cancel ho gaya.",

    "storage/quota-exceeded":
      "Storage quota exceed ho gaya."

  };


  return (
    errors[code] ||
    error?.message ||
    "Unknown error"
  );

}


/* =========================================================
   GLOBAL REFRESH
   ========================================================= */

window.refreshBooks =
  async function () {

    await loadBooks();

  };


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.editBook =
  editBook;

window.deleteBook =
  deleteBook;

window.resetBookForm =
  resetForm;


/* =========================================================
   CONSOLE
   ========================================================= */

console.log(
  "📚 Chishti Library Admin loaded successfully."
);
