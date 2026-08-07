/*==================================================
        CHISHTI LIBRARY READER V3
              reader.js — PART 1
==================================================*/

/*==================== CONFIG ====================*/

const ReaderConfig = {
    pdfUrl: "books/book.pdf",
    storagePrefix: "chishti_reader_",
    defaultZoom: 1,
    minZoom: 0.5,
    maxZoom: 2.5,
    zoomStep: 0.1
};


/*==================== STATE ====================*/

const ReaderState = {
    pdf: null,
    currentPage: 1,
    totalPages: 0,
    zoom: ReaderConfig.defaultZoom,

    bookmarks: [],
    liked: false,
    likes: 0,

    rendering: false,
    loading: true,

    darkMode: true,
    pageShadow: true,
    pageAnimation: true,
    autoSave: true,

    currentRenderTask: null
};


/*==================== DOM ====================*/

const $ = id => document.getElementById(id);

const DOM = {
    openingScreen: $("openingScreen"),
    loadingScreen: $("loadingScreen"),
    loadingText: $("loadingText"),
    loadingBar: $("loadingBar"),
    loadingPercent: $("loadingPercent"),
    toast: $("toast"),

    reader: $("reader"),
    readerBody: $("readerBody"),

    bookTitle: $("bookTitle"),
    bookAuthor: $("bookAuthor"),

    pdfContainer: $("pdfContainer"),
    pdfCanvas: $("pdfCanvas"),
    pageFlipLayer: $("pageFlipLayer"),

    currentPage: $("currentPage"),
    totalPages: $("totalPages"),
    pageInfo: $("pageInfo"),
    readingProgressFill: $("readingProgressFill"),
    zoomValue: $("zoomValue"),

    menuBtn: $("menuBtn"),
    prevBtn: $("prevBtn"),
    nextBtn: $("nextBtn"),
    previousPage: $("previousPage"),
    nextPage: $("nextPage"),

    zoomOutBtn: $("zoomOutBtn"),
    zoomInBtn: $("zoomInBtn"),
    fitBtn: $("fitBtn"),

    thumbnailBtn: $("thumbnailBtn"),
    commentsBtn: $("commentsBtn"),

    searchBtn: $("searchBtn"),
    bookmarkBtn: $("bookmarkBtn"),
    themeBtn: $("themeBtn"),
    fullscreenBtn: $("fullscreenBtn"),

    leftSidebar: $("leftSidebar"),
    closeSidebar: $("closeSidebar"),

    searchPanel: $("searchPanel"),
    searchInput: $("searchInput"),
    searchClose: $("searchClose"),
    searchResults: $("searchResults"),

    thumbnailSidebar: $("thumbnailSidebar"),
    thumbnailContainer: $("thumbnailContainer"),

    commentPanel: $("commentPanel"),
    commentList: $("commentList"),
    commentName: $("commentName"),
    commentMessage: $("commentMessage"),
    commentSubmit: $("commentSubmit"),

    settingsPanel: $("settingsPanel"),
    darkMode: $("darkMode"),
    pageShadow: $("pageShadow"),
    pageAnimation: $("pageAnimation"),
    autoSave: $("autoSave"),

    sharePanel: $("sharePanel"),
    shareClose: $("shareClose"),
    copyLinkBtn: $("copyLinkBtn"),
    nativeShareBtn: $("nativeShareBtn"),

    likeBtn: $("likeBtn"),
    likeCount: $("likeCount"),
    shareBtn: $("shareBtn"),

    bookmarkMessage: $("bookmarkMessage"),

    pdfInput: $("pdfInput")
};


/*==================== STORAGE ====================*/

function storageKey(name){
    return ReaderConfig.storagePrefix + name;
}

function saveStorage(name, value){
    try{
        localStorage.setItem(
            storageKey(name),
            JSON.stringify(value)
        );
    }catch(error){
        console.warn("Storage save failed:", error);
    }
}

function getStorage(name, fallback = null){
    try{
        const value = localStorage.getItem(
            storageKey(name)
        );

        return value === null
            ? fallback
            : JSON.parse(value);

    }catch(error){
        console.warn("Storage read failed:", error);
        return fallback;
    }
}


/*==================== TOAST ====================*/

let toastTimer = null;

function showToast(message, duration = 2500){

    if(!DOM.toast){
        return;
    }

    DOM.toast.textContent = message;

    DOM.toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        DOM.toast.classList.remove("show");
    }, duration);
}


/*==================== LOADING ====================*/

function setLoadingProgress(percent, text){

    const safePercent = Math.max(
        0,
        Math.min(100, Number(percent) || 0)
    );

    if(DOM.loadingBar){
        DOM.loadingBar.style.width =
            `${safePercent}%`;
    }

    if(DOM.loadingPercent){
        DOM.loadingPercent.textContent =
            `${Math.round(safePercent)}%`;
    }

    if(text && DOM.loadingText){
        DOM.loadingText.textContent = text;
    }
}

function hideLoading(){

    ReaderState.loading = false;

    document.body.classList.remove("loading");

    if(DOM.loadingScreen){
        DOM.loadingScreen.classList.add("hidden");
    }

    setTimeout(() => {

        if(DOM.openingScreen){
            DOM.openingScreen.classList.add("hidden");
        }

    }, 250);
}


/*==================== BOOK INFORMATION ====================*/

function loadBookInformation(){

    const savedTitle =
        getStorage("bookTitle", "Chishti Library");

    const savedAuthor =
        getStorage("bookAuthor", "Unknown Author");

    if(DOM.bookTitle){
        DOM.bookTitle.textContent = savedTitle;
    }

    if(DOM.bookAuthor){
        DOM.bookAuthor.textContent = savedAuthor;
    }
}


/*==================== PDF LOAD ====================*/

async function loadPDF(source = ReaderConfig.pdfUrl){

    if(typeof pdfjsLib === "undefined"){
        showToast("PDF.js failed to load.");
        return;
    }

    try{

        setLoadingProgress(
            5,
            "Preparing PDF..."
        );

        document.body.classList.add("loading");

        const loadingTask =
            pdfjsLib.getDocument(source);

        loadingTask.onProgress = progress => {

            if(progress.total){

                const percent =
                    (progress.loaded / progress.total) * 100;

                setLoadingProgress(
                    Math.min(percent, 90),
                    "Loading Book..."
                );
            }

        };

        ReaderState.pdf =
            await loadingTask.promise;

        ReaderState.totalPages =
            ReaderState.pdf.numPages;

        ReaderState.currentPage = 1;

        if(DOM.totalPages){
            DOM.totalPages.textContent =
                ReaderState.totalPages;
        }

        setLoadingProgress(
            95,
            "Rendering first page..."
        );

        await renderPage(
            ReaderState.currentPage
        );

        buildThumbnails();

        loadSavedState();

        updateUI();

        setLoadingProgress(
            100,
            "Book Ready"
        );

        setTimeout(hideLoading, 350);

    }catch(error){

        console.error("PDF loading error:", error);

        hideLoading();

        showToast(
            "PDF could not be loaded. Check the PDF path."
        );
    }
}


/*==================== RENDER PAGE ====================*/

async function renderPage(pageNumber){

    if(!ReaderState.pdf){
        return;
    }

    if(
        pageNumber < 1 ||
        pageNumber > ReaderState.totalPages
    ){
        return;
    }

    if(ReaderState.currentRenderTask){

        try{
            ReaderState.currentRenderTask.cancel();
        }catch(error){
            console.warn(error);
        }

        ReaderState.currentRenderTask = null;
    }

    ReaderState.rendering = true;

    if(DOM.pdfCanvas){
        DOM.pdfCanvas.classList.add("rendering");
    }

    try{

        const page =
            await ReaderState.pdf.getPage(pageNumber);

        const baseViewport =
            page.getViewport({ scale: 1 });

        const containerWidth =
            DOM.pdfContainer?.clientWidth || window.innerWidth;

        const containerHeight =
            DOM.pdfContainer?.clientHeight || window.innerHeight;

        const availableWidth =
            Math.max(containerWidth - 40, 200);

        const availableHeight =
            Math.max(containerHeight - 40, 200);

        const fitScale =
            Math.min(
                availableWidth / baseViewport.width,
                availableHeight / baseViewport.height
            );

        const scale =
            Math.max(
                0.1,
                fitScale * ReaderState.zoom
            );

        const viewport =
            page.getViewport({ scale });

        const canvas =
            DOM.pdfCanvas;

        if(!canvas){
            return;
        }

        const context =
            canvas.getContext("2d", {
                alpha:false
            });

        const outputScale =
            window.devicePixelRatio || 1;

        canvas.width =
            Math.floor(
                viewport.width * outputScale
            );

        canvas.height =
            Math.floor(
                viewport.height * outputScale
            );

        canvas.style.width =
            `${viewport.width}px`;

        canvas.style.height =
            `${viewport.height}px`;

        context.setTransform(
            outputScale,
            0,
            0,
            outputScale,
            0,
            0
        );

        context.fillStyle = "#ffffff";

        context.fillRect(
            0,
            0,
            viewport.width,
            viewport.height
        );

        ReaderState.currentRenderTask =
            page.render({
                canvasContext: context,
                viewport
            });

        await ReaderState.currentRenderTask.promise;

        ReaderState.currentRenderTask = null;

    }catch(error){

        if(error?.name !== "RenderingCancelledException"){
            console.error(
                "Page rendering error:",
                error
            );
        }

    }finally{

        ReaderState.rendering = false;

        if(DOM.pdfCanvas){
            DOM.pdfCanvas.classList.remove(
                "rendering"
            );
        }
    }
}


/*==================== PAGE NAVIGATION ====================*/

async function goToPage(pageNumber, animate = true){

    if(!ReaderState.pdf){
        return;
    }

    const target =
        Math.max(
            1,
            Math.min(
                ReaderState.totalPages,
                Number(pageNumber) || 1
            )
        );

    if(
        target === ReaderState.currentPage &&
        !ReaderState.loading
    ){
        return;
    }

    const direction =
        target > ReaderState.currentPage
            ? "next"
            : "prev";

    if(
        animate &&
        ReaderState.pageAnimation &&
        DOM.pageFlipLayer
    ){

        DOM.pageFlipLayer.classList.remove(
            "flip-next",
            "flip-prev"
        );

        void DOM.pageFlipLayer.offsetWidth;

        DOM.pageFlipLayer.classList.add(
            direction === "next"
                ? "flip-next"
                : "flip-prev"
        );

        setTimeout(() => {

            DOM.pageFlipLayer.classList.remove(
                "flip-next",
                "flip-prev"
            );

        }, 700);
    }

    ReaderState.currentPage = target;

    await renderPage(target);

    updateUI();

    saveReadingProgress();
}

async function nextReaderPage(){

    if(
        ReaderState.currentPage <
        ReaderState.totalPages
    ){

        await goToPage(
            ReaderState.currentPage + 1
        );

    }else{

        showToast("You are on the last page.");
    }
}

async function previousReaderPage(){

    if(ReaderState.currentPage > 1){

        await goToPage(
            ReaderState.currentPage - 1
        );

    }else{

        showToast("You are on the first page.");
    }
}


/*==================== UI UPDATE ====================*/

function updateUI(){

    const page =
        ReaderState.currentPage;

    const total =
        ReaderState.totalPages;

    if(DOM.currentPage){
        DOM.currentPage.textContent = page;
    }

    if(DOM.totalPages){
        DOM.totalPages.textContent = total;
    }

    if(DOM.pageInfo){
        DOM.pageInfo.textContent =
            `Page ${page} of ${total}`;
    }

    if(DOM.zoomValue){
        DOM.zoomValue.textContent =
            `${Math.round(
                ReaderState.zoom * 100
            )}%`;
    }

    const progress =
        total > 0
            ? ((page - 1) / Math.max(total - 1, 1)) * 100
            : 0;

    if(DOM.readingProgressFill){
        DOM.readingProgressFill.style.width =
            `${progress}%`;
    }

    if(DOM.prevBtn){
        DOM.prevBtn.disabled =
            page <= 1;
    }

    if(DOM.previousPage){
        DOM.previousPage.disabled =
            page <= 1;
    }

    if(DOM.nextBtn){
        DOM.nextBtn.disabled =
            page >= total;
    }

    if(DOM.nextPage){
        DOM.nextPage.disabled =
            page >= total;
    }

    updateBookmarkButton();
    updateLikeButton();
    updateThemeButton();
}
/*==================================================
        CHISHTI LIBRARY READER V3
              reader.js — PART 2
==================================================*/

/*==================== ZOOM ====================*/

async function setZoom(value){

    const zoom =
        Math.max(
            ReaderConfig.minZoom,
            Math.min(
                ReaderConfig.maxZoom,
                Number(value) || 1
            )
        );

    ReaderState.zoom =
        Math.round(zoom * 10) / 10;

    await renderPage(
        ReaderState.currentPage
    );

    updateUI();

    if(ReaderState.autoSave){
        saveStorage(
            "zoom",
            ReaderState.zoom
        );
    }
}

async function zoomIn(){

    await setZoom(
        ReaderState.zoom +
        ReaderConfig.zoomStep
    );
}

async function zoomOut(){

    await setZoom(
        ReaderState.zoom -
        ReaderConfig.zoomStep
    );
}

async function fitPage(){

    ReaderState.zoom = 1;

    await renderPage(
        ReaderState.currentPage
    );

    updateUI();
}


/*==================== BOOKMARKS ====================*/

function loadBookmarks(){

    ReaderState.bookmarks =
        getStorage(
            "bookmarks",
            []
        );

    if(!Array.isArray(ReaderState.bookmarks)){
        ReaderState.bookmarks = [];
    }
}

function saveBookmarks(){

    saveStorage(
        "bookmarks",
        ReaderState.bookmarks
    );
}

function isBookmarked(page){

    return ReaderState.bookmarks.some(
        item => Number(item.page) === Number(page)
    );
}

function toggleBookmark(){

    const page =
        ReaderState.currentPage;

    const index =
        ReaderState.bookmarks.findIndex(
            item => Number(item.page) === Number(page)
        );

    if(index >= 0){

        ReaderState.bookmarks.splice(
            index,
            1
        );

        showToast(
            `Bookmark removed from page ${page}.`
        );

    }else{

        ReaderState.bookmarks.push({
            page,
            title:`Page ${page}`,
            createdAt:new Date().toISOString()
        });

        ReaderState.bookmarks.sort(
            (a,b) => Number(a.page) - Number(b.page)
        );

        showToast(
            `Page ${page} bookmarked.`
        );
    }

    saveBookmarks();

    updateBookmarkButton();

    buildBookmarkList();
}

function updateBookmarkButton(){

    if(!DOM.bookmarkBtn){
        return;
    }

    const active =
        isBookmarked(
            ReaderState.currentPage
        );

    DOM.bookmarkBtn.classList.toggle(
        "active",
        active
    );

    DOM.bookmarkBtn.classList.toggle(
        "bookmarked",
        active
    );

    DOM.bookmarkBtn.setAttribute(
        "aria-pressed",
        String(active)
    );
}

function buildBookmarkList(){

    if(!DOM.bookmarkContainer){
        return;
    }

    DOM.bookmarkContainer.innerHTML = "";

    if(!ReaderState.bookmarks.length){

        DOM.bookmarkContainer.innerHTML = `
            <div class="emptyState">
                No bookmarks yet.
            </div>
        `;

        return;
    }

    ReaderState.bookmarks.forEach(bookmark => {

        const item =
            document.createElement("div");

        item.className =
            "bookmarkItem";

        item.innerHTML = `
            <span>
                ${escapeHTML(
                    bookmark.title ||
                    `Page ${bookmark.page}`
                )}
            </span>

            <button
                type="button"
                class="bookmarkDelete"
                aria-label="Delete bookmark">
                <i class="ri-delete-bin-line"></i>
            </button>
        `;

        const titleArea =
            item.querySelector("span");

        titleArea.addEventListener(
            "click",
            () => {

                goToPage(
                    Number(bookmark.page)
                );

                closeSidebar();
            }
        );

        const deleteButton =
            item.querySelector(
                ".bookmarkDelete"
            );

        deleteButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                ReaderState.bookmarks =
                    ReaderState.bookmarks.filter(
                        b =>
                            Number(b.page) !==
                            Number(bookmark.page)
                    );

                saveBookmarks();

                buildBookmarkList();

                updateBookmarkButton();
            }
        );

        DOM.bookmarkContainer.appendChild(item);
    });
}


/*==================== LIKE ====================*/

function loadLikeState(){

    ReaderState.liked =
        Boolean(
            getStorage(
                "liked",
                false
            )
        );

    ReaderState.likes =
        Number(
            getStorage(
                "likes",
                0
            )
        ) || 0;
}

function updateLikeButton(){

    if(DOM.likeBtn){

        DOM.likeBtn.classList.toggle(
            "liked",
            ReaderState.liked
        );

        DOM.likeBtn.classList.toggle(
            "active",
            ReaderState.liked
        );

        DOM.likeBtn.setAttribute(
            "aria-pressed",
            String(ReaderState.liked)
        );
    }

    if(DOM.likeCount){
        DOM.likeCount.textContent =
            ReaderState.likes;
    }
}

function toggleLike(){

    if(ReaderState.liked){

        ReaderState.liked = false;

        ReaderState.likes =
            Math.max(
                0,
                ReaderState.likes - 1
            );

        showToast("Like removed.");

    }else{

        ReaderState.liked = true;

        ReaderState.likes += 1;

        showToast("Book liked.");
    }

    saveStorage(
        "liked",
        ReaderState.liked
    );

    saveStorage(
        "likes",
        ReaderState.likes
    );

    updateLikeButton();
}


/*==================== THEME ====================*/

function loadTheme(){

    const saved =
        getStorage(
            "darkMode",
            true
        );

    ReaderState.darkMode =
        Boolean(saved);

    applyTheme();
}

function applyTheme(){

    document.body.classList.toggle(
        "lightTheme",
        !ReaderState.darkMode
    );

    if(DOM.darkMode){
        DOM.darkMode.checked =
            ReaderState.darkMode;
    }

    updateThemeButton();
}

function toggleTheme(){

    ReaderState.darkMode =
        !ReaderState.darkMode;

    applyTheme();

    saveStorage(
        "darkMode",
        ReaderState.darkMode
    );
}

function updateThemeButton(){

    if(!DOM.themeBtn){
        return;
    }

    DOM.themeBtn.classList.toggle(
        "active",
        !ReaderState.darkMode
    );
}


/*==================== SETTINGS ====================*/

function loadSettings(){

    ReaderState.pageShadow =
        Boolean(
            getStorage(
                "pageShadow",
                true
            )
        );

    ReaderState.pageAnimation =
        Boolean(
            getStorage(
                "pageAnimation",
                true
            )
        );

    ReaderState.autoSave =
        Boolean(
            getStorage(
                "autoSave",
                true
            )
        );

    applySettings();
}

function applySettings(){

    document.body.classList.toggle(
        "noPageShadow",
        !ReaderState.pageShadow
    );

    document.body.classList.toggle(
        "noPageAnimation",
        !ReaderState.pageAnimation
    );

    if(DOM.pageShadow){
        DOM.pageShadow.checked =
            ReaderState.pageShadow;
    }

    if(DOM.pageAnimation){
        DOM.pageAnimation.checked =
            ReaderState.pageAnimation;
    }

    if(DOM.autoSave){
        DOM.autoSave.checked =
            ReaderState.autoSave;
    }
}


/*==================== SIDEBAR ====================*/

function openSidebar(){

    if(!DOM.leftSidebar){
        return;
    }

    DOM.leftSidebar.classList.add(
        "active"
    );

    DOM.leftSidebar.setAttribute(
        "aria-hidden",
        "false"
    );

    buildBookmarkList();
}

function closeSidebar(){

    if(!DOM.leftSidebar){
        return;
    }

    DOM.leftSidebar.classList.remove(
        "active"
    );

    DOM.leftSidebar.setAttribute(
        "aria-hidden",
        "true"
    );
}

function toggleSidebar(){

    if(
        DOM.leftSidebar?.classList.contains(
            "active"
        )
    ){
        closeSidebar();
    }else{
        openSidebar();
    }
}


/*==================== SEARCH ====================*/

function openSearch(){

    if(!DOM.searchPanel){
        return;
    }

    DOM.searchPanel.classList.add(
        "active"
    );

    if(DOM.searchInput){

        DOM.searchInput.focus();

        DOM.searchInput.select();
    }
}

function closeSearch(){

    if(!DOM.searchPanel){
        return;
    }

    DOM.searchPanel.classList.remove(
        "active"
    );
}

function clearSearchResults(){

    if(DOM.searchResults){
        DOM.searchResults.innerHTML = "";
    }
}

async function searchPDF(query){

    const text =
        String(query || "").trim();

    clearSearchResults();

    if(!text){

        if(DOM.searchResults){
            DOM.searchResults.innerHTML = `
                <div class="emptyState">
                    Type something to search.
                </div>
            `;
        }

        return;
    }

    if(!ReaderState.pdf){
        return;
    }

    if(DOM.searchResults){
        DOM.searchResults.innerHTML = `
            <div class="emptyState">
                Searching...
            </div>
        `;
    }

    const results = [];
    const searchText = text.toLowerCase();

    for(
        let pageNumber = 1;
        pageNumber <= ReaderState.totalPages;
        pageNumber++
    ){

        try{

            const page =
                await ReaderState.pdf.getPage(
                    pageNumber
                );

            const content =
                await page.getTextContent();

            const pageText =
                content.items
                    .map(item => item.str)
                    .join(" ");

            if(
                pageText
                    .toLowerCase()
                    .includes(searchText)
            ){

                results.push({
                    page:pageNumber,
                    text:pageText
                });
            }

        }catch(error){

            console.warn(
                `Search failed on page ${pageNumber}`,
                error
            );
        }
    }

    if(!DOM.searchResults){
        return;
    }

    DOM.searchResults.innerHTML = "";

    if(!results.length){

        DOM.searchResults.innerHTML = `
            <div class="noSearchResults">
                <i class="ri-search-line"></i>
                No results found.
            </div>
        `;

        return;
    }

    results.forEach(result => {

        const item =
            document.createElement("div");

        item.className =
            "searchResult";

        const index =
            result.text
                .toLowerCase()
                .indexOf(searchText);

        let preview =
            result.text.slice(
                Math.max(0,index - 60),
                index + text.length + 100
            );

        if(index < 0){
            preview =
                result.text.slice(0,160);
        }

        item.innerHTML = `
            <span class="searchResultPage">
                Page ${result.page}
            </span>

            <span class="searchResultText">
                ${highlightText(
                    preview,
                    text
                )}
            </span>
        `;

        item.addEventListener(
            "click",
            () => {

                goToPage(
                    result.page,
                    false
                );

                closeSearch();
            }
        );

        DOM.searchResults.appendChild(item);
    });
}


/*==================== ESCAPE / HIGHLIGHT ====================*/

function escapeHTML(value){

    return String(value)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
}

function escapeRegExp(value){

    return String(value)
        .replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );
}

function highlightText(text, query){

    const safeText =
        escapeHTML(text);

    const safeQuery =
        escapeRegExp(
            escapeHTML(query)
        );

    return safeText.replace(
        new RegExp(
            `(${safeQuery})`,
            "gi"
        ),
        `<mark class="searchHighlight">$1</mark>`
    );
}


/*==================== END PART 2 ====================*/
/*==================================================
        CHISHTI LIBRARY READER V3
              reader.js — PART 3
==================================================*/

/*==================== THUMBNAILS ====================*/

async function buildThumbnails(){

    if(!DOM.thumbnailContainer || !ReaderState.pdf){
        return;
    }

    DOM.thumbnailContainer.innerHTML = "";

    for(
        let pageNumber = 1;
        pageNumber <= ReaderState.totalPages;
        pageNumber++
    ){

        const wrapper =
            document.createElement("div");

        wrapper.className = "thumbnail";

        wrapper.dataset.page =
            pageNumber;

        wrapper.innerHTML = `
            <canvas></canvas>
            <span class="pageNumber">
                ${pageNumber}
            </span>
        `;

        wrapper.addEventListener(
            "click",
            () => {

                goToPage(
                    pageNumber,
                    false
                );

                updateThumbnailState();
            }
        );

        DOM.thumbnailContainer.appendChild(
            wrapper
        );

        renderThumbnail(
            pageNumber,
            wrapper.querySelector("canvas")
        );
    }

    updateThumbnailState();
}

async function renderThumbnail(
    pageNumber,
    canvas
){

    try{

        const page =
            await ReaderState.pdf.getPage(
                pageNumber
            );

        const original =
            page.getViewport({
                scale:1
            });

        const width = 120;

        const scale =
            width / original.width;

        const viewport =
            page.getViewport({
                scale
            });

        const ratio =
            window.devicePixelRatio || 1;

        canvas.width =
            Math.floor(
                viewport.width * ratio
            );

        canvas.height =
            Math.floor(
                viewport.height * ratio
            );

        canvas.style.width =
            `${viewport.width}px`;

        canvas.style.height =
            `${viewport.height}px`;

        const context =
            canvas.getContext("2d");

        context.setTransform(
            ratio,
            0,
            0,
            ratio,
            0,
            0
        );

        await page.render({
            canvasContext:context,
            viewport
        }).promise;

    }catch(error){

        console.warn(
            "Thumbnail error:",
            error
        );
    }
}

function updateThumbnailState(){

    if(!DOM.thumbnailContainer){
        return;
    }

    const thumbnails =
        DOM.thumbnailContainer.querySelectorAll(
            ".thumbnail"
        );

    thumbnails.forEach(item => {

        const page =
            Number(item.dataset.page);

        item.classList.toggle(
            "active",
            page === ReaderState.currentPage
        );
    });
}

function toggleThumbnailSidebar(){

    if(!DOM.thumbnailSidebar){
        return;
    }

    DOM.thumbnailSidebar.classList.toggle(
        "active"
    );
}


/*==================== COMMENTS ====================*/

function loadComments(){

    const comments =
        getStorage(
            "comments",
            []
        );

    if(!Array.isArray(comments)){
        return;
    }

    renderComments(comments);
}

function getComments(){

    const comments =
        getStorage(
            "comments",
            []
        );

    return Array.isArray(comments)
        ? comments
        : [];
}

function saveComments(comments){

    saveStorage(
        "comments",
        comments
    );
}

function renderComments(comments){

    if(!DOM.commentList){
        return;
    }

    DOM.commentList.innerHTML = "";

    if(!comments.length){

        DOM.commentList.innerHTML = `
            <div class="emptyState">
                No comments yet.
            </div>
        `;

        return;
    }

    comments.forEach((comment,index) => {

        const item =
            document.createElement("div");

        item.className =
            "commentItem";

        item.innerHTML = `
            <strong>
                ${escapeHTML(
                    comment.name || "Reader"
                )}
            </strong>

            <p>
                ${escapeHTML(
                    comment.message || ""
                )}
            </p>

            <div class="commentActions">
                <button
                    type="button"
                    data-delete-comment="${index}">
                    Delete
                </button>
            </div>
        `;

        const deleteButton =
            item.querySelector(
                "[data-delete-comment]"
            );

        deleteButton?.addEventListener(
            "click",
            () => {

                const updated =
                    getComments();

                updated.splice(
                    index,
                    1
                );

                saveComments(updated);

                renderComments(updated);

                showToast(
                    "Comment deleted."
                );
            }
        );

        DOM.commentList.appendChild(item);
    });
}

function submitComment(){

    const name =
        DOM.commentName?.value.trim();

    const message =
        DOM.commentMessage?.value.trim();

    if(!message){

        showToast(
            "Please write a comment first."
        );

        return;
    }

    const comments =
        getComments();

    comments.unshift({
        name:
            name || "Reader",

        message,

        page:
            ReaderState.currentPage,

        createdAt:
            new Date().toISOString()
    });

    saveComments(comments);

    renderComments(comments);

    if(DOM.commentName){
        DOM.commentName.value = "";
    }

    if(DOM.commentMessage){
        DOM.commentMessage.value = "";
    }

    showToast(
        "Comment added."
    );
}

function toggleComments(){

    if(!DOM.commentPanel){
        return;
    }

    DOM.commentPanel.classList.toggle(
        "active"
    );

    if(
        DOM.commentPanel.classList.contains(
            "active"
        )
    ){
        renderComments(
            getComments()
        );
    }
}


/*==================== SETTINGS PANEL ====================*/

function toggleSettings(){

    if(!DOM.settingsPanel){
        return;
    }

    DOM.settingsPanel.classList.toggle(
        "active"
    );
}

function closeSettings(){

    DOM.settingsPanel?.classList.remove(
        "active"
    );
}


/*==================== SHARE ====================*/

function openShare(){

    if(!DOM.sharePanel){
        return;
    }

    DOM.sharePanel.classList.add(
        "active"
    );
}

function closeShare(){

    DOM.sharePanel?.classList.remove(
        "active"
    );
}

async function copyCurrentLink(){

    const url =
        window.location.href;

    try{

        await navigator.clipboard.writeText(
            url
        );

        showToast(
            "Link copied."
        );

    }catch(error){

        const temporary =
            document.createElement("textarea");

        temporary.value = url;

        document.body.appendChild(
            temporary
        );

        temporary.select();

        document.execCommand(
            "copy"
        );

        temporary.remove();

        showToast(
            "Link copied."
        );
    }
}

async function nativeShare(){

    const data = {
        title:
            DOM.bookTitle?.textContent ||
            "Chishti Library",

        text:
            "Read this book in Chishti Library.",

        url:
            window.location.href
    };

    if(
        navigator.share
    ){

        try{

            await navigator.share(
                data
            );

        }catch(error){

            if(
                error.name !==
                "AbortError"
            ){
                console.warn(
                    "Share failed:",
                    error
                );
            }
        }

    }else{

        await copyCurrentLink();
    }
}


/*==================== FULLSCREEN ====================*/

async function toggleFullscreen(){

    try{

        if(!document.fullscreenElement){

            await document.documentElement
                .requestFullscreen();

            document.body.classList.add(
                "fullscreen"
            );

        }else{

            await document.exitFullscreen();

            document.body.classList.remove(
                "fullscreen"
            );
        }

    }catch(error){

        console.warn(
            "Fullscreen error:",
            error
        );

        showToast(
            "Fullscreen is not available."
        );
    }
}

document.addEventListener(
    "fullscreenchange",
    () => {

        const active =
            Boolean(
                document.fullscreenElement
            );

        document.body.classList.toggle(
            "fullscreen",
            active
        );

        DOM.fullscreenBtn?.classList.toggle(
            "active",
            active
        );
    }
);


/*==================== READING PROGRESS ====================*/

function saveReadingProgress(){

    if(!ReaderState.autoSave){
        return;
    }

    saveStorage(
        "currentPage",
        ReaderState.currentPage
    );

    saveStorage(
        "zoom",
        ReaderState.zoom
    );
}

function loadSavedState(){

    loadBookmarks();

    loadLikeState();

    loadTheme();

    loadSettings();

    loadComments();

    const savedPage =
        Number(
            getStorage(
                "currentPage",
                1
            )
        );

    const savedZoom =
        Number(
            getStorage(
                "zoom",
                ReaderConfig.defaultZoom
            )
        );

    ReaderState.zoom =
        Math.max(
            ReaderConfig.minZoom,
            Math.min(
                ReaderConfig.maxZoom,
                savedZoom || 1
            )
        );

    if(
        savedPage >= 1 &&
        savedPage <= ReaderState.totalPages
    ){

        ReaderState.currentPage =
            savedPage;
    }

    updateUI();

    buildBookmarkList();
}

function resetReadingProgress(){

    ReaderState.currentPage = 1;

    ReaderState.zoom =
        ReaderConfig.defaultZoom;

    saveStorage(
        "currentPage",
        1
    );

    saveStorage(
        "zoom",
        ReaderConfig.defaultZoom
    );

    renderPage(1);

    updateUI();

    showToast(
        "Reading progress reset."
    );
}


/*==================== KEYBOARD CONTROLS ====================*/

document.addEventListener(
    "keydown",
    event => {

        const target =
            event.target;

        const typing =
            target instanceof HTMLInputElement ||
            target instanceof HTMLTextAreaElement ||
            target?.isContentEditable;

        if(typing){
            return;
        }

        switch(event.key){

            case "ArrowRight":
            case "PageDown":
                event.preventDefault();
                nextReaderPage();
                break;

            case "ArrowLeft":
            case "PageUp":
                event.preventDefault();
                previousReaderPage();
                break;

            case "+":
            case "=":
                event.preventDefault();
                zoomIn();
                break;

            case "-":
            case "_":
                event.preventDefault();
                zoomOut();
                break;

            case "0":
                event.preventDefault();
                fitPage();
                break;

            case "f":
            case "F":
                event.preventDefault();
                toggleFullscreen();
                break;

            case "b":
            case "B":
                event.preventDefault();
                toggleBookmark();
                break;

            case "Escape":
                closeSidebar();
                closeSearch();
                closeSettings();
                closeShare();
                break;
        }
    }
);


/*==================== END PART 3 ====================*/
/*==================================================
        CHISHTI LIBRARY READER V3
              reader.js — PART 4
==================================================*/

/*==================== BUTTON EVENTS ====================*/

function setupButtonEvents(){

    DOM.menuBtn?.addEventListener(
        "click",
        toggleSidebar
    );

    DOM.closeSidebar?.addEventListener(
        "click",
        closeSidebar
    );

    DOM.prevBtn?.addEventListener(
        "click",
        previousReaderPage
    );

    DOM.nextBtn?.addEventListener(
        "click",
        nextReaderPage
    );

    DOM.previousPage?.addEventListener(
        "click",
        previousReaderPage
    );

    DOM.nextPage?.addEventListener(
        "click",
        nextReaderPage
    );

    DOM.zoomInBtn?.addEventListener(
        "click",
        zoomIn
    );

    DOM.zoomOutBtn?.addEventListener(
        "click",
        zoomOut
    );

    DOM.fitBtn?.addEventListener(
        "click",
        fitPage
    );

    DOM.bookmarkBtn?.addEventListener(
        "click",
        toggleBookmark
    );

    DOM.likeBtn?.addEventListener(
        "click",
        toggleLike
    );

    DOM.shareBtn?.addEventListener(
        "click",
        openShare
    );

    DOM.shareClose?.addEventListener(
        "click",
        closeShare
    );

    DOM.copyLinkBtn?.addEventListener(
        "click",
        copyCurrentLink
    );

    DOM.nativeShareBtn?.addEventListener(
        "click",
        nativeShare
    );

    DOM.fullscreenBtn?.addEventListener(
        "click",
        toggleFullscreen
    );

    DOM.thumbnailBtn?.addEventListener(
        "click",
        toggleThumbnailSidebar
    );

    DOM.commentsBtn?.addEventListener(
        "click",
        toggleComments
    );

    DOM.searchBtn?.addEventListener(
        "click",
        openSearch
    );

    DOM.searchClose?.addEventListener(
        "click",
        closeSearch
    );

    DOM.themeBtn?.addEventListener(
        "click",
        toggleTheme
    );

    DOM.commentSubmit?.addEventListener(
        "click",
        submitComment
    );


    /*==================== SETTINGS ====================*/

    DOM.darkMode?.addEventListener(
        "change",
        event => {

            ReaderState.darkMode =
                event.target.checked;

            applyTheme();

            saveStorage(
                "darkMode",
                ReaderState.darkMode
            );
        }
    );

    DOM.pageShadow?.addEventListener(
        "change",
        event => {

            ReaderState.pageShadow =
                event.target.checked;

            applySettings();

            saveStorage(
                "pageShadow",
                ReaderState.pageShadow
            );
        }
    );

    DOM.pageAnimation?.addEventListener(
        "change",
        event => {

            ReaderState.pageAnimation =
                event.target.checked;

            applySettings();

            saveStorage(
                "pageAnimation",
                ReaderState.pageAnimation
            );
        }
    );

    DOM.autoSave?.addEventListener(
        "change",
        event => {

            ReaderState.autoSave =
                event.target.checked;

            applySettings();

            saveStorage(
                "autoSave",
                ReaderState.autoSave
            );
        }
    );


    /*==================== SEARCH ====================*/

    let searchTimer = null;

    DOM.searchInput?.addEventListener(
        "input",
        event => {

            clearTimeout(searchTimer);

            const query =
                event.target.value;

            searchTimer =
                setTimeout(
                    () => searchPDF(query),
                    350
                );
        }
    );

    DOM.searchInput?.addEventListener(
        "keydown",
        event => {

            if(event.key === "Escape"){
                closeSearch();
            }
        }
    );


    /*==================== PAGE INPUT ====================*/

    DOM.pageInput?.addEventListener(
        "keydown",
        event => {

            if(event.key !== "Enter"){
                return;
            }

            const page =
                Number(
                    event.target.value
                );

            goToPage(
                page,
                false
            );
        }
    );


    /*==================== PDF FILE INPUT ====================*/

    DOM.pdfInput?.addEventListener(
        "change",
        async event => {

            const file =
                event.target.files?.[0];

            if(!file){
                return;
            }

            if(
                file.type !==
                "application/pdf"
            ){

                showToast(
                    "Please select a PDF file."
                );

                return;
            }

            await loadPDF({
                data:
                    await file.arrayBuffer()
            });
        }
    );
}


/*==================== FILE DROP ====================*/

function setupFileDrop(){

    if(!DOM.pdfContainer){
        return;
    }

    [
        "dragenter",
        "dragover"
    ].forEach(type => {

        DOM.pdfContainer.addEventListener(
            type,
            event => {

                event.preventDefault();
                event.stopPropagation();

                DOM.pdfContainer.classList.add(
                    "dragOver"
                );
            }
        );
    });

    [
        "dragleave",
        "drop"
    ].forEach(type => {

        DOM.pdfContainer.addEventListener(
            type,
            event => {

                event.preventDefault();
                event.stopPropagation();

                DOM.pdfContainer.classList.remove(
                    "dragOver"
                );
            }
        );
    });

    DOM.pdfContainer.addEventListener(
        "drop",
        async event => {

            const file =
                event.dataTransfer.files?.[0];

            if(!file){
                return;
            }

            if(
                file.type !==
                "application/pdf"
            ){

                showToast(
                    "Only PDF files are supported."
                );

                return;
            }

            try{

                await loadPDF({
                    data:
                        await file.arrayBuffer()
                });

            }catch(error){

                console.error(error);

                showToast(
                    "Could not open the PDF."
                );
            }
        }
    );
}


/*==================== WHEEL ZOOM ====================*/

function setupWheelZoom(){

    if(!DOM.pdfContainer){
        return;
    }

    DOM.pdfContainer.addEventListener(
        "wheel",
        event => {

            if(!event.ctrlKey){
                return;
            }

            event.preventDefault();

            if(event.deltaY < 0){
                zoomIn();
            }else{
                zoomOut();
            }
        },
        {
            passive:false
        }
    );
}


/*==================== TOUCH SWIPE ====================*/

function setupTouchNavigation(){

    if(!DOM.pdfContainer){
        return;
    }

    let startX = 0;
    let startY = 0;

    DOM.pdfContainer.addEventListener(
        "touchstart",
        event => {

            const touch =
                event.changedTouches[0];

            startX =
                touch.clientX;

            startY =
                touch.clientY;
        },
        {
            passive:true
        }
    );

    DOM.pdfContainer.addEventListener(
        "touchend",
        event => {

            const touch =
                event.changedTouches[0];

            const endX =
                touch.clientX;

            const endY =
                touch.clientY;

            const deltaX =
                endX - startX;

            const deltaY =
                endY - startY;

            if(
                Math.abs(deltaX) < 60 ||
                Math.abs(deltaX) <
                Math.abs(deltaY)
            ){
                return;
            }

            if(deltaX < 0){
                nextReaderPage();
            }else{
                previousReaderPage();
            }
        },
        {
            passive:true
        }
    );
}


/*==================== RESIZE ====================*/

let resizeTimer = null;

window.addEventListener(
    "resize",
    () => {

        clearTimeout(resizeTimer);

        resizeTimer =
            setTimeout(
                () => {

                    if(
                        ReaderState.pdf &&
                        !ReaderState.rendering
                    ){

                        renderPage(
                            ReaderState.currentPage
                        );
                    }

                },
                180
            );
    }
);


/*==================== BEFORE UNLOAD ====================*/

window.addEventListener(
    "beforeunload",
    () => {

        if(ReaderState.autoSave){
            saveReadingProgress();
        }
    }
);


/*==================== START READER ====================*/

async function initializeReader(){

    loadBookInformation();

    loadTheme();

    loadSettings();

    loadBookmarks();

    loadLikeState();

    setupButtonEvents();

    setupFileDrop();

    setupWheelZoom();

    setupTouchNavigation();

    updateUI();

    await loadPDF(
        ReaderConfig.pdfUrl
    );
}


/*==================== DOM READY ====================*/

if(
    document.readyState ===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        initializeReader,
        {
            once:true
        }
    );

}else{

    initializeReader();
}


/*==================== GLOBAL API ====================*/

window.ChishtiReader = {

    nextPage:
        nextReaderPage,

    previousPage:
        previousReaderPage,

    goToPage,

    zoomIn,

    zoomOut,

    fitPage,

    toggleBookmark,

    toggleLike,

    toggleTheme,

    toggleFullscreen,

    openSearch,

    openShare,

    loadPDF,

    resetReadingProgress
};


/*==================== END CSS PART 4 ====================*/
/*==================================================
        CHISHTI LIBRARY READER V3
              reader.js — PART 5
==================================================*/

/*==================== EXTRA SAFETY ====================*/

(function(){

    "use strict";

    /* Prevent duplicate initialization */
    if(window.__CHISHTI_READER_PART5_LOADED){
        return;
    }

    window.__CHISHTI_READER_PART5_LOADED = true;


    /*==================== CLOSE ALL PANELS ====================*/

    window.closeAllReaderPanels = function(){

        DOM.leftSidebar?.classList.remove("active");
        DOM.searchPanel?.classList.remove("active");
        DOM.commentPanel?.classList.remove("active");
        DOM.settingsPanel?.classList.remove("active");
        DOM.sharePanel?.classList.remove("active");
        DOM.thumbnailSidebar?.classList.remove("active");

    };


    /*==================== ESC KEY ====================*/

    document.addEventListener(
        "keydown",
        function(event){

            if(event.key !== "Escape"){
                return;
            }

            closeAllReaderPanels();

        }
    );


    /*==================== CLICK OUTSIDE ====================*/

    document.addEventListener(
        "click",
        function(event){

            const target = event.target;

            if(
                DOM.searchPanel &&
                DOM.searchPanel.classList.contains("active") &&
                !DOM.searchPanel.contains(target) &&
                !DOM.searchBtn?.contains(target)
            ){
                DOM.searchPanel.classList.remove("active");
            }

            if(
                DOM.sharePanel &&
                DOM.sharePanel.classList.contains("active") &&
                !DOM.sharePanel.contains(target) &&
                !DOM.shareBtn?.contains(target)
            ){
                DOM.sharePanel.classList.remove("active");
            }

        }
    );


    /*==================== PAGE NUMBER VALIDATION ====================*/

    window.validatePageNumber = function(value){

        let page = parseInt(value,10);

        if(Number.isNaN(page)){
            page = 1;
        }

        page = Math.max(
            1,
            Math.min(
                ReaderState.totalPages || 1,
                page
            )
        );

        return page;
    };


    /*==================== PAGE INPUT ====================*/

    if(DOM.pageInput){

        DOM.pageInput.addEventListener(
            "change",
            function(){

                const page =
                    validatePageNumber(
                        this.value
                    );

                this.value = page;

                goToPage(
                    page,
                    false
                );

            }
        );

    }


    /*==================== DOUBLE CLICK ZOOM ====================*/

    if(DOM.pdfContainer){

        DOM.pdfContainer.addEventListener(
            "dblclick",
            function(event){

                if(
                    event.target !== DOM.pdfCanvas
                ){
                    return;
                }

                if(
                    ReaderState.zoom <= 1
                ){

                    setZoom(1.5);

                }else{

                    fitPage();

                }

            }
        );

    }


    /*==================== MOUSE WHEEL PAGE ====================*/

    if(DOM.pdfContainer){

        DOM.pdfContainer.addEventListener(
            "wheel",
            function(event){

                if(event.ctrlKey){
                    return;
                }

                /*
                 * Only navigate when the PDF is
                 * not zoomed.
                 */

                if(
                    ReaderState.zoom > 1
                ){
                    return;
                }

                if(
                    Math.abs(event.deltaY) < 35
                ){
                    return;
                }

                if(event.deltaY > 0){
                    nextReaderPage();
                }else{
                    previousReaderPage();
                }

            },
            {
                passive:true
            }
        );

    }


    /*==================== SAVE ON PAGE CHANGE ====================*/

    window.addEventListener(
        "pagehide",
        function(){

            if(
                typeof saveReadingProgress ===
                "function"
            ){
                saveReadingProgress();
            }

        }
    );


    /*==================== CONNECTION STATUS ====================*/

    window.addEventListener(
        "offline",
        function(){

            showToast(
                "You are offline."
            );

        }
    );

    window.addEventListener(
        "online",
        function(){

            showToast(
                "Connection restored."
            );

        }
    );


    /*==================== PREVENT BROKEN IMAGE DRAG ====================*/

    document.addEventListener(
        "dragstart",
        function(event){

            if(
                event.target.tagName === "IMG"
            ){
                event.preventDefault();
            }

        }
    );


    /*==================== PDF TEXT SELECTION ====================*/

    if(DOM.pdfCanvas){

        DOM.pdfCanvas.addEventListener(
            "contextmenu",
            function(event){

                /*
                 * Keep browser context menu available.
                 * This avoids breaking mobile/desktop
                 * accessibility.
                 */

            }
        );

    }


    /*==================== AUTO SAVE TIMER ====================*/

    let autoSaveTimer = null;

    function startAutoSave(){

        clearInterval(autoSaveTimer);

        autoSaveTimer =
            setInterval(
                function(){

                    if(
                        ReaderState.autoSave &&
                        ReaderState.pdf
                    ){

                        saveReadingProgress();

                    }

                },
                10000
            );
    }

    startAutoSave();


    /*==================== CLEANUP ====================*/

    window.addEventListener(
        "unload",
        function(){

            clearInterval(
                autoSaveTimer
            );

        }
    );


    /*==================== DEBUG API ====================*/

    window.ChishtiReaderDebug = {

        state:
            ReaderState,

        dom:
            DOM,

        config:
            ReaderConfig,

        reload:
            function(){

                location.reload();

            },

        clearStorage:
            function(){

                Object.keys(localStorage)
                    .filter(
                        key =>
                            key.startsWith(
                                ReaderConfig.storagePrefix
                            )
                    )
                    .forEach(
                        key =>
                            localStorage.removeItem(
                                key
                            )
                    );

                showToast(
                    "Reader data cleared."
                );

            }

    };


})();
/*==================================================
        CHISHTI LIBRARY READER V3
              reader.js — PART 6
==================================================*/

/*==================== FINAL INIT SAFETY ====================*/

(function(){

    "use strict";

    if(window.__CHISHTI_READER_FINAL){
        return;
    }

    window.__CHISHTI_READER_FINAL = true;


    /*==================== SAFE ELEMENT HELPER ====================*/

    function on(element, event, handler, options){

        if(!element){
            return;
        }

        element.addEventListener(
            event,
            handler,
            options
        );
    }


    /*==================== OPEN PDF BUTTON ====================*/

    const openPdfBtn =
        document.getElementById("openPdfBtn");

    on(
        openPdfBtn,
        "click",
        function(){

            if(DOM.pdfInput){
                DOM.pdfInput.click();
            }

        }
    );


    /*==================== SETTINGS BUTTON ====================*/

    const settingsBtn =
        document.getElementById("settingsBtn");

    on(
        settingsBtn,
        "click",
        toggleSettings
    );


    /*==================== RESET BUTTON ====================*/

    const resetBtn =
        document.getElementById("resetBtn");

    on(
        resetBtn,
        "click",
        function(){

            const confirmed =
                window.confirm(
                    "Reset reading progress?"
                );

            if(!confirmed){
                return;
            }

            resetReadingProgress();

        }
    );


    /*==================== PAGE INPUT BLUR ====================*/

    on(
        DOM.pageInput,
        "blur",
        function(){

            const page =
                validatePageNumber(
                    this.value
                );

            this.value = page;

        }
    );


    /*==================== ENTER PAGE ====================*/

    on(
        DOM.pageInput,
        "keydown",
        function(event){

            if(event.key !== "Enter"){
                return;
            }

            event.preventDefault();

            const page =
                validatePageNumber(
                    this.value
                );

            this.value = page;

            goToPage(
                page,
                false
            );

        }
    );


    /*==================== RANGE ZOOM ====================*/

    const zoomRange =
        document.getElementById("zoomRange");

    on(
        zoomRange,
        "input",
        function(){

            const value =
                Number(this.value);

            setZoom(value);

        }
    );


    /*==================== READER BODY CLICK ====================*/

    on(
        DOM.readerBody,
        "click",
        function(event){

            /*
             * Prevent accidental page navigation
             * when clicking controls.
             */

            if(
                event.target.closest("button") ||
                event.target.closest("input") ||
                event.target.closest("textarea") ||
                event.target.closest(
                    "#leftSidebar"
                ) ||
                event.target.closest(
                    "#searchPanel"
                ) ||
                event.target.closest(
                    "#settingsPanel"
                ) ||
                event.target.closest(
                    "#sharePanel"
                )
            ){
                return;
            }

        }
    );


    /*==================== BEFORE PAGE UNLOAD ====================*/

    window.addEventListener(
        "beforeunload",
        function(){

            try{

                if(
                    ReaderState.autoSave &&
                    ReaderState.pdf
                ){

                    saveReadingProgress();

                }

            }catch(error){

                console.warn(
                    "Could not save reader state:",
                    error
                );

            }

        }
    );


    /*==================== INITIAL STATE ====================*/

    function finalStateCheck(){

        if(
            !ReaderState.pdf
        ){
            return;
        }

        if(
            ReaderState.currentPage < 1
        ){
            ReaderState.currentPage = 1;
        }

        if(
            ReaderState.currentPage >
            ReaderState.totalPages
        ){
            ReaderState.currentPage =
                ReaderState.totalPages;
        }

        ReaderState.zoom =
            Math.max(
                ReaderConfig.minZoom,
                Math.min(
                    ReaderConfig.maxZoom,
                    ReaderState.zoom
                )
            );

        updateUI();

        updateThumbnailState();

    }


    /*==================== PDF LOAD ERROR HANDLER ====================*/

    window.addEventListener(
        "error",
        function(event){

            if(
                String(
                    event?.message || ""
                ).toLowerCase().includes("pdf")
            ){

                console.error(
                    "Reader error:",
                    event.error || event.message
                );

            }

        }
    );


    /*==================== UNHANDLED PROMISE ====================*/

    window.addEventListener(
        "unhandledrejection",
        function(event){

            console.error(
                "Reader promise error:",
                event.reason
            );

        }
    );


    /*==================== FINAL CHECK ====================*/

    setTimeout(
        finalStateCheck,
        500
    );


    /*==================== PUBLIC HELPERS ====================*/

    window.ChishtiReader.openPDF =
        function(){

            if(DOM.pdfInput){
                DOM.pdfInput.click();
            }

        };

    window.ChishtiReader.settings =
        function(){

            toggleSettings();

        };

    window.ChishtiReader.bookmarks =
        function(){

            openSidebar();

        };

    window.ChishtiReader.comments =
        function(){

            toggleComments();

        };

    window.ChishtiReader.search =
        function(){

            openSearch();

        };


    /*==================== FINAL MESSAGE ====================*/

    console.log(
        "Chishti Library Reader V3 initialized."
    );

})();
