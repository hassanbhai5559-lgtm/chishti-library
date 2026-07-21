// ==========================================
// Chishti Reader Engine v1.0
// reader.js
// ==========================================

class ChishtiReader {

    constructor() {

        // Current Book
        this.book = null;

        // PDF Document
        this.pdf = null;

        // Page Control
        this.page = 1;

        this.totalPages = 0;


        // View Settings
        this.zoom = 1.0;

        this.rotation = 0;

        this.theme = "light";


        // Reader Status
        this.loaded = false;


        // Reading Memory
        this.progress = {

            lastPage: 1,

            completed: false

        };


        // User Data
        this.bookmarks = [];

    }


    // =====================================
    // Initialize Reader
    // =====================================

    init() {

        console.log(
            "📚 Chishti Reader Started"
        );

        return true;

    }



    // =====================================
    // Book
    // =====================================

    setBook(book) {

        this.book = book;

        return book;

    }


    getBook() {

        return this.book;

    }



    // =====================================
    // PDF
    // =====================================

    setPDF(pdf) {

        this.pdf = pdf;

    }


    getPDF() {

        return this.pdf;

    }



    // =====================================
    // Page
    // =====================================

    setPage(page) {

        this.page = page;

        this.progress.lastPage = page;

    }


    getCurrentPage() {

        return this.page;

    }



    // =====================================
    // Total Pages
    // =====================================

    setTotalPages(total) {

        this.totalPages = total;

    }


    getTotalPages() {

        return this.totalPages;

    }



    // =====================================
    // Zoom
    // =====================================

    setZoom(value) {

        this.zoom = value;

    }


    getZoom() {

        return this.zoom;

    }



    // =====================================
    // Loading Status
    // =====================================

    setLoaded(status) {

        this.loaded = status;

    }


    isReady() {

        return this.loaded;

    }



    // =====================================
    // Bookmark
    // =====================================

    addBookmark(page) {

        this.bookmarks.push(page);

    }


    getBookmarks() {

        return this.bookmarks;

    }



    // =====================================
    // Reset Reader
    // =====================================

    reset() {

        this.book = null;

        this.pdf = null;

        this.page = 1;

        this.totalPages = 0;

        this.zoom = 1.0;

        this.loaded = false;

    }

}



// ==========================================
// Export Instance
// ==========================================

const Reader = new ChishtiReader();

export default Reader;
