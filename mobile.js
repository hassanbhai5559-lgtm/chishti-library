/*====================================================
 CHISHTI LIBRARY v6
 MOBILE.JS
 PART 1
 FOUNDATION
====================================================*/

"use strict";

/*====================================================
PDF.JS
====================================================*/

pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

/*====================================================
GLOBAL STATE
====================================================*/

const App = {

    pdf: null,

    page: 1,

    totalPages: 0,

    zoom: 1.4,

    rotation: 0,

    currentBook: null,

    currentBookId: null,

    rendering: false,

    pendingPage: null,

    theme: "maroon",

    bookmarks: [],

    favorites: [],

    history: [],

    notifications: [],

    books: [],

    searchResults: [],

    touchStartX: 0,

    touchEndX: 0,

    pinchDistance: 0,

    readerOpen: false

};

/*====================================================
DOM CACHE
====================================================*/

const DOM = {

    preloader:
    document.getElementById("preloader"),

    app:
    document.getElementById("mobileApp"),

    canvas:
    document.getElementById("pdfCanvas"),

    reader:
    document.getElementById("readerOverlay"),

    pageCounter:
    document.getElementById("pageCounter"),

    readerTitle:
    document.getElementById("readerBookTitle"),

    readerInfo:
    document.getElementById("readerPageInfo"),

    searchInput:
    document.getElementById("searchInput"),

    searchResults:
    document.getElementById("searchResults"),

    bookmarkList:
    document.getElementById("bookmarkList"),

    notificationList:
    document.getElementById("notificationList"),

    featuredBooks:
    document.getElementById("featuredBooks"),

    latestBooks:
    document.getElementById("latestBooks"),

    recentBooks:
    document.getElementById("recentBooks"),

    categorySlider:
    document.getElementById("categorySlider"),

    authorSlider:
    document.getElementById("authorSlider"),

    continueTitle:
    document.getElementById("continueTitle"),

    continuePage:
    document.getElementById("continuePage"),

    progress:
    document.getElementById("readingProgressBar"),

    toast:
    document.getElementById("toast"),

    toastText:
    document.getElementById("toastText"),

    toastIcon:
    document.getElementById("toastIcon")

};

/*====================================================
CANVAS
====================================================*/

const ctx =
DOM.canvas.getContext("2d");

/*====================================================
APPLICATION START
====================================================*/

window.addEventListener(

"load",

() => {

    console.log(

        "Chishti Library Mobile Ready"

    );

});

/*====================================================
 CHISHTI LIBRARY v6
 MOBILE.JS
 PART 2
 UTILITIES
====================================================*/

/*====================================================
LOCAL STORAGE
====================================================*/

const Storage = {

save(key,value){

localStorage.setItem(

key,

JSON.stringify(value)

);

},

load(key,defaultValue=[]){

try{

const data=

localStorage.getItem(key);

return data ?

JSON.parse(data)

:

defaultValue;

}

catch(e){

return defaultValue;

}

},

remove(key){

localStorage.removeItem(key);

},

clear(){

localStorage.clear();

}

};

/*====================================================
LOAD SAVED DATA
====================================================*/

App.bookmarks=

Storage.load(

"cl_bookmarks",

[]

);

App.favorites=

Storage.load(

"cl_favorites",

[]

);

App.history=

Storage.load(

"cl_history",

[]

);

App.theme=

Storage.load(

"cl_theme",

"maroon"

);

/*====================================================
TOAST
====================================================*/

function showToast(

message,

icon="fa-circle-check"

){

if(!DOM.toast) return;

DOM.toastText.textContent=

message;

DOM.toastIcon.className=

`fas ${icon}`;

DOM.toast.classList.add(

"show"

);

clearTimeout(

window.toastTimer

);

window.toastTimer=

setTimeout(()=>{

DOM.toast.classList.remove(

"show"

);

},2500);

}

/*====================================================
LOADER
====================================================*/

function showLoader(){

const loader=

document.getElementById(

"loadingOverlay"

);

if(loader)

loader.classList.add(

"active"

);

}

function hideLoader(){

const loader=

document.getElementById(

"loadingOverlay"

);

if(loader)

loader.classList.remove(

"active"

);

}

/*====================================================
HELPERS
====================================================*/

function qs(id){

return document.getElementById(id);

}

function create(tag){

return document.createElement(tag);

}

function clamp(

value,

min,

max

){

return Math.max(

min,

Math.min(

max,

value

)

);

}

/*====================================================
THEME
====================================================*/

function applyTheme(

theme

){

App.theme=

theme;

document.body.setAttribute(

"data-theme",

theme

);

Storage.save(

"cl_theme",

theme

);

}

/*====================================================
DATE
====================================================*/

function currentDate(){

return new Date()

.toLocaleDateString();

}

/*====================================================
RANDOM ID
====================================================*/

function randomID(){

return Math.random()

.toString(36)

.substring(

2,

10

);

}

/*====================================================
CONSOLE
====================================================*/

console.log(

"Utilities Loaded"

);

/*====================================================
 CHISHTI LIBRARY v6
 MOBILE.JS
 PART 3
 LIBRARY LOADER
====================================================*/


/*====================================================
BOOK DATABASE
====================================================*/

const LibraryDB = [

    {
        id:1,

        title:
        "Diwan-e-Saim Chishti",

        author:
        "Allama Saim Chishti",

        category:
        "Naat",

        cover:
        "covers/book1.jpg",

        pdf:
        "books/book1.pdf"

    },


    {
        id:2,

        title:
        "Madaih-e-Rasool ﷺ",

        author:
        "Allama Saim Chishti",

        category:
        "Manqabat",

        cover:
        "covers/book2.jpg",

        pdf:
        "books/book2.pdf"

    },


    {
        id:3,

        title:
        "Hamd-o-Sana",

        author:
        "Allama Saim Chishti",

        category:
        "Hamd",

        cover:
        "covers/book3.jpg",

        pdf:
        "books/book3.pdf"

    }

];



/*====================================================
LOAD DATABASE
====================================================*/

function loadLibrary(){


    App.books = LibraryDB;


    renderFeaturedBooks();


    renderLatestBooks();


    renderCategories();


    updateStatistics();


}



/*====================================================
FEATURED BOOKS
====================================================*/

function renderFeaturedBooks(){


    if(!DOM.featuredBooks)
    return;


    DOM.featuredBooks.innerHTML="";


    App.books.forEach(book=>{


        const card = document.createElement(
            "div"
        );


        card.className =
        "featured-card fade-up";


        card.innerHTML = `

        <img src="${book.cover}">


        <div class="featured-body">

            <h4>

            ${book.title}

            </h4>


            <p>

            ${book.author}

            </p>


            <button
            onclick="openBook(${book.id})">

            <i class="fas fa-book-open"></i>

            Read

            </button>


        </div>

        `;


        DOM.featuredBooks.appendChild(card);



    });


}



/*====================================================
LATEST BOOK GRID
====================================================*/

function renderLatestBooks(){


    if(!DOM.latestBooks)
    return;


    DOM.latestBooks.innerHTML="";


    App.books.forEach(book=>{


        const card =
        document.createElement("div");


        card.className =
        "book-card fade-up";


        card.innerHTML = `


        <img src="${book.cover}">


        <div class="book-info">


        <h4>

        ${book.title}

        </h4>


        <p>

        ${book.author}

        </p>


        <button
        onclick="openBook(${book.id})">


        Open


        </button>


        </div>


        `;


        DOM.latestBooks.appendChild(card);



    });


}



/*====================================================
CATEGORIES
====================================================*/

function renderCategories(){


    if(!DOM.categorySlider)
    return;


    let categories =
    [...new Set(

        App.books.map(

            book=>book.category

        )

    )];


    DOM.categorySlider.innerHTML="";


    categories.forEach(cat=>{


        let item =
        document.createElement("div");


        item.className =
        "category-card";


        item.innerHTML=`


        <i class="fas fa-book"></i>


        <span>

        ${cat}

        </span>


        `;


        DOM.categorySlider.appendChild(item);


    });


}



/*====================================================
STATISTICS
====================================================*/

function updateStatistics(){


    const total =
    document.getElementById(
        "totalBooks"
    );


    const pdfs =
    document.getElementById(
        "totalPDFs"
    );


    if(total)

    total.innerText =
    App.books.length;



    if(pdfs)

    pdfs.innerText =
    App.books.length;



}



/*====================================================
START LIBRARY
====================================================*/

loadLibrary();

/*====================================================
 CHISHTI LIBRARY v6
 MOBILE.JS
 PART 4
 SEARCH SYSTEM
====================================================*/


/*====================================================
OPEN SEARCH
====================================================*/

function openSearch(){

    const overlay =
    document.getElementById("searchOverlay");


    if(!overlay)
    return;


    overlay.classList.add("active");


    setTimeout(()=>{

        if(DOM.searchInput){

            DOM.searchInput.focus();

        }

    },300);


}


/*====================================================
CLOSE SEARCH
====================================================*/

function closeSearch(){

    const overlay =
    document.getElementById("searchOverlay");


    if(!overlay)
    return;


    overlay.classList.remove("active");


    if(DOM.searchInput){

        DOM.searchInput.value="";

    }


    if(DOM.searchResults){

        DOM.searchResults.innerHTML="";

    }

}



/*====================================================
SEARCH DATABASE
====================================================*/


function searchBooks(query){

    if(!query){

        return [];

    }


    query =
    query.toLowerCase();



    return App.books.filter(book=>{


        const title =
        book.title?.toLowerCase() || "";


        const author =
        book.author?.toLowerCase() || "";


        const category =
        book.category?.toLowerCase() || "";



        return (

            title.includes(query)

            ||

            author.includes(query)

            ||

            category.includes(query)

        );


    });


}



/*====================================================
DISPLAY SEARCH RESULTS
====================================================*/


function showSearchResults(results){


    if(!DOM.searchResults)
    return;



    DOM.searchResults.innerHTML="";



    if(results.length===0){


        DOM.searchResults.innerHTML = `

        <div class="empty-state">

        <i class="fas fa-search"></i>

        <p>

        No books found

        </p>

        </div>

        `;


        return;

    }




    results.forEach(book=>{


        const item =
        document.createElement("div");


        item.className =
        "search-item";



        item.innerHTML = `

        <strong>

        ${book.title}

        </strong>


        <p>

        ${book.author || "Unknown Author"}

        </p>

        `;



        item.onclick=()=>{


            closeSearch();


            openBook(book);



        };



        DOM.searchResults.appendChild(item);



    });



}



/*====================================================
LIVE SEARCH
====================================================*/


function liveSearch(){


    if(!DOM.searchInput)
    return;



    DOM.searchInput.addEventListener(

    "input",

    ()=>{


        const value =
        DOM.searchInput.value.trim();



        const results =
        searchBooks(value);



        App.searchResults =
        results;



        showSearchResults(results);



    });


}



/*====================================================
SEARCH BUTTON EVENTS
====================================================*/


const searchButton =
document.getElementById("navSearch");


if(searchButton){

    searchButton.onclick=()=>{

        openSearch();

    };

}



const closeSearchBtn =
document.getElementById("closeSearch");


if(closeSearchBtn){

    closeSearchBtn.onclick=()=>{

        closeSearch();

    };

}



/*====================================================
START SEARCH BUTTON
====================================================*/


const startSearch =
document.getElementById("startSearch");


if(startSearch){


    startSearch.onclick=()=>{


        const query =
        DOM.searchInput.value.trim();



        showSearchResults(

            searchBooks(query)

        );


    };


}



/*====================================================
INITIALIZE
====================================================*/


liveSearch();


console.log(

"Search System Loaded"

);

/*====================================================
 CHISHTI LIBRARY v6
 MOBILE.JS
 PART 5
 PDF READER SYSTEM
====================================================*/


/*====================================================
OPEN READER
====================================================*/

function openReader(book){

    if(!book || !book.pdf){

        showToast(
            "PDF not available",
            "fa-circle-xmark"
        );

        return;

    }


    App.currentBook = book;

    App.currentBookId = book.id;

    App.readerOpen = true;

    App.page = 1;

    App.zoom = 1.4;


    if(DOM.readerTitle){

        DOM.readerTitle.innerText =
        book.title;

    }


    DOM.reader.classList.add(
        "active"
    );


    loadPDF(
        book.pdf
    );


}



/*====================================================
CLOSE READER
====================================================*/

function closeReader(){

    DOM.reader.classList.remove(
        "active"
    );


    App.readerOpen = false;


    if(App.pdf){

        App.pdf.destroy();

        App.pdf = null;

    }


}



/*====================================================
LOAD PDF
====================================================*/

async function loadPDF(url){


    try{


        showLoading();


        const loadingTask =
        pdfjsLib.getDocument(url);



        App.pdf =
        await loadingTask.promise;



        App.totalPages =
        App.pdf.numPages;



        App.page = 1;



        updatePageInfo();



        renderPage(
            App.page
        );



    }

    catch(error){


        console.error(
            error
        );


        showToast(
            "PDF loading failed",
            "fa-triangle-exclamation"
        );


    }

    finally{


        hideLoading();


    }


}



/*====================================================
RENDER PAGE
====================================================*/

async function renderPage(pageNumber){


    if(!App.pdf) return;



    if(App.rendering){

        App.pendingPage =
        pageNumber;

        return;

    }



    App.rendering = true;



    try{


        const page =
        await App.pdf.getPage(
            pageNumber
        );



        const viewport =
        page.getViewport({

            scale:App.zoom

        });



        DOM.canvas.width =
        viewport.width;


        DOM.canvas.height =
        viewport.height;



        const renderContext = {

            canvasContext:ctx,

            viewport:viewport

        };



        await page.render(
            renderContext
        ).promise;



        updatePageInfo();



    }

    catch(error){


        console.log(
            error
        );


    }



    App.rendering=false;



    if(App.pendingPage){

        let next =
        App.pendingPage;

        App.pendingPage=null;

        renderPage(next);

    }



}



/*====================================================
NEXT PAGE
====================================================*/

function nextPage(){


    if(
        App.page >= App.totalPages
    )
    return;



    App.page++;



    renderPage(
        App.page
    );



}



/*====================================================
PREVIOUS PAGE
====================================================*/

function previousPage(){


    if(App.page <= 1)
    return;



    App.page--;



    renderPage(
        App.page
    );


}



/*====================================================
ZOOM
====================================================*/

function zoomIn(){


    App.zoom +=0.2;



    renderPage(
        App.page
    );


}



function zoomOut(){


    if(App.zoom <=0.8)
    return;



    App.zoom -=0.2;



    renderPage(
        App.page
    );


}



/*====================================================
UPDATE PAGE INFO
====================================================*/

function updatePageInfo(){


    if(DOM.pageCounter){


        DOM.pageCounter.innerText =

        `${App.page} / ${App.totalPages}`;


    }



    if(DOM.readerInfo){


        DOM.readerInfo.innerText =

        `Page ${App.page} / ${App.totalPages}`;


    }


}



/*====================================================
READER BUTTON EVENTS
====================================================*/


document
.getElementById("prevPageBtn")
?.addEventListener(

"click",

previousPage

);



document
.getElementById("nextPageBtn")
?.addEventListener(

"click",

nextPage

);



document
.getElementById("zoomInBtn")
?.addEventListener(

"click",

zoomIn

);



document
.getElementById("zoomOutBtn")
?.addEventListener(

"click",

zoomOut

);



document
.getElementById("readerBackBtn")
?.addEventListener(

"click",

closeReader

);

/*====================================================
 CHISHTI LIBRARY v6
 MOBILE.JS
 PART 6
 BOOKMARK + FAVORITE SYSTEM
====================================================*/


/*====================================================
ADD BOOKMARK
====================================================*/

function addBookmark(){

    if(!App.currentBook){

        showToast(
            "No book opened",
            "warning"
        );

        return;

    }


    const bookmark = {

        id:
        Date.now(),

        bookId:
        App.currentBookId,

        title:
        App.currentBook.title,

        page:
        App.page,

        date:
        new Date().toLocaleString()

    };


    App.bookmarks.push(bookmark);


    saveData();


    renderBookmarks();


    showToast(
        "Bookmark Added",
        "success"
    );

}



/*====================================================
REMOVE BOOKMARK
====================================================*/

function removeBookmark(id){


    App.bookmarks =
    App.bookmarks.filter(

        item =>
        item.id !== id

    );


    saveData();


    renderBookmarks();


    showToast(

        "Bookmark Removed",

        "success"

    );

}



/*====================================================
RENDER BOOKMARKS
====================================================*/

function renderBookmarks(){


    if(!DOM.bookmarkList)
    return;


    DOM.bookmarkList.innerHTML="";


    if(App.bookmarks.length===0){


        DOM.bookmarkList.innerHTML = `

        <div class="empty-state">

            <i class="fas fa-bookmark"></i>

            <p>
            No bookmarks yet
            </p>

        </div>

        `;


        return;

    }



    App.bookmarks.forEach(

        bookmark => {


            const item =
            document.createElement("div");


            item.className =
            "bookmark-item";


            item.innerHTML = `

            <div>

                <h4>
                ${bookmark.title}
                </h4>

                <span>
                Page ${bookmark.page}
                </span>

            </div>


            <button
            onclick="
            removeBookmark(${bookmark.id})
            ">

                <i class="fas fa-trash"></i>

            </button>

            `;


            DOM.bookmarkList.appendChild(item);


        }

    );


}



/*====================================================
FAVORITES
====================================================*/


function toggleFavorite(bookId){


    const index =

    App.favorites.indexOf(bookId);



    if(index === -1){


        App.favorites.push(bookId);


        showToast(

            "Added to Favorites",

            "success"

        );


    }

    else{


        App.favorites.splice(

            index,

            1

        );


        showToast(

            "Removed from Favorites",

            "success"

        );


    }


    saveData();


    updateStats();


}



/*====================================================
CHECK FAVORITE
====================================================*/

function isFavorite(bookId){


    return App.favorites.includes(

        bookId

    );


}



/*====================================================
LOAD SAVED DATA
====================================================*/

function loadSavedData(){


    try{


        App.bookmarks =

        JSON.parse(

            localStorage.getItem(
                "chishtiBookmarks"
            )

        ) || [];



        App.favorites =

        JSON.parse(

            localStorage.getItem(
                "chishtiFavorites"
            )

        ) || [];



        App.history =

        JSON.parse(

            localStorage.getItem(
                "chishtiHistory"
            )

        ) || [];



    }

    catch(error){


        console.log(

            "Storage Error",

            error

        );


    }


}



/*====================================================
SAVE DATA
====================================================*/

function saveData(){


    localStorage.setItem(

        "chishtiBookmarks",

        JSON.stringify(

            App.bookmarks

        )

    );



    localStorage.setItem(

        "chishtiFavorites",

        JSON.stringify(

            App.favorites

        )

    );



    localStorage.setItem(

        "chishtiHistory",

        JSON.stringify(

            App.history

        )

    );


}



/*====================================================
BOOKMARK BUTTON
====================================================*/

const bookmarkBtn =

document.getElementById(

    "bookmarkBtn"

);



if(bookmarkBtn){


    bookmarkBtn.addEventListener(

        "click",

        addBookmark

    );


}



/*====================================================
INIT BOOKMARK SYSTEM
====================================================*/

loadSavedData();


renderBookmarks();

/*====================================================
 CHISHTI LIBRARY v6
 MOBILE.JS
 PART 7
 SETTINGS + THEME ENGINE
====================================================*/


/*====================================================
SETTINGS STATE
====================================================*/

const Settings = {

    theme:
    localStorage.getItem("chishti_theme")
    || "maroon",

    zoom:
    Number(
        localStorage.getItem("reader_zoom")
    )
    || 1.4,

    animation:
    localStorage.getItem("animations")
    !== "false",

    continueReading:
    localStorage.getItem("continue_reading")
    !== "false"

};


/*====================================================
APPLY THEME
====================================================*/

function applyTheme(theme){

    document.body
    .setAttribute(
        "data-theme",
        theme
    );


    Settings.theme = theme;


    localStorage.setItem(

        "chishti_theme",

        theme

    );


    showToast(

        "Theme Changed"

    );

}



/*====================================================
LOAD SETTINGS
====================================================*/

function loadSettings(){


    applyTheme(

        Settings.theme

    );


    App.zoom =
    Settings.zoom;


    const zoom =
    document.getElementById(
        "defaultZoom"
    );


    if(zoom){

        zoom.value =
        Settings.zoom;

    }



    const animation =
    document.getElementById(
        "animationToggle"
    );


    if(animation){

        animation.checked =
        Settings.animation;

    }



    const continueBtn =
    document.getElementById(
        "continueReadingToggle"
    );


    if(continueBtn){

        continueBtn.checked =
        Settings.continueReading;

    }

}



/*====================================================
SAVE SETTINGS
====================================================*/

function saveSettings(){


    const theme =
    document.getElementById(
        "themeSelect"
    );


    if(theme){

        applyTheme(

            theme.value

        );

    }



    const zoom =
    document.getElementById(
        "defaultZoom"
    );


    if(zoom){

        Settings.zoom =
        Number(
            zoom.value
        );


        localStorage.setItem(

            "reader_zoom",

            Settings.zoom

        );

    }



    const animation =
    document.getElementById(
        "animationToggle"
    );


    if(animation){

        Settings.animation =
        animation.checked;


        localStorage.setItem(

            "animations",

            animation.checked

        );

    }



    const continueReading =
    document.getElementById(
        "continueReadingToggle"
    );


    if(continueReading){

        Settings.continueReading =
        continueReading.checked;


        localStorage.setItem(

            "continue_reading",

            continueReading.checked

        );

    }


    closePopup(

        "settingsOverlay"

    );


    showToast(

        "Settings Saved"

    );


}



/*====================================================
ANIMATION CONTROL
====================================================*/

function checkAnimations(){


    if(
        !Settings.animation
    ){

        document.body.classList.add(

            "reduce-motion"

        );

    }

    else{

        document.body.classList.remove(

            "reduce-motion"

        );

    }

}



/*====================================================
THEME BUTTON
====================================================*/

const themeBtn =
document.getElementById(
    "themeBtn"
);


if(themeBtn){

themeBtn.onclick = () => {


    let current =
    document.body
    .getAttribute(
        "data-theme"
    );


    let next =
    "dark";


    if(current==="dark"){

        next="maroon";

    }

    else if(current==="maroon"){

        next="sepia";

    }

    else if(current==="sepia"){

        next="light";

    }

    else{

        next="dark";

    }


    applyTheme(next);


};


}



/*====================================================
SAVE SETTINGS BUTTON
====================================================*/

const saveSettingsBtn =
document.getElementById(
    "saveSettings"
);


if(saveSettingsBtn){

saveSettingsBtn.onclick = () => {

    saveSettings();

};

}



/*====================================================
INITIAL SETTINGS
====================================================*/

document.addEventListener(

"DOMContentLoaded",

()=>{


    loadSettings();


    checkAnimations();


});

/*====================================================
 CHISHTI LIBRARY v6
 MOBILE.JS
 PART 8
 GESTURES + NAVIGATION
====================================================*/


/*====================================================
 SWIPE GESTURE
====================================================*/

document.addEventListener(

"touchstart",

(e)=>{

    if(!e.touches[0]) return;

    App.touchStartX =
    e.touches[0].clientX;

},

{
passive:true
});


document.addEventListener(

"touchend",

(e)=>{

    if(!e.changedTouches[0]) return;


    App.touchEndX =
    e.changedTouches[0].clientX;


    handleSwipe();

},

{
passive:true
});



function handleSwipe(){

let distance =
App.touchEndX - App.touchStartX;



/* RIGHT SWIPE */

if(distance > 80){

    console.log(
    "Swipe Right"
    );

}



/* LEFT SWIPE */

if(distance < -80){

    console.log(
    "Swipe Left"
    );

}

}



/*====================================================
 PDF PINCH ZOOM
====================================================*/


let initialPinch = 0;


document.addEventListener(

"touchstart",

(e)=>{


if(e.touches.length === 2){


    initialPinch =
    getDistance(
        e.touches[0],
        e.touches[1]
    );


}

},

{
passive:true
});



document.addEventListener(

"touchmove",

(e)=>{


if(e.touches.length === 2){


let current =

getDistance(

e.touches[0],

e.touches[1]

);



if(current > initialPinch + 20){


    App.zoom += .1;

    updateZoom();


}



if(current < initialPinch - 20){


    App.zoom -= .1;


    if(App.zoom < .5)

    App.zoom=.5;


    updateZoom();


}


}

},

{
passive:true
});



function getDistance(a,b){

return Math.sqrt(

Math.pow(

a.clientX-b.clientX,

2

)

+

Math.pow(

a.clientY-b.clientY,

2

)

);

}



/*====================================================
 ZOOM UPDATE
====================================================*/


function updateZoom(){


if(!DOM.canvas)
return;


DOM.canvas.style.transform =

`scale(${App.zoom})`;



localStorage.setItem(

"readerZoom",

App.zoom

);


}



/*====================================================
 BOTTOM NAVIGATION
====================================================*/


function activateNav(button){


document
.querySelectorAll(".nav-item")
.forEach(

item=>{

item.classList.remove(
"active"
);

}

);



if(button)

button.classList.add(
"active"
);


}



/* HOME */

const navHome =
document.getElementById("navHome");


if(navHome){

navHome.onclick=()=>{


activateNav(navHome);


showSection(
"home"
);


};

}



/* LIBRARY */

const navLibrary =
document.getElementById("navLibrary");


if(navLibrary){

navLibrary.onclick=()=>{


activateNav(navLibrary);


showSection(
"library"
);


};

}



/* SEARCH */

const navSearch =
document.getElementById("navSearch");


if(navSearch){

navSearch.onclick=()=>{


activateNav(navSearch);


openSearch();


};

}



/* FAVORITES */

const navFavorites =
document.getElementById("navFavorites");


if(navFavorites){

navFavorites.onclick=()=>{


activateNav(navFavorites);


showSection(
"favorites"
);


};

}



/* SETTINGS */

const navSettings =
document.getElementById("navSettings");


if(navSettings){

navSettings.onclick=()=>{


activateNav(navSettings);


openSettings();


};

}



/*====================================================
 SECTION SWITCH
====================================================*/


function showSection(name){


console.log(

"Opening section:",

name

);



showToast(

name+" opened",

"fa-circle-check"

);


}



/*====================================================
 READER BUTTON
====================================================*/


const floatingReaderBtn =

document.getElementById(
"floatingReaderBtn"
);



if(floatingReaderBtn){


floatingReaderBtn.onclick=()=>{


openReader();


};


}



/*====================================================
 DEVICE READY
====================================================*/


document.addEventListener(

"visibilitychange",

()=>{


if(document.hidden){

console.log(
"App paused"
);

}

else{

console.log(
"App resumed"
);

}


});
