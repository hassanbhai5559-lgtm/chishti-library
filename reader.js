/*==================================================
        CHISHTI LIBRARY READER V4
        JS PART 3
        PDF.JS + READER CORE + NAVIGATION
==================================================*/

"use strict";


/*==================================================
                    PDF.JS
==================================================*/

if (typeof pdfjsLib !== "undefined") {

    pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

}


/*==================================================
                    GLOBAL STATE
==================================================*/

const ReaderState = {

    pdf: null,

    currentPage: 1,

    totalPages: 0,

    zoom: 1,

    minZoom: 0.5,

    maxZoom: 3,

    zoomStep: 0.1,

    doublePage: false,

    currentTheme: "dark",

    isRendering: false,

    bookUrl: null,

    bookTitle: "Untitled Book",

    bookmarks: [],

    likes: 0,

    comments: [],

    searchResults: [],

    searchIndex: 0

};


/*==================================================
                    DOM HELPER
==================================================*/

function $(id) {

    return document.getElementById(id);

}


/*==================================================
                    ELEMENTS
==================================================*/

const Elements = {

    body: document.body,

    app: $("readerApp"),

    loadingScreen: $("loadingScreen"),

    loadingMessage: $("loadingMessage"),

    loadingProgress: $("loadingProgress"),

    loadingPercent: $("loadingPercent"),

    transition: $("readerTransition"),

    pdfArea: $("pdfArea"),

    pdfContainer: $("pdfContainer"),

    canvas1: $("pdfCanvas"),

    canvas2: $("pdfCanvas2"),

    pageLoading: $("pageLoading"),

    currentPage: $("currentPage"),

    totalPages: $("totalPages"),

    pageInfo: $("pageInfo"),

    zoomValue: $("zoomValue"),

    progressFill: $("readingProgressFill"),

    bookTitle: $("bookTitle"),

    searchBar: $("searchBar"),

    searchInput: $("searchInput"),

    searchStatus: $("searchStatus"),

    settingsPanel: $("settingsPanel"),

    sidebar: $("readerSidebar"),

    commentsPanel: $("commentsPanel"),

    toast: $("toast")

};


/*==================================================
                TOAST MESSAGE
==================================================*/

function showToast(message) {

    if (!Elements.toast) return;

    Elements.toast.textContent = message;

    Elements.toast.classList.add("active");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {

        Elements.toast.classList.remove("active");

    }, 2200);

}


/*==================================================
                LOADING PROGRESS
==================================================*/

function setLoadingProgress(percent, message) {

    const value =
        Math.max(0, Math.min(100, percent));

    if (Elements.loadingProgress) {

        Elements.loadingProgress.style.width =
            `${value}%`;

    }

    if (Elements.loadingPercent) {

        Elements.loadingPercent.textContent =
            `${Math.round(value)}%`;

    }

    if (
        message &&
        Elements.loadingMessage
    ) {

        Elements.loadingMessage.textContent =
            message;

    }

}


/*==================================================
                HIDE LOADING
==================================================*/

function hideLoadingScreen() {

    if (!Elements.loadingScreen) return;

    setLoadingProgress(
        100,
        "Book Ready"
    );

    setTimeout(() => {

        Elements.loadingScreen.classList.add("hide");

        document.body.classList.add(
            "reader-ready"
        );

    }, 300);

}


/*==================================================
                SHOW PAGE LOADING
==================================================*/

function showPageLoading() {

    if (Elements.pageLoading) {

        Elements.pageLoading.style.display =
            "flex";

    }

}


/*==================================================
                HIDE PAGE LOADING
==================================================*/

function hidePageLoading() {

    if (Elements.pageLoading) {

        Elements.pageLoading.style.display =
            "none";

    }

}


/*==================================================
                FIND BOOK URL
==================================================*/

function getBookUrl() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const fromUrl =
        params.get("pdf") ||
        params.get("book") ||
        params.get("file");

    if (fromUrl) {

        return fromUrl;

    }


    if (
        window.ReaderConfig &&
        ReaderConfig.pdfUrl
    ) {

        return ReaderConfig.pdfUrl;

    }


    const pdfLink =
        document.querySelector(
            'a[href$=".pdf"], a[href*=".pdf?"]'
        );

    if (pdfLink) {

        return pdfLink.href;

    }


    return null;

}


/*==================================================
                BOOK TITLE
==================================================*/

function getBookTitle() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const title =
        params.get("title");

    if (title) {

        return title;

    }

    return "Untitled Book";

}


/*==================================================
                UPDATE BOOK TITLE
==================================================*/

function updateBookTitle() {

    ReaderState.bookTitle =
        getBookTitle();

    if (Elements.bookTitle) {

        Elements.bookTitle.textContent =
            ReaderState.bookTitle;

    }

}


/*==================================================
                LOAD PDF
==================================================*/

async function loadPDF(url) {

    if (
        !url ||
        typeof pdfjsLib === "undefined"
    ) {

        setLoadingProgress(
            100,
            "No PDF selected"
        );

        hideLoadingScreen();

        showToast(
            "PDF file not found"
        );

        return;

    }


    try {

        setLoadingProgress(
            10,
            "Opening Your Book..."
        );


        const loadingTask =
            pdfjsLib.getDocument({
                url:url
            });


        loadingTask.onProgress =
            function(progressData) {

                if (
                    progressData &&
                    progressData.total
                ) {

                    const percent =
                        (progressData.loaded /
                        progressData.total) *
                        70;

                    setLoadingProgress(
                        10 + percent,
                        "Loading Book..."
                    );

                }

            };


        ReaderState.pdf =
            await loadingTask.promise;


        ReaderState.bookUrl =
            url;

        ReaderState.totalPages =
            ReaderState.pdf.numPages;


        if (Elements.totalPages) {

            Elements.totalPages.textContent =
                ReaderState.totalPages;

        }


        setLoadingProgress(
            85,
            "Preparing Reader..."
        );


        await renderCurrentPages();


        updatePageUI();

        updateReadingProgress();

        setLoadingProgress(
            100,
            "Book Ready"
        );


        hideLoadingScreen();


    } catch (error) {

        console.error(
            "PDF loading error:",
            error
        );


        setLoadingProgress(
            100,
            "Unable to Load Book"
        );


        hidePageLoading();


        showToast(
            "Unable to load PDF"
        );

    }

}


/*==================================================
                RENDER ONE PAGE
==================================================*/

async function renderPage(
    pageNumber,
    canvas
) {

    if (
        !ReaderState.pdf ||
        !canvas
    ) {

        return;

    }


    if (
        pageNumber < 1 ||
        pageNumber >
        ReaderState.totalPages
    ) {

        canvas.style.display =
            "none";

        return;

    }


    const page =
        await ReaderState.pdf.getPage(
            pageNumber
        );


    const viewport =
        page.getViewport({
            scale:ReaderState.zoom
        });


    const context =
        canvas.getContext("2d");


    canvas.width =
        viewport.width;

    canvas.height =
        viewport.height;


    canvas.style.width =
        `${viewport.width}px`;

    canvas.style.height =
        `${viewport.height}px`;

    canvas.style.display =
        "block";


    await page.render({

        canvasContext:context,

        viewport:viewport

    }).promise;

}


/*==================================================
                RENDER CURRENT PAGES
==================================================*/

async function renderCurrentPages() {

    if (
        !ReaderState.pdf ||
        ReaderState.isRendering
    ) {

        return;

    }


    ReaderState.isRendering =
        true;


    showPageLoading();


    try {

        const firstPage =
            ReaderState.currentPage;


        await renderPage(
            firstPage,
            Elements.canvas1
        );


        if (
            ReaderState.doublePage &&
            firstPage <
            ReaderState.totalPages
        ) {

            await renderPage(
                firstPage + 1,
                Elements.canvas2
            );

        } else {

            Elements.canvas2.style.display =
                "none";

        }


    } catch (error) {

        console.error(
            "Page rendering error:",
            error
        );

        showToast(
            "Page rendering failed"
        );

    } finally {

        ReaderState.isRendering =
            false;

        hidePageLoading();

    }

}


/*==================================================
                UPDATE PAGE UI
==================================================*/

function updatePageUI() {

    if (Elements.currentPage) {

        Elements.currentPage.value =
            ReaderState.currentPage;

    }


    if (Elements.totalPages) {

        Elements.totalPages.textContent =
            ReaderState.totalPages;

    }


    if (Elements.pageInfo) {

        Elements.pageInfo.textContent =
            `Page ${ReaderState.currentPage} of ${ReaderState.totalPages}`;

    }


    updateNavigationButtons();

}


/*==================================================
                NAVIGATION BUTTONS
==================================================*/

function updateNavigationButtons() {

    const previousButtons = [

        $("prevBtn"),

        $("previousPage")

    ];


    const nextButtons = [

        $("nextBtn"),

        $("nextPage")

    ];


    previousButtons.forEach(
        button => {

            if (button) {

                button.disabled =
                    ReaderState.currentPage <= 1;

            }

        }
    );


    nextButtons.forEach(
        button => {

            if (button) {

                const nextPage =
                    ReaderState.doublePage
                        ? ReaderState.currentPage + 2
                        : ReaderState.currentPage + 1;

                button.disabled =
                    nextPage >
                    ReaderState.totalPages;

            }

        }
    );

}


/*==================================================
                GO TO PAGE
==================================================*/

async function goToPage(pageNumber) {

    if (
        !ReaderState.pdf ||
        ReaderState.isRendering
    ) {

        return;

    }


    let page =
        parseInt(
            pageNumber,
            10
        );


    if (Number.isNaN(page)) {

        page = ReaderState.currentPage;

    }


    page =
        Math.max(
            1,
            Math.min(
                page,
                ReaderState.totalPages
            )
        );


    if (
        ReaderState.doublePage &&
        page > 1 &&
        page % 2 === 0
    ) {

        page -= 1;

    }


    ReaderState.currentPage =
        page;


    await renderCurrentPages();


    updatePageUI();

    updateReadingProgress();

    saveReaderState();

}


/*==================================================
                NEXT PAGE
==================================================*/

function nextReaderPage() {

    if (
        ReaderState.doublePage
    ) {

        goToPage(
            ReaderState.currentPage + 2
        );

    } else {

        goToPage(
            ReaderState.currentPage + 1
        );

    }

}


/*==================================================
                PREVIOUS PAGE
==================================================*/

function previousReaderPage() {

    if (
        ReaderState.doublePage
    ) {

        goToPage(
            ReaderState.currentPage - 2
        );

    } else {

        goToPage(
            ReaderState.currentPage - 1
        );

    }

}


/*==================================================
                ZOOM
==================================================*/

async function setZoom(value) {

    const zoom =
        Math.max(
            ReaderState.minZoom,
            Math.min(
                ReaderState.maxZoom,
                value
            )
        );


    ReaderState.zoom =
        Math.round(
            zoom * 100
        ) / 100;


    if (Elements.zoomValue) {

        Elements.zoomValue.textContent =
            `${Math.round(
                ReaderState.zoom * 100
            )}%`;

    }


    await renderCurrentPages();

    saveReaderState();

}


/*==================================================
                ZOOM IN
==================================================*/

function zoomIn() {

    setZoom(
        ReaderState.zoom +
        ReaderState.zoomStep
    );

}


/*==================================================
                ZOOM OUT
==================================================*/

function zoomOut() {

    setZoom(
        ReaderState.zoom -
        ReaderState.zoomStep
    );

}


/*==================================================
                FIT PAGE
==================================================*/

async function fitPage() {

    if (
        !ReaderState.pdf ||
        !Elements.pdfArea
    ) {

        return;

    }


    const page =
        await ReaderState.pdf.getPage(
            ReaderState.currentPage
        );


    const baseViewport =
        page.getViewport({
            scale:1
        });


    const areaWidth =
        Elements.pdfArea.clientWidth -
        80;


    const areaHeight =
        Elements.pdfArea.clientHeight -
        70;


    let scale =
        Math.min(
            areaWidth /
                baseViewport.width,
            areaHeight /
                baseViewport.height
        );


    if (
        ReaderState.doublePage
    ) {

        scale =
            Math.min(
                scale,
                (
                    areaWidth - 30
                ) /
                (
                    baseViewport.width * 2
                )
            );

    }


    await setZoom(
        Math.max(
            ReaderState.minZoom,
            Math.min(
                ReaderState.maxZoom,
                scale
            )
        )
    );

}


/*==================================================
                READING PROGRESS
==================================================*/

function updateReadingProgress() {

    if (
        !Elements.progressFill ||
        ReaderState.totalPages <= 0
    ) {

        return;

    }


    const progress =
        (
            ReaderState.currentPage /
            ReaderState.totalPages
        ) * 100;


    Elements.progressFill.style.width =
        `${progress}%`;

}


/*==================================================
                PAGE INPUT
==================================================*/

function handlePageInput() {

    if (!Elements.currentPage) {

        return;

    }


    const value =
        parseInt(
            Elements.currentPage.value,
            10
        );


    if (
        !Number.isNaN(value)
    ) {

        goToPage(value);

    }

}


/*==================================================
                KEYBOARD CONTROLS
==================================================*/

function handleKeyboard(event) {

    const target =
        event.target;


    if (
        target &&
        (
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA"
        )
    ) {

        return;

    }


    if (event.key === "ArrowRight") {

        nextReaderPage();

    }


    if (event.key === "ArrowLeft") {

        previousReaderPage();

    }


    if (
        event.key === "+" ||
        event.key === "="
    ) {

        zoomIn();

    }


    if (
        event.key === "-" ||
        event.key === "_"
    ) {

        zoomOut();

    }


    if (
        event.key === "f" ||
        event.key === "F"
    ) {

        fitPage();

    }

}


/*==================================================
                DOUBLE PAGE
==================================================*/

async function setPageMode(mode) {

    ReaderState.doublePage =
        mode === "double";


    if (Elements.pdfContainer) {

        Elements.pdfContainer.classList.toggle(
            "double-page",
            ReaderState.doublePage
        );

        Elements.pdfContainer.classList.toggle(
            "single-page",
            !ReaderState.doublePage
        );

    }


    if (
        ReaderState.doublePage &&
        ReaderState.currentPage %
        2 === 0
    ) {

        ReaderState.currentPage--;

        if (
            ReaderState.currentPage < 1
        ) {

            ReaderState.currentPage = 1;

        }

    }


    await renderCurrentPages();

    updatePageUI();

    saveReaderState();

}


/*==================================================
                SAVE READER STATE
==================================================*/

function saveReaderState() {

    try {

        localStorage.setItem(
            "chishti-reader-state",
            JSON.stringify({

                page:
                    ReaderState.currentPage,

                zoom:
                    ReaderState.zoom,

                doublePage:
                    ReaderState.doublePage

            })
        );

    } catch (error) {

        console.warn(
            "Unable to save reader state",
            error
        );

    }

}


/*==================================================
                LOAD READER STATE
==================================================*/

function loadReaderState() {

    try {

        const saved =
            localStorage.getItem(
                "chishti-reader-state"
            );


        if (!saved) {

            return;

        }


        const state =
            JSON.parse(saved);


        if (
            Number.isFinite(
                state.page
            )
        ) {

            ReaderState.currentPage =
                Math.max(
                    1,
                    state.page
                );

        }


        if (
            Number.isFinite(
                state.zoom
            )
        ) {

            ReaderState.zoom =
                Math.max(
                    ReaderState.minZoom,
                    Math.min(
                        ReaderState.maxZoom,
                        state.zoom
                    )
                );

        }


        if (
            typeof state.doublePage ===
            "boolean"
        ) {

            ReaderState.doublePage =
                state.doublePage;

        }

    } catch (error) {

        console.warn(
            "Unable to load reader state",
            error
        );

    }

}


/*==================================================
                INITIALIZE READER
==================================================*/

async function initializeReader() {

    document.body.classList.add(
        "reader-opening"
    );


    updateBookTitle();

    loadReaderState();


    if (Elements.zoomValue) {

        Elements.zoomValue.textContent =
            `${Math.round(
                ReaderState.zoom * 100
            )}%`;

    }


    if (Elements.pdfContainer) {

        Elements.pdfContainer.classList.toggle(
            "double-page",
            ReaderState.doublePage
        );

        Elements.pdfContainer.classList.toggle(
            "single-page",
            !ReaderState.doublePage
        );

    }


    const url =
        getBookUrl();


    await loadPDF(url);


    updatePageUI();


    document.body.classList.remove(
        "reader-opening"
    );

}


/*==================================================
                BASIC EVENTS
==================================================*/

function setupCoreEvents() {


    if ($("prevBtn")) {

        $("prevBtn").addEventListener(
            "click",
            previousReaderPage
        );

    }


    if ($("previousPage")) {

        $("previousPage").addEventListener(
            "click",
            previousReaderPage
        );

    }


    if ($("nextBtn")) {

        $("nextBtn").addEventListener(
            "click",
            nextReaderPage
        );

    }


    if ($("nextPage")) {

        $("nextPage").addEventListener(
            "click",
            nextReaderPage
        );

    }


    if ($("zoomInBtn")) {

        $("zoomInBtn").addEventListener(
            "click",
            zoomIn
        );

    }


    if ($("zoomOutBtn")) {

        $("zoomOutBtn").addEventListener(
            "click",
            zoomOut
        );

    }


    if ($("fitBtn")) {

        $("fitBtn").addEventListener(
            "click",
            fitPage
        );

    }


    if (Elements.currentPage) {

        Elements.currentPage.addEventListener(
            "change",
            handlePageInput
        );

        Elements.currentPage.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    handlePageInput();

                }

            }
        );

    }


    document.addEventListener(
        "keydown",
        handleKeyboard
    );

}


/*==================================================
                START
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupCoreEvents();

        initializeReader();

    }
);
/*==================================================
        CHISHTI LIBRARY READER V4
        JS PART 2
        THEME + SETTINGS + SIDEBAR + VIEW
==================================================*/


/*==================================================
                THEME SYSTEM
==================================================*/

function setReaderTheme(theme){

    const allowedThemes = [
        "dark",
        "light",
        "maroon",
        "gold"
    ];

    if(
        !allowedThemes.includes(theme)
    ){

        theme = "dark";

    }


    document.body.classList.remove(
        "theme-dark",
        "theme-light",
        "theme-maroon",
        "theme-gold"
    );


    document.body.classList.add(
        `theme-${theme}`
    );


    ReaderState.currentTheme =
        theme;


    try{

        localStorage.setItem(
            "chishti-theme",
            theme
        );

    }catch(error){

        console.warn(
            "Theme save failed:",
            error
        );

    }


    updateThemeButtons();

}


/*==================================================
                LOAD SAVED THEME
==================================================*/

function loadReaderTheme(){

    let savedTheme = "dark";


    try{

        savedTheme =
            localStorage.getItem(
                "chishti-theme"
            ) || "dark";

    }catch(error){

        savedTheme = "dark";

    }


    setReaderTheme(
        savedTheme
    );

}


/*==================================================
                THEME BUTTONS
==================================================*/

function updateThemeButtons(){

    const buttons =
        document.querySelectorAll(
            "[data-reader-theme]"
        );


    buttons.forEach(button => {

        const buttonTheme =
            button.getAttribute(
                "data-reader-theme"
            );


        button.classList.toggle(
            "active",
            buttonTheme ===
            ReaderState.currentTheme
        );

    });

}


/*==================================================
                SETTINGS PANEL
==================================================*/

function openSettings(){

    if(!Elements.settingsPanel){
        return;
    }


    Elements.settingsPanel.classList.add(
        "active"
    );


    const overlay =
        $("settingsOverlay");

    if(overlay){

        overlay.classList.add(
            "active"
        );

    }

}


function closeSettings(){

    if(Elements.settingsPanel){

        Elements.settingsPanel.classList.remove(
            "active"
        );

    }


    const overlay =
        $("settingsOverlay");

    if(overlay){

        overlay.classList.remove(
            "active"
        );

    }

}


function toggleSettings(){

    if(
        Elements.settingsPanel &&
        Elements.settingsPanel.classList.contains(
            "active"
        )
    ){

        closeSettings();

    }else{

        openSettings();

    }

}


/*==================================================
                SIDEBAR
==================================================*/

function openSidebar(){

    if(!Elements.sidebar){
        return;
    }


    Elements.sidebar.classList.add(
        "active"
    );


    const overlay =
        $("sidebarOverlay");

    if(overlay){

        overlay.classList.add(
            "active"
        );

    }

}


function closeSidebar(){

    if(Elements.sidebar){

        Elements.sidebar.classList.remove(
            "active"
        );

    }


    const overlay =
        $("sidebarOverlay");

    if(overlay){

        overlay.classList.remove(
            "active"
        );

    }

}


function toggleSidebar(){

    if(
        Elements.sidebar &&
        Elements.sidebar.classList.contains(
            "active"
        )
    ){

        closeSidebar();

    }else{

        openSidebar();

    }

}


/*==================================================
                COMMENTS PANEL
==================================================*/

function openComments(){

    if(!Elements.commentsPanel){
        return;
    }


    Elements.commentsPanel.classList.add(
        "active"
    );

}


function closeComments(){

    if(Elements.commentsPanel){

        Elements.commentsPanel.classList.remove(
            "active"
        );

    }

}


function toggleComments(){

    if(
        Elements.commentsPanel &&
        Elements.commentsPanel.classList.contains(
            "active"
        )
    ){

        closeComments();

    }else{

        openComments();

    }

}


/*==================================================
                SEARCH BAR
==================================================*/

function openSearch(){

    if(!Elements.searchBar){
        return;
    }


    Elements.searchBar.classList.add(
        "active"
    );


    if(Elements.searchInput){

        setTimeout(() => {

            Elements.searchInput.focus();

        },100);

    }

}


function closeSearch(){

    if(!Elements.searchBar){
        return;
    }


    Elements.searchBar.classList.remove(
        "active"
    );

}


function toggleSearch(){

    if(
        Elements.searchBar &&
        Elements.searchBar.classList.contains(
            "active"
        )
    ){

        closeSearch();

    }else{

        openSearch();

    }

}


/*==================================================
                PAGE SHADOW
==================================================*/

function setPageShadow(enabled){

    document.body.classList.toggle(
        "no-page-shadow",
        !enabled
    );


    try{

        localStorage.setItem(
            "chishti-page-shadow",
            enabled ? "1" : "0"
        );

    }catch(error){

        console.warn(
            "Page shadow save failed:",
            error
        );

    }


    const checkbox =
        $("pageShadow");

    if(checkbox){

        checkbox.checked =
            enabled;

    }

}


/*==================================================
                LOAD PAGE SHADOW
==================================================*/

function loadPageShadow(){

    let saved = "1";


    try{

        saved =
            localStorage.getItem(
                "chishti-page-shadow"
            ) || "1";

    }catch(error){

        saved = "1";

    }


    setPageShadow(
        saved === "1"
    );

}


/*==================================================
                DARK MODE
==================================================*/

function setDarkMode(enabled){

    if(enabled){

        setReaderTheme(
            "dark"
        );

    }else{

        setReaderTheme(
            "light"
        );

    }


    const checkbox =
        $("darkMode");

    if(checkbox){

        checkbox.checked =
            enabled;

    }

}


/*==================================================
                LOAD DARK MODE
==================================================*/

function loadDarkMode(){

    const checkbox =
        $("darkMode");


    if(!checkbox){
        return;
    }


    checkbox.checked =
        ReaderState.currentTheme ===
        "dark";

}


/*==================================================
                VIEW MODE BUTTONS
==================================================*/

function updateViewModeButtons(){

    const buttons =
        document.querySelectorAll(
            "[data-page-mode]"
        );


    buttons.forEach(button => {

        const mode =
            button.getAttribute(
                "data-page-mode"
            );


        button.classList.toggle(
            "active",
            (
                mode === "double" &&
                ReaderState.doublePage
            ) ||
            (
                mode === "single" &&
                !ReaderState.doublePage
            )
        );

    });

}


/*==================================================
                SET SINGLE PAGE
==================================================*/

async function setSinglePage(){

    await setPageMode(
        "single"
    );

    updateViewModeButtons();

}


/*==================================================
                SET DOUBLE PAGE
==================================================*/

async function setDoublePage(){

    await setPageMode(
        "double"
    );

    updateViewModeButtons();

}


/*==================================================
                INITIAL SETTINGS
==================================================*/

function loadReaderSettings(){

    loadReaderTheme();

    loadPageShadow();

    loadDarkMode();

    updateViewModeButtons();

}


/*==================================================
                SETTINGS EVENTS
==================================================*/

function setupSettingsEvents(){


    /*----------------------------------------------
                SETTINGS BUTTON
    ----------------------------------------------*/

    const settingsButton =
        $("settingsBtn");

    if(settingsButton){

        settingsButton.addEventListener(
            "click",
            toggleSettings
        );

    }


    /*----------------------------------------------
                SETTINGS CLOSE
    ----------------------------------------------*/

    const settingsClose =
        $("settingsClose");

    if(settingsClose){

        settingsClose.addEventListener(
            "click",
            closeSettings
        );

    }


    const settingsOverlay =
        $("settingsOverlay");

    if(settingsOverlay){

        settingsOverlay.addEventListener(
            "click",
            closeSettings
        );

    }


    /*----------------------------------------------
                THEME OPTIONS
    ----------------------------------------------*/

    document
        .querySelectorAll(
            "[data-reader-theme]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const theme =
                        button.getAttribute(
                            "data-reader-theme"
                        );


                    setReaderTheme(
                        theme
                    );

                }
            );

        });


    /*----------------------------------------------
                DARK MODE
    ----------------------------------------------*/

    const darkMode =
        $("darkMode");

    if(darkMode){

        darkMode.addEventListener(
            "change",
            () => {

                setDarkMode(
                    darkMode.checked
                );

            }
        );

    }


    /*----------------------------------------------
                PAGE SHADOW
    ----------------------------------------------*/

    const pageShadow =
        $("pageShadow");

    if(pageShadow){

        pageShadow.addEventListener(
            "change",
            () => {

                setPageShadow(
                    pageShadow.checked
                );

            }
        );

    }


    /*----------------------------------------------
                SINGLE / DOUBLE PAGE
    ----------------------------------------------*/

    document
        .querySelectorAll(
            "[data-page-mode]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const mode =
                        button.getAttribute(
                            "data-page-mode"
                        );


                    await setPageMode(
                        mode
                    );


                    updateViewModeButtons();

                }
            );

        });

}


/*==================================================
                SIDEBAR EVENTS
==================================================*/

function setupSidebarEvents(){


    const menuBtn =
        $("menuBtn");

    if(menuBtn){

        menuBtn.addEventListener(
            "click",
            toggleSidebar
        );

    }


    const sidebarOverlay =
        $("sidebarOverlay");

    if(sidebarOverlay){

        sidebarOverlay.addEventListener(
            "click",
            closeSidebar
        );

    }


    const thumbnailBtn =
        $("thumbnailBtn");

    if(thumbnailBtn){

        thumbnailBtn.addEventListener(
            "click",
            () => {

                openSidebar();

                activateSidebarTab(
                    "thumbnails"
                );

                generateThumbnails();

            }
        );

    }


    const commentsBtn =
        $("commentsBtn");

    if(commentsBtn){

        commentsBtn.addEventListener(
            "click",
            toggleComments
        );

    }


    document
        .querySelectorAll(
            "[data-sidebar-tab]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const tab =
                        button.getAttribute(
                            "data-sidebar-tab"
                        );


                    activateSidebarTab(
                        tab
                    );

                }
            );

        });

}


/*==================================================
                SIDEBAR TABS
==================================================*/

function activateSidebarTab(tabName){

    document
        .querySelectorAll(
            "[data-sidebar-tab]"
        )
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.getAttribute(
                    "data-sidebar-tab"
                ) === tabName
            );

        });


    document
        .querySelectorAll(
            "[data-sidebar-panel]"
        )
        .forEach(panel => {

            panel.classList.toggle(
                "active",
                panel.getAttribute(
                    "data-sidebar-panel"
                ) === tabName
            );

        });

}


/*==================================================
                THUMBNAILS
==================================================*/

async function generateThumbnails(){

    const container =
        $("thumbnailList");


    if(
        !container ||
        !ReaderState.pdf
    ){

        return;

    }


    if(
        container.dataset.generated ===
        "true"
    ){

        updateActiveThumbnail();

        return;

    }


    container.innerHTML = "";


    const maxPages =
        Math.min(
            ReaderState.totalPages,
            100
        );


    for(
        let pageNumber = 1;
        pageNumber <= maxPages;
        pageNumber++
    ){

        const item =
            document.createElement(
                "button"
            );


        item.type =
            "button";


        item.className =
            "thumbnailItem";


        item.dataset.page =
            pageNumber;


        const canvas =
            document.createElement(
                "canvas"
            );


        const number =
            document.createElement(
                "span"
            );


        number.className =
            "thumbnailNumber";


        number.textContent =
            `Page ${pageNumber}`;


        item.appendChild(
            canvas
        );


        item.appendChild(
            number
        );


        item.addEventListener(
            "click",
            () => {

                goToPage(
                    pageNumber
                );

            }
        );


        container.appendChild(
            item
        );


        try{

            await renderThumbnail(
                pageNumber,
                canvas
            );

        }catch(error){

            console.warn(
                "Thumbnail error:",
                error
            );

        }

    }


    container.dataset.generated =
        "true";


    updateActiveThumbnail();

}


/*==================================================
                RENDER THUMBNAIL
==================================================*/

async function renderThumbnail(
    pageNumber,
    canvas
){

    const page =
        await ReaderState.pdf.getPage(
            pageNumber
        );


    const baseViewport =
        page.getViewport({
            scale:1
        });


    const thumbnailWidth =
        180;


    const scale =
        thumbnailWidth /
        baseViewport.width;


    const viewport =
        page.getViewport({
            scale:scale
        });


    canvas.width =
        viewport.width;

    canvas.height =
        viewport.height;


    const context =
        canvas.getContext(
            "2d"
        );


    await page.render({

        canvasContext:context,

        viewport:viewport

    }).promise;

}


/*==================================================
                ACTIVE THUMBNAIL
==================================================*/

function updateActiveThumbnail(){

    document
        .querySelectorAll(
            ".thumbnailItem"
        )
        .forEach(item => {

            item.classList.toggle(
                "active",
                Number(
                    item.dataset.page
                ) ===
                ReaderState.currentPage
            );

        });

}


/*==================================================
                SEARCH EVENTS
==================================================*/

function setupSearchEvents(){

    const searchBtn =
        $("searchBtn");

    if(searchBtn){

        searchBtn.addEventListener(
            "click",
            toggleSearch
        );

    }


    const searchClose =
        $("searchClose");

    if(searchClose){

        searchClose.addEventListener(
            "click",
            closeSearch
        );

    }


    if(Elements.searchInput){

        Elements.searchInput.addEventListener(
            "keydown",
            event => {

                if(
                    event.key === "Enter"
                ){

                    searchBook(
                        Elements.searchInput.value
                    );

                }

                if(
                    event.key === "Escape"
                ){

                    closeSearch();

                }

            }
        );

    }

}


/*==================================================
                SEARCH PDF
==================================================*/

async function searchBook(query){

    query =
        String(query || "")
        .trim()
        .toLowerCase();


    if(!query){

        showToast(
            "Enter text to search"
        );

        return;

    }


    if(!ReaderState.pdf){

        showToast(
            "Book is not loaded"
        );

        return;

    }


    showToast(
        "Searching book..."
    );


    const results = [];


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


            const text =
                content.items
                    .map(
                        item =>
                            item.str
                    )
                    .join(" ")
                    .toLowerCase();


            if(
                text.includes(query)
            ){

                results.push(
                    pageNumber
                );

            }

        }catch(error){

            console.warn(
                "Search page error:",
                error
            );

        }

    }


    ReaderState.searchResults =
        results;


    ReaderState.searchIndex =
        0;


    if(
        Elements.searchStatus
    ){

        Elements.searchStatus.textContent =
            results.length
                ? `${results.length} page(s) found`
                : "No results found";

    }


    if(results.length){

        await goToPage(
            results[0]
        );

    }else{

        showToast(
            "No results found"
        );

    }

}


/*==================================================
                REINITIALIZE AFTER LOAD
==================================================*/

function initializePartTwo(){

    loadReaderSettings();

    setupSettingsEvents();

    setupSidebarEvents();

    setupSearchEvents();

}


/*==================================================
                PATCH CORE INITIALIZATION
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializePartTwo();

    }
);
/*==================================================
        CHISHTI LIBRARY READER V4
        JS PART 3
        BOOKMARKS + LIKE + SHARE + COMMENTS
==================================================*/


/*==================================================
                BOOKMARK STORAGE
==================================================*/

function loadBookmarks(){

    try{

        const saved =
            localStorage.getItem(
                "chishti-bookmarks"
            );

        ReaderState.bookmarks =
            saved
                ? JSON.parse(saved)
                : [];

        if(
            !Array.isArray(
                ReaderState.bookmarks
            )
        ){

            ReaderState.bookmarks = [];

        }

    }catch(error){

        console.warn(
            "Bookmark load failed:",
            error
        );

        ReaderState.bookmarks = [];

    }

}


/*==================================================
                SAVE BOOKMARKS
==================================================*/

function saveBookmarks(){

    try{

        localStorage.setItem(
            "chishti-bookmarks",
            JSON.stringify(
                ReaderState.bookmarks
            )
        );

    }catch(error){

        console.warn(
            "Bookmark save failed:",
            error
        );

    }

}


/*==================================================
                CHECK BOOKMARK
==================================================*/

function isCurrentPageBookmarked(){

    return ReaderState.bookmarks.some(
        bookmark =>
            Number(bookmark.page) ===
            ReaderState.currentPage
    );

}


/*==================================================
                TOGGLE BOOKMARK
==================================================*/

function toggleBookmark(){

    const page =
        ReaderState.currentPage;


    const existingIndex =
        ReaderState.bookmarks.findIndex(
            bookmark =>
                Number(bookmark.page) ===
                page
        );


    if(existingIndex !== -1){

        ReaderState.bookmarks.splice(
            existingIndex,
            1
        );

        showToast(
            "Bookmark removed"
        );

    }else{

        ReaderState.bookmarks.push({

            page:page,

            title:
                `Page ${page}`,

            createdAt:
                new Date().toISOString()

        });

        showToast(
            "Page bookmarked"
        );

    }


    saveBookmarks();

    updateBookmarkButtons();

    renderBookmarks();

}


/*==================================================
                UPDATE BOOKMARK BUTTON
==================================================*/

function updateBookmarkButtons(){

    const bookmarked =
        isCurrentPageBookmarked();


    const buttons = [

        $("bookmarkBtn"),

        $("bookmarkToolbarBtn")

    ];


    buttons.forEach(button => {

        if(!button){
            return;
        }


        button.classList.toggle(
            "bookmarked",
            bookmarked
        );


        const icon =
            button.querySelector("i");


        if(icon){

            icon.className =
                bookmarked
                    ? "ri-bookmark-fill"
                    : "ri-bookmark-line";

        }

    });

}


/*==================================================
                RENDER BOOKMARKS
==================================================*/

function renderBookmarks(){

    const container =
        $("bookmarksList");


    if(!container){
        return;
    }


    container.innerHTML = "";


    if(
        !ReaderState.bookmarks.length
    ){

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "noComments";


        empty.textContent =
            "No bookmarks yet";


        container.appendChild(
            empty
        );


        return;

    }


    const sorted =
        [...ReaderState.bookmarks]
        .sort(
            (a,b) =>
                Number(a.page) -
                Number(b.page)
        );


    sorted.forEach(bookmark => {

        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            "bookmarkItem";


        button.innerHTML = `

            <i class="ri-bookmark-fill"></i>

            <span class="bookmarkPage">
                Page ${Number(bookmark.page)}
            </span>

            <span class="bookmarkTitle">
                ${escapeHTML(
                    bookmark.title ||
                    `Page ${bookmark.page}`
                )}
            </span>

        `;


        button.addEventListener(
            "click",
            () => {

                goToPage(
                    Number(
                        bookmark.page
                    )
                );

            }
        );


        container.appendChild(
            button
        );

    });

}


/*==================================================
                BOOKMARK EVENTS
==================================================*/

function setupBookmarkEvents(){

    const buttons = [

        $("bookmarkBtn"),

        $("bookmarkToolbarBtn")

    ];


    buttons.forEach(button => {

        if(button){

            button.addEventListener(
                "click",
                toggleBookmark
            );

        }

    });

}


/*==================================================
                LIKE SYSTEM
==================================================*/

function loadLikes(){

    try{

        const saved =
            localStorage.getItem(
                "chishti-book-likes"
            );


        ReaderState.likes =
            Number(saved) || 0;

    }catch(error){

        ReaderState.likes = 0;

    }


    updateLikeUI();

}


/*==================================================
                SAVE LIKES
==================================================*/

function saveLikes(){

    try{

        localStorage.setItem(
            "chishti-book-likes",
            String(
                ReaderState.likes
            )
        );

    }catch(error){

        console.warn(
            "Like save failed:",
            error
        );

    }

}


/*==================================================
                UPDATE LIKE UI
==================================================*/

function updateLikeUI(){

    const likeCount =
        $("likeCount");


    if(likeCount){

        likeCount.textContent =
            ReaderState.likes;

    }

}


/*==================================================
                LIKE BOOK
==================================================*/

function likeBook(){

    ReaderState.likes += 1;

    saveLikes();

    updateLikeUI();


    const button =
        $("likeBtn");


    if(button){

        button.classList.add(
            "liked"
        );

        const icon =
            button.querySelector("i");


        if(icon){

            icon.className =
                "ri-heart-fill";

        }

    }


    showToast(
        "Book liked"
    );

}


/*==================================================
                COMMENTS STORAGE
==================================================*/

function getCommentsKey(){

    return (
        "chishti-comments-" +
        (
            ReaderState.bookUrl ||
            "default"
        )
    );

}


/*==================================================
                LOAD COMMENTS
==================================================*/

function loadComments(){

    try{

        const saved =
            localStorage.getItem(
                getCommentsKey()
            );


        ReaderState.comments =
            saved
                ? JSON.parse(saved)
                : [];


        if(
            !Array.isArray(
                ReaderState.comments
            )
        ){

            ReaderState.comments = [];

        }

    }catch(error){

        console.warn(
            "Comments load failed:",
            error
        );

        ReaderState.comments = [];

    }


    renderComments();

}


/*==================================================
                SAVE COMMENTS
==================================================*/

function saveComments(){

    try{

        localStorage.setItem(
            getCommentsKey(),
            JSON.stringify(
                ReaderState.comments
            )
        );

    }catch(error){

        console.warn(
            "Comments save failed:",
            error
        );

    }

}


/*==================================================
                ADD COMMENT
==================================================*/

function addComment(){

    const nameInput =
        $("commentName");


    const textInput =
        $("commentText");


    if(
        !nameInput ||
        !textInput
    ){

        return;

    }


    const name =
        nameInput.value.trim();


    const text =
        textInput.value.trim();


    if(!name){

        showToast(
            "Enter your name"
        );

        nameInput.focus();

        return;

    }


    if(!text){

        showToast(
            "Write a comment"
        );

        textInput.focus();

        return;

    }


    ReaderState.comments.unshift({

        name:name,

        text:text,

        page:
            ReaderState.currentPage,

        createdAt:
            new Date().toISOString()

    });


    saveComments();

    renderComments();


    nameInput.value = "";

    textInput.value = "";


    showToast(
        "Comment posted"
    );

}


/*==================================================
                RENDER COMMENTS
==================================================*/

function renderComments(){

    const container =
        $("commentsList");


    if(!container){
        return;
    }


    container.innerHTML = "";


    if(
        !ReaderState.comments.length
    ){

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "noComments";


        empty.textContent =
            "No comments yet";


        container.appendChild(
            empty
        );


        return;

    }


    ReaderState.comments.forEach(
        comment => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "commentItem";


            const date =
                comment.createdAt
                    ? new Date(
                        comment.createdAt
                    ).toLocaleDateString()
                    : "";


            item.innerHTML = `

                <div class="commentAuthor">

                    <strong>
                        ${escapeHTML(
                            comment.name
                        )}
                    </strong>

                    <span class="commentDate">
                        ${escapeHTML(date)}
                    </span>

                </div>

                <div class="commentBody">
                    ${escapeHTML(
                        comment.text
                    )}
                </div>

                <div
                    style="
                        margin-top:7px;
                        color:var(--text-muted);
                        font-size:9px;
                    "
                >
                    Page ${Number(
                        comment.page || 1
                    )}
                </div>

            `;


            container.appendChild(
                item
            );

        }
    );

}


/*==================================================
                COMMENT EVENTS
==================================================*/

function setupCommentEvents(){

    const postButton =
        $("postComment");


    if(postButton){

        postButton.addEventListener(
            "click",
            addComment
        );

    }


    const commentText =
        $("commentText");


    if(commentText){

        commentText.addEventListener(
            "keydown",
            event => {

                if(
                    event.key === "Enter" &&
                    event.ctrlKey
                ){

                    addComment();

                }

            }
        );

    }


    const closeButton =
        $("commentsClose");


    if(closeButton){

        closeButton.addEventListener(
            "click",
            closeComments
        );

    }

}


/*==================================================
                SHARE MODAL
==================================================*/

function openShare(){

    const modal =
        $("shareModal");


    if(!modal){
        return;
    }


    modal.classList.add(
        "active"
    );

}


function closeShare(){

    const modal =
        $("shareModal");


    if(modal){

        modal.classList.remove(
            "active"
        );

    }

}


function toggleShare(){

    const modal =
        $("shareModal");


    if(
        modal &&
        modal.classList.contains(
            "active"
        )
    ){

        closeShare();

    }else{

        openShare();

    }

}


/*==================================================
                COPY BOOK LINK
==================================================*/

async function copyBookLink(){

    const url =
        window.location.href;


    try{

        await navigator.clipboard.writeText(
            url
        );


        showToast(
            "Book link copied"
        );


    }catch(error){

        const textarea =
            document.createElement(
                "textarea"
            );


        textarea.value =
            url;


        textarea.style.position =
            "fixed";

        textarea.style.opacity =
            "0";


        document.body.appendChild(
            textarea
        );


        textarea.select();


        try{

            document.execCommand(
                "copy"
            );

            showToast(
                "Book link copied"
            );

        }catch(copyError){

            showToast(
                "Unable to copy link"
            );

        }


        textarea.remove();

    }

}


/*==================================================
                NATIVE SHARE
==================================================*/

async function nativeShare(){

    const shareData = {

        title:
            ReaderState.bookTitle,

        text:
            "Read this book in Chishti Library Reader.",

        url:
            window.location.href

    };


    if(
        navigator.share
    ){

        try{

            await navigator.share(
                shareData
            );

        }catch(error){

            if(
                error &&
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

        await copyBookLink();

    }

}


/*==================================================
                SHARE EVENTS
==================================================*/

function setupShareEvents(){

    const shareButton =
        $("shareBtn");


    if(shareButton){

        shareButton.addEventListener(
            "click",
            toggleShare
        );

    }


    const closeButton =
        $("shareClose");


    if(closeButton){

        closeButton.addEventListener(
            "click",
            closeShare
        );

    }


    const copyButton =
        $("copyLinkBtn");


    if(copyButton){

        copyButton.addEventListener(
            "click",
            copyBookLink
        );

    }


    const nativeButton =
        $("nativeShareBtn");


    if(nativeButton){

        nativeButton.addEventListener(
            "click",
            nativeShare
        );

    }


    const modal =
        $("shareModal");


    if(modal){

        modal.addEventListener(
            "click",
            event => {

                if(
                    event.target ===
                    modal
                ){

                    closeShare();

                }

            }
        );

    }

}


/*==================================================
                HTML ESCAPE
==================================================*/

function escapeHTML(value){

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


/*==================================================
                UPDATE AFTER PAGE CHANGE
==================================================*/

function updatePageFeatures(){

    updateBookmarkButtons();

    updateActiveThumbnail();

}


/*==================================================
                PAGE CHANGE PATCH
==================================================*/

const originalGoToPage =
    window.goToPage;


window.goToPage =
    async function(pageNumber){

        if(
            typeof originalGoToPage ===
            "function"
        ){

            await originalGoToPage(
                pageNumber
            );

        }


        updatePageFeatures();

    };


/*==================================================
                INITIALIZE PART 3
==================================================*/

function initializePartThree(){

    loadBookmarks();

    loadLikes();

    loadComments();

    setupBookmarkEvents();

    setupCommentEvents();

    setupShareEvents();

    updateBookmarkButtons();

}


/*==================================================
                DOM READY
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializePartThree();

    }
);
/*==================================================
        CHISHTI LIBRARY READER V4
        JS PART 4
        LOADING SCREEN + BOOK OPEN TRANSITION
        SETTINGS + READER UI HELPERS
==================================================*/


/*==================================================
                LOADING SCREEN
==================================================*/

function showLoadingScreen(){

    const screen =
        $("loadingScreen");

    if(!screen){
        return;
    }

    screen.classList.remove(
        "hide"
    );

}


function finishLoadingScreen(){

    const screen =
        $("loadingScreen");

    if(!screen){
        return;
    }

    setLoadingProgress(
        100,
        "Book Ready"
    );

    setTimeout(() => {

        screen.classList.add(
            "hide"
        );

        document.body.classList.add(
            "reader-ready"
        );

    }, 350);

}


/*==================================================
                BOOK OPEN ANIMATION
==================================================*/

function openReaderAnimation(){

    document.body.classList.add(
        "reader-opening"
    );

    requestAnimationFrame(() => {

        setTimeout(() => {

            document.body.classList.remove(
                "reader-opening"
            );

            document.body.classList.add(
                "reader-ready"
            );

        }, 120);

    });

}


/*==================================================
                READER TRANSITION
==================================================*/

function showReaderTransition(){

    const transition =
        $("readerTransition");

    if(!transition){
        return;
    }

    transition.classList.add(
        "active"
    );

}


function hideReaderTransition(){

    const transition =
        $("readerTransition");

    if(!transition){
        return;
    }

    transition.classList.remove(
        "active"
    );

}


/*==================================================
                MENU CLOSE ALL
==================================================*/

function closeAllPanels(){

    closeSidebar();

    closeComments();

    closeSettings();

    closeSearch();

    closeShare();

}


/*==================================================
                ESCAPE KEY
==================================================*/

function setupEscapeHandler(){

    document.addEventListener(
        "keydown",
        event => {

            if(
                event.key !==
                "Escape"
            ){

                return;

            }

            closeAllPanels();

        }
    );

}


/*==================================================
                READER FULLSCREEN
==================================================*/

async function toggleFullscreen(){

    const target =
        $("readerApp") ||
        document.documentElement;


    try{

        if(
            !document.fullscreenElement
        ){

            await target.requestFullscreen();

        }else{

            await document.exitFullscreen();

        }

    }catch(error){

        console.warn(
            "Fullscreen error:",
            error
        );

    }

}


/*==================================================
                FULLSCREEN EVENT
==================================================*/

function setupFullscreen(){

    const button =
        $("fullscreenBtn");


    if(button){

        button.addEventListener(
            "click",
            toggleFullscreen
        );

    }


    document.addEventListener(
        "fullscreenchange",
        () => {

            const icon =
                button?.querySelector(
                    "i"
                );


            if(!icon){
                return;
            }


            icon.className =
                document.fullscreenElement
                    ? "ri-fullscreen-exit-line"
                    : "ri-fullscreen-line";

        }
    );

}


/*==================================================
                SCROLL READER
==================================================*/

function setupReaderScroll(){

    if(!Elements.pdfArea){
        return;
    }


    let scrollTimer;


    Elements.pdfArea.addEventListener(
        "scroll",
        () => {

            clearTimeout(
                scrollTimer
            );


            scrollTimer =
                setTimeout(() => {

                    updateReadingProgress();

                }, 50);

        }
    );

}


/*==================================================
                RESIZE
==================================================*/

function setupResizeHandler(){

    let resizeTimer;


    window.addEventListener(
        "resize",
        () => {

            clearTimeout(
                resizeTimer
            );


            resizeTimer =
                setTimeout(() => {

                    if(
                        ReaderState.pdf &&
                        ReaderState.zoom <= 1
                    ){

                        fitPage();

                    }

                }, 250);

        }
    );

}


/*==================================================
                PAGE COUNTER CLICK
==================================================*/

function setupPageCounter(){

    const counter =
        $("pageCounter");


    if(!counter){
        return;
    }


    counter.addEventListener(
        "click",
        () => {

            if(
                Elements.currentPage
            ){

                Elements.currentPage.focus();

                Elements.currentPage.select();

            }

        }
    );

}


/*==================================================
                PREVENT BUTTON DRAG
==================================================*/

function setupButtonProtection(){

    document
        .querySelectorAll(
            "button"
        )
        .forEach(button => {

            button.addEventListener(
                "dragstart",
                event => {

                    event.preventDefault();

                }
            );

        });

}


/*==================================================
                PREVENT PDF IMAGE DRAG
==================================================*/

function setupCanvasProtection(){

    document
        .querySelectorAll(
            "canvas"
        )
        .forEach(canvas => {

            canvas.addEventListener(
                "dragstart",
                event => {

                    event.preventDefault();

                }

            );

        });

}


/*==================================================
                TOUCH SWIPE
==================================================*/

function setupTouchNavigation(){

    if(!Elements.pdfArea){
        return;
    }


    let startX = 0;

    let startY = 0;


    Elements.pdfArea.addEventListener(
        "touchstart",
        event => {

            if(
                !event.touches ||
                !event.touches.length
            ){

                return;

            }


            startX =
                event.touches[0].clientX;

            startY =
                event.touches[0].clientY;

        },
        {
            passive:true
        }
    );


    Elements.pdfArea.addEventListener(
        "touchend",
        event => {

            if(
                !event.changedTouches ||
                !event.changedTouches.length
            ){

                return;

            }


            const endX =
                event.changedTouches[0].clientX;

            const endY =
                event.changedTouches[0].clientY;


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


/*==================================================
                AUTO SAVE
==================================================*/

function setupAutoSave(){

    const checkbox =
        $("autoSave");


    if(!checkbox){
        return;
    }


    let enabled = true;


    try{

        const saved =
            localStorage.getItem(
                "chishti-auto-save"
            );


        if(saved !== null){

            enabled =
                saved === "1";

        }

    }catch(error){

        enabled = true;

    }


    checkbox.checked =
        enabled;


    checkbox.addEventListener(
        "change",
        () => {

            try{

                localStorage.setItem(
                    "chishti-auto-save",
                    checkbox.checked
                        ? "1"
                        : "0"
                );

            }catch(error){

                console.warn(
                    "Auto save setting failed:",
                    error
                );

            }

        }
    );

}


/*==================================================
                READER READY STATE
==================================================*/

function setReaderReady(){

    document.body.classList.remove(
        "reader-opening"
    );

    document.body.classList.add(
        "reader-ready"
    );

    hideReaderTransition();

}


/*==================================================
                READER ERROR
==================================================*/

function showReaderError(message){

    const screen =
        $("loadingScreen");


    if(screen){

        screen.classList.remove(
            "hide"
        );

    }


    setLoadingProgress(
        100,
        message ||
        "Unable to open book"
    );


    showToast(
        message ||
        "Unable to open book"
    );

}


/*==================================================
                BOOK OPEN FROM LIBRARY
==================================================*/

function openBookFromLibrary(
    url,
    title
){

    if(!url){

        showToast(
            "Book file not found"
        );

        return;

    }


    const encodedUrl =
        encodeURIComponent(
            url
        );


    const encodedTitle =
        encodeURIComponent(
            title ||
            "Untitled Book"
        );


    window.location.href =
        `reader.html?pdf=${encodedUrl}&title=${encodedTitle}`;

}


/*==================================================
                READING POSITION
==================================================*/

function saveReadingPosition(){

    if(
        !ReaderState.bookUrl
    ){

        return;

    }


    try{

        localStorage.setItem(
            "chishti-reading-position-" +
            ReaderState.bookUrl,
            String(
                ReaderState.currentPage
            )
        );

    }catch(error){

        console.warn(
            "Reading position save failed:",
            error
        );

    }

}


/*==================================================
                LOAD READING POSITION
==================================================*/

function loadReadingPosition(){

    if(
        !ReaderState.bookUrl
    ){

        return;

    }


    try{

        const saved =
            localStorage.getItem(
                "chishti-reading-position-" +
                ReaderState.bookUrl
            );


        const page =
            Number(saved);


        if(
            Number.isFinite(page) &&
            page >= 1
        ){

            ReaderState.currentPage =
                page;

        }

    }catch(error){

        console.warn(
            "Reading position load failed:",
            error
        );

    }

}


/*==================================================
                READER SHORTCUTS
==================================================*/

function setupShortcuts(){

    document.addEventListener(
        "keydown",
        event => {

            if(
                event.ctrlKey ||
                event.metaKey ||
                event.altKey
            ){

                return;

            }


            switch(event.key){

                case "m":

                    toggleSidebar();

                    break;


                case "s":

                    toggleSettings();

                    break;


                case "b":

                    toggleBookmark();

                    break;


                case "f":

                    if(
                        !event.target.matches(
                            "input, textarea"
                        )
                    ){

                        toggleFullscreen();

                    }

                    break;

            }

        }
    );

}


/*==================================================
                INITIALIZE PART 4
==================================================*/

function initializePartFour(){

    setupEscapeHandler();

    setupFullscreen();

    setupReaderScroll();

    setupResizeHandler();

    setupPageCounter();

    setupButtonProtection();

    setupCanvasProtection();

    setupTouchNavigation();

    setupAutoSave();

    setupShortcuts();

    updateBookmarkButtons();

    updateViewModeButtons();

}


/*==================================================
                DOM READY
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializePartFour();

    }
);
/*==================================================
        CHISHTI LIBRARY READER V4
        JS PART 5
        FINAL INITIALIZATION + UI SYNC
==================================================*/


/*==================================================
                UPDATE ALL UI
==================================================*/

function updateReaderUI(){

    updatePageUI();

    updateReadingProgress();

    updateBookmarkButtons();

    updateActiveThumbnail();

    updateViewModeButtons();

    updateLikeUI();

}


/*==================================================
                SAFE FUNCTION CALL
==================================================*/

function safeCall(
    callback
){

    try{

        if(
            typeof callback ===
            "function"
        ){

            callback();

        }

    }catch(error){

        console.warn(
            "Reader function error:",
            error
        );

    }

}


/*==================================================
                LOAD ALL SAVED DATA
==================================================*/

function loadAllReaderData(){

    safeCall(
        loadReaderTheme
    );

    safeCall(
        loadPageShadow
    );

    safeCall(
        loadDarkMode
    );

    safeCall(
        loadBookmarks
    );

    safeCall(
        loadLikes
    );

    safeCall(
        loadComments
    );

}


/*==================================================
                SAVE ALL READER DATA
==================================================*/

function saveAllReaderData(){

    safeCall(
        saveBookmarks
    );

    safeCall(
        saveLikes
    );

    safeCall(
        saveComments
    );

    safeCall(
        saveReaderState
    );

    safeCall(
        saveReadingPosition
    );

}


/*==================================================
                BEFORE PAGE CHANGE
==================================================*/

function preparePageChange(){

    saveReadingPosition();

    saveReaderState();

}


/*==================================================
                WINDOW CLOSE
==================================================*/

window.addEventListener(
    "beforeunload",
    () => {

        saveAllReaderData();

    }
);


/*==================================================
                VISIBILITY CHANGE
==================================================*/

document.addEventListener(
    "visibilitychange",
    () => {

        if(
            document.visibilityState ===
            "hidden"
        ){

            saveAllReaderData();

        }

    }
);


/*==================================================
                PRINT BUTTON
==================================================*/

function printCurrentPage(){

    if(
        !ReaderState.pdf
    ){

        showToast(
            "Book is not loaded"
        );

        return;

    }


    window.print();

}


function setupPrintButton(){

    const button =
        $("printBtn");


    if(button){

        button.addEventListener(
            "click",
            printCurrentPage
        );

    }

}


/*==================================================
                RELOAD BOOK
==================================================*/

async function reloadCurrentBook(){

    if(
        !ReaderState.bookUrl
    ){

        showToast(
            "No book selected"
        );

        return;

    }


    try{

        showReaderTransition();

        showPageLoading();


        const loadingTask =
            pdfjsLib.getDocument({
                url:
                    ReaderState.bookUrl
            });


        ReaderState.pdf =
            await loadingTask.promise;


        ReaderState.totalPages =
            ReaderState.pdf.numPages;


        if(
            ReaderState.currentPage >
            ReaderState.totalPages
        ){

            ReaderState.currentPage =
                ReaderState.totalPages;

        }


        await renderCurrentPages();


        updateReaderUI();


        hidePageLoading();

        hideReaderTransition();


        showToast(
            "Book refreshed"
        );


    }catch(error){

        console.error(
            "Reload error:",
            error
        );


        hidePageLoading();

        hideReaderTransition();


        showToast(
            "Unable to refresh book"
        );

    }

}


/*==================================================
                REFRESH BUTTON
==================================================*/

function setupRefreshButton(){

    const button =
        $("refreshBtn");


    if(button){

        button.addEventListener(
            "click",
            reloadCurrentBook
        );

    }

}


/*==================================================
                HOME BUTTON
==================================================*/

function setupHomeButton(){

    const button =
        $("homeBtn");


    if(
        !button
    ){

        return;

    }


    button.addEventListener(
        "click",
        () => {

            saveAllReaderData();

            window.location.href =
                "index.html";

        }
    );

}


/*==================================================
                CLOSE READER
==================================================*/

function setupCloseButton(){

    const button =
        $("closeReaderBtn");


    if(
        !button
    ){

        return;

    }


    button.addEventListener(
        "click",
        () => {

            saveAllReaderData();

            window.history.back();

        }
    );

}


/*==================================================
                PREVENT DOUBLE CLICK ZOOM
==================================================*/

function setupDoubleClick(){

    if(
        !Elements.pdfArea
    ){

        return;

    }


    Elements.pdfArea.addEventListener(
        "dblclick",
        event => {

            if(
                event.target.tagName !==
                "CANVAS"
            ){

                return;

            }


            if(
                ReaderState.zoom <= 1
            ){

                setZoom(
                    1.5
                );

            }else{

                setZoom(
                    1
                );

            }

        }
    );

}


/*==================================================
                MOUSE WHEEL ZOOM
==================================================*/

function setupWheelZoom(){

    if(
        !Elements.pdfArea
    ){

        return;

    }


    Elements.pdfArea.addEventListener(
        "wheel",
        event => {

            if(
                !event.ctrlKey
            ){

                return;

            }


            event.preventDefault();


            if(
                event.deltaY < 0
            ){

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


/*==================================================
                UPDATE PAGE AFTER RENDER
==================================================*/

function afterPageRender(){

    updateReaderUI();

    saveReadingPosition();

    saveReaderState();

}


/*==================================================
                PAGE RENDER PATCH
==================================================*/

const originalRenderCurrentPages =
    window.renderCurrentPages;


if(
    typeof originalRenderCurrentPages ===
    "function"
){

    window.renderCurrentPages =
        async function(){

            await originalRenderCurrentPages();

            afterPageRender();

        };

}


/*==================================================
                OPEN READER FROM BOOK CARD
==================================================*/

function setupBookOpenButtons(){

    document
        .querySelectorAll(
            "[data-reader-book]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const url =
                        button.getAttribute(
                            "data-reader-book"
                        );


                    const title =
                        button.getAttribute(
                            "data-book-title"
                        ) ||
                        "Untitled Book";


                    openBookFromLibrary(
                        url,
                        title
                    );

                }
            );

        });

}


/*==================================================
                BUTTON RIPPLE
==================================================*/

function setupButtonRipple(){

    document
        .querySelectorAll(
            "button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    const rect =
                        button.getBoundingClientRect();


                    const ripple =
                        document.createElement(
                            "span"
                        );


                    ripple.className =
                        "buttonRipple";


                    ripple.style.left =
                        (
                            event.clientX -
                            rect.left
                        ) + "px";


                    ripple.style.top =
                        (
                            event.clientY -
                            rect.top
                        ) + "px";


                    button.appendChild(
                        ripple
                    );


                    setTimeout(
                        () => {

                            ripple.remove();

                        },
                        500
                    );

                }
            );

        });

}


/*==================================================
                READER ERROR HANDLER
==================================================*/

window.addEventListener(
    "error",
    event => {

        if(
            event &&
            event.error
        ){

            console.error(
                "Reader error:",
                event.error
            );

        }

    }
);


/*==================================================
                PDF LOAD VALIDATION
==================================================*/

function validatePDFEnvironment(){

    if(
        typeof pdfjsLib ===
        "undefined"
    ){

        showReaderError(
            "PDF reader library failed to load"
        );

        return false;

    }


    return true;

}


/*==================================================
                FINAL STARTUP
==================================================*/

function startChishtiReader(){

    if(
        !validatePDFEnvironment()
    ){

        return;

    }


    loadAllReaderData();


    setupPrintButton();

    setupRefreshButton();

    setupHomeButton();

    setupCloseButton();

    setupDoubleClick();

    setupWheelZoom();

    setupBookOpenButtons();

    setupButtonRipple();


    updateReaderUI();


    openReaderAnimation();

}


/*==================================================
                FINAL DOM READY
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        startChishtiReader();

    }
);


/*==================================================
                GLOBAL ACCESS
==================================================*/

window.ChishtiReader = {

    nextPage:
        nextReaderPage,

    previousPage:
        previousReaderPage,

    goToPage:
        goToPage,

    zoomIn:
        zoomIn,

    zoomOut:
        zoomOut,

    fitPage:
        fitPage,

    setTheme:
        setReaderTheme,

    setPageMode:
        setPageMode,

    toggleBookmark:
        toggleBookmark,

    toggleSettings:
        toggleSettings,

    toggleSidebar:
        toggleSidebar,

    toggleComments:
        toggleComments,

    toggleShare:
        toggleShare,

    toggleFullscreen:
        toggleFullscreen

};


/*==================================================
                END OF JS
==================================================*/
