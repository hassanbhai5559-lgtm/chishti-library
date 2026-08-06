/*==================================================
        CHISHTI LIBRARY READER V3
            JAVASCRIPT PART 1
        GLOBAL VARIABLES + INITIALIZATION
==================================================*/

"use strict";

/*==================================================
                PDF.JS
==================================================*/

pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

/*==================================================
                GLOBAL OBJECT
==================================================*/

const Reader={

pdf:null,

bookUrl:null,

bookTitle:"",

bookAuthor:"",

currentPage:1,

totalPages:0,

zoom:1,

rotation:0,

theme:"dark",

pageRendering:false,

pendingPage:null,

bookmarks:[],

comments:[],

likes:0,

fullscreen:false,

searchResults:[],

toc:[],

thumbnails:[],

history:[],

watermark:"CHISHTI LIBRARY",

};

/*==================================================
                ELEMENTS
==================================================*/

const DOM={

viewer:

document.getElementById("bookViewer"),

leftCanvas:

document.getElementById("leftCanvas"),

rightCanvas:

document.getElementById("rightCanvas"),

leftContext:

document.getElementById("leftCanvas")?.getContext("2d"),

rightContext:

document.getElementById("rightCanvas")?.getContext("2d"),

pageCounter:

document.getElementById("currentPage"),

totalPages:

document.getElementById("totalPages"),

bookTitle:

document.getElementById("bookTitle"),

bookAuthor:

document.getElementById("bookAuthor"),

loading:

document.getElementById("loadingScreen"),

opening:

document.getElementById("openingScreen"),

toast:

document.getElementById("toast"),

progress:

document.getElementById("loadingBar"),

reader:

document.getElementById("reader"),

};

/*==================================================
            LOCAL STORAGE KEYS
==================================================*/

const STORAGE={

BOOKMARKS:

"chishtiBookmarks",

THEME:

"chishtiTheme",

LASTPAGE:

"chishtiLastPage",

LIKES:

"chishtiLikes",

HISTORY:

"chishtiHistory",

COMMENTS:

"chishtiComments",

};

/*==================================================
            INITIALIZATION
==================================================*/

document.addEventListener(

"DOMContentLoaded",

()=>{

initializeReader();

}

);

/*==================================================
            INITIALIZE READER
==================================================*/

function initializeReader(){

loadTheme();

loadBookmarks();

loadHistory();

bindEvents();

showOpeningAnimation();

}

/*==================================================
            OPENING ANIMATION
==================================================*/

function showOpeningAnimation(){

if(!DOM.opening)return;

setTimeout(()=>{

DOM.opening.classList.add("fadeOut");

setTimeout(()=>{

DOM.opening.style.display="none";

},800);

},2200);

}

/*==================================================
            EVENT BINDING
==================================================*/

function bindEvents(){

window.addEventListener(

"resize",

handleResize

);

document.addEventListener(

"keydown",

keyboardControls

);

}

/*==================================================
            WINDOW RESIZE
==================================================*/

function handleResize(){

if(Reader.pdf){

renderCurrentPages();

}

}

/*==================================================
            KEYBOARD
==================================================*/

function keyboardControls(e){

switch(e.key){

case "ArrowRight":

nextPage();

break;

case "ArrowLeft":

previousPage();

break;

case "+":

zoomIn();

break;

case "-":

zoomOut();

break;

case "f":

toggleFullscreen();

break;

}

}

/*==================================================
            PART 1 END
==================================================*/
/*==================================================
        CHISHTI LIBRARY READER V3
            JAVASCRIPT PART 2
        PDF LOADING ENGINE
==================================================*/

/*==================================================
            OPEN PDF
==================================================*/

async function openBook(url,title="",author=""){

try{

showLoader();

Reader.bookUrl=url;

Reader.bookTitle=title;

Reader.bookAuthor=author;

DOM.bookTitle.textContent=title||"Untitled Book";

DOM.bookAuthor.textContent=author||"Unknown Author";

Reader.pdf=

await pdfjsLib.getDocument({

url:url,

cMapPacked:true,

enableXfa:true

}).promise;

Reader.totalPages=

Reader.pdf.numPages;

updatePageCounter();

restoreLastPage();

await renderCurrentPages();

hideLoader();

showToast("Book Loaded Successfully");

}

catch(error){

console.error(error);

hideLoader();

showToast("Unable to Load PDF");

}

}

/*==================================================
            FILE INPUT
==================================================*/

async function openLocalBook(file){

const fileReader=

new FileReader();

fileReader.onload=

async function(e){

await openBook(

e.target.result,

file.name,

"Local Book"

);

};

fileReader.readAsDataURL(file);

}

/*==================================================
            RENDER CURRENT
==================================================*/

async function renderCurrentPages(){

await renderPage(

Reader.currentPage,

DOM.rightCanvas,

DOM.rightContext

);

if(

Reader.currentPage>1

){

await renderPage(

Reader.currentPage-1,

DOM.leftCanvas,

DOM.leftContext

);

}

}

/*==================================================
            RENDER PAGE
==================================================*/

async function renderPage(

pageNumber,

canvas,

context

){

if(

pageNumber<1||

pageNumber>

Reader.totalPages

)return;

Reader.pageRendering=true;

const page=

await Reader.pdf.getPage(pageNumber);

const viewport=

page.getViewport({

scale:Reader.zoom

});

canvas.width=

viewport.width;

canvas.height=

viewport.height;

await page.render({

canvasContext:context,

viewport:viewport

}).promise;

drawWatermark(context,canvas);

Reader.pageRendering=false;

if(

Reader.pendingPage!==null

){

const pending=

Reader.pendingPage;

Reader.pendingPage=null;

renderPage(

pending,

canvas,

context

);

}

}

/*==================================================
            QUEUE PAGE
==================================================*/

function queueRender(page){

if(

Reader.pageRendering

){

Reader.pendingPage=page;

}else{

renderCurrentPages();

}

}

/*==================================================
            LOADER
==================================================*/

function showLoader(){

if(DOM.loading)

DOM.loading.style.display="flex";

}

function hideLoader(){

if(DOM.loading)

DOM.loading.style.display="none";

}

/*==================================================
            PART 2 END
==================================================*/
/*==================================================
        CHISHTI LIBRARY READER V3
            JAVASCRIPT PART 3
        PAGE NAVIGATION ENGINE
==================================================*/

/*==================================================
            NEXT PAGE
==================================================*/

async function nextPage(){

if(

Reader.currentPage>=Reader.totalPages

)return;

Reader.currentPage++;

saveLastPage();

updatePageCounter();

updateReadingProgress();

await playPageFlip("next");

queueRender();

}

/*==================================================
            PREVIOUS PAGE
==================================================*/

async function previousPage(){

if(

Reader.currentPage<=1

)return;

Reader.currentPage--;

saveLastPage();

updatePageCounter();

updateReadingProgress();

await playPageFlip("previous");

queueRender();

}

/*==================================================
            GO TO PAGE
==================================================*/

async function goToPage(page){

page=parseInt(page);

if(

isNaN(page)

)return;

if(

page<1||

page>Reader.totalPages

)return;

Reader.currentPage=page;

saveLastPage();

updatePageCounter();

updateReadingProgress();

await playPageFlip();

queueRender();

}

/*==================================================
            UPDATE PAGE COUNTER
==================================================*/

function updatePageCounter(){

if(DOM.pageCounter)

DOM.pageCounter.textContent=

Reader.currentPage;

if(DOM.totalPages)

DOM.totalPages.textContent=

Reader.totalPages;

}

/*==================================================
            PAGE FLIP
==================================================*/

async function playPageFlip(direction="next"){

const layer=

document.getElementById(

"pageFlipLayer"

);

if(!layer)return;

layer.style.display="block";

layer.classList.remove(

"pageFlipNext",

"pageFlipPrevious"

);

if(direction==="next"){

layer.classList.add(

"pageFlipNext"

);

}else{

layer.classList.add(

"pageFlipPrevious"

);

}

await new Promise(resolve=>{

setTimeout(resolve,850);

});

layer.style.display="none";

}

/*==================================================
            READING PROGRESS
==================================================*/

function updateReadingProgress(){

const progress=

document.getElementById(

"readingProgressFill"

);

const percent=

((Reader.currentPage/

Reader.totalPages)*100)||0;

if(progress){

progress.style.width=

percent+"%";

}

}

/*==================================================
            FIRST PAGE
==================================================*/

function firstPage(){

goToPage(1);

}

/*==================================================
            LAST PAGE
==================================================*/

function lastPage(){

goToPage(

Reader.totalPages

);

}

/*==================================================
            PART 3 END
==================================================*/
/*==================================================
        CHISHTI LIBRARY READER V3
            JAVASCRIPT PART 4
        ZOOM + ROTATION + FULLSCREEN
==================================================*/

/*==================================================
            ZOOM IN
==================================================*/

function zoomIn(){

if(Reader.zoom>=3)return;

Reader.zoom+=0.10;

updateZoomIndicator();

queueRender();

showToast(

"Zoom : "+

Math.round(Reader.zoom*100)+

"%"

);

}

/*==================================================
            ZOOM OUT
==================================================*/

function zoomOut(){

if(Reader.zoom<=0.50)return;

Reader.zoom-=0.10;

updateZoomIndicator();

queueRender();

showToast(

"Zoom : "+

Math.round(Reader.zoom*100)+

"%"

);

}

/*==================================================
            RESET ZOOM
==================================================*/

function resetZoom(){

Reader.zoom=1;

updateZoomIndicator();

queueRender();

showToast(

"Zoom Reset"

);

}

/*==================================================
            UPDATE ZOOM
==================================================*/

function updateZoomIndicator(){

const zoom=

document.getElementById(

"zoomIndicator"

);

if(zoom){

zoom.textContent=

Math.round(

Reader.zoom*100

)+"%";

}

}

/*==================================================
            ROTATE RIGHT
==================================================*/

function rotateRight(){

Reader.rotation+=90;

if(

Reader.rotation>=360

){

Reader.rotation=0;

}

applyRotation();

showToast(

"Rotate Right"

);

}

/*==================================================
            ROTATE LEFT
==================================================*/

function rotateLeft(){

Reader.rotation-=90;

if(

Reader.rotation<0

){

Reader.rotation=270;

}

applyRotation();

showToast(

"Rotate Left"

);

}

/*==================================================
            APPLY ROTATION
==================================================*/

function applyRotation(){

const pages=

document.querySelectorAll(

".bookPage canvas"

);

pages.forEach(canvas=>{

canvas.style.transform=

`rotate(${Reader.rotation}deg)`;

});

}

/*==================================================
            FULLSCREEN
==================================================*/

function toggleFullscreen(){

if(

!document.fullscreenElement

){

document.documentElement

.requestFullscreen();

Reader.fullscreen=true;

showToast(

"Fullscreen Enabled"

);

}else{

document.exitFullscreen();

Reader.fullscreen=false;

showToast(

"Fullscreen Disabled"

);

}

}

/*==================================================
            FULLSCREEN EVENT
==================================================*/

document.addEventListener(

"fullscreenchange",

()=>{

Reader.fullscreen=

!!document.fullscreenElement;

});

/*==================================================
            FIT WIDTH
==================================================*/

function fitWidth(){

Reader.zoom=1.35;

updateZoomIndicator();

queueRender();

}

/*==================================================
            FIT PAGE
==================================================*/

function fitPage(){

Reader.zoom=1;

updateZoomIndicator();

queueRender();

}

/*==================================================
            PART 4 END
==================================================*/
/*==================================================
        CHISHTI LIBRARY READER V3
            JAVASCRIPT PART 5
        BOOKMARK SYSTEM
==================================================*/

/*==================================================
            LOAD BOOKMARKS
==================================================*/

function loadBookmarks(){

const data=

localStorage.getItem(

STORAGE.BOOKMARKS

);

Reader.bookmarks=

data?

JSON.parse(data):[];

renderBookmarks();

}

/*==================================================
            SAVE BOOKMARKS
==================================================*/

function saveBookmarks(){

localStorage.setItem(

STORAGE.BOOKMARKS,

JSON.stringify(

Reader.bookmarks

)

);

}

/*==================================================
            ADD BOOKMARK
==================================================*/

function addBookmark(){

const exists=

Reader.bookmarks.find(

item=>

item.page===

Reader.currentPage

);

if(exists){

showToast(

"Bookmark Already Exists"

);

return;

}

Reader.bookmarks.push({

page:

Reader.currentPage,

title:

Reader.bookTitle,

date:

new Date()

.toLocaleString()

});

saveBookmarks();

renderBookmarks();

showToast(

"Bookmark Saved"

);

}

/*==================================================
            REMOVE BOOKMARK
==================================================*/

function removeBookmark(page){

Reader.bookmarks=

Reader.bookmarks.filter(

item=>

item.page!==page

);

saveBookmarks();

renderBookmarks();

showToast(

"Bookmark Removed"

);

}

/*==================================================
            RENDER BOOKMARKS
==================================================*/

function renderBookmarks(){

const container=

document.getElementById(

"bookmarkContainer"

);

if(!container)return;

container.innerHTML="";

if(

Reader.bookmarks.length===0

){

container.innerHTML=

"<p>No Bookmarks Yet</p>";

return;

}

Reader.bookmarks.forEach(

bookmark=>{

const card=

document.createElement(

"div"

);

card.className=

"bookmarkCard";

card.innerHTML=

`

<div>

<h4>

Page ${bookmark.page}

</h4>

<p>

${bookmark.date}

</p>

</div>

<div>

<button

onclick="goToBookmark(${bookmark.page})">

Open

</button>

<button

onclick="removeBookmark(${bookmark.page})">

Delete

</button>

</div>

`;

container.appendChild(

card

);

}

);

}

/*==================================================
            OPEN BOOKMARK
==================================================*/

function goToBookmark(page){

goToPage(page);

showToast(

"Opened Bookmark"

);

}

/*==================================================
            TOGGLE BOOKMARK
==================================================*/

function toggleBookmark(){

const exists=

Reader.bookmarks.find(

b=>

b.page===

Reader.currentPage

);

if(exists){

removeBookmark(

Reader.currentPage

);

}else{

addBookmark();

}

}

/*==================================================
            CLEAR BOOKMARKS
==================================================*/

function clearBookmarks(){

if(

!confirm(

"Delete all bookmarks?"

)

)return;

Reader.bookmarks=[];

saveBookmarks();

renderBookmarks();

showToast(

"Bookmarks Cleared"

);

}

/*==================================================
            LAST PAGE
==================================================*/

function saveLastPage(){

localStorage.setItem(

STORAGE.LASTPAGE,

Reader.currentPage

);

}

/*==================================================
            RESTORE LAST PAGE
==================================================*/

function restoreLastPage(){

const page=

parseInt(

localStorage.getItem(

STORAGE.LASTPAGE

)

);

if(

!isNaN(page)

){

Reader.currentPage=page;

}

}

/*==================================================
            PART 5 END
==================================================*/
/*==================================================
        CHISHTI LIBRARY READER V3
            JAVASCRIPT PART 6
        THEME MANAGEMENT SYSTEM
==================================================*/

/*==================================================
            LOAD THEME
==================================================*/

function loadTheme(){

const savedTheme=

localStorage.getItem(

STORAGE.THEME

);

Reader.theme=

savedTheme||

"dark";

applyTheme(

Reader.theme

);

}

/*==================================================
            APPLY THEME
==================================================*/

function applyTheme(theme){

Reader.theme=theme;

document.body.classList.remove(

"theme-dark",

"theme-light",

"theme-maroon",

"theme-gold"

);

document.body.classList.add(

"theme-"+theme

);

localStorage.setItem(

STORAGE.THEME,

theme

);

highlightActiveTheme();

showToast(

theme.charAt(0).toUpperCase()+

theme.slice(1)+

" Theme Enabled"

);

}

/*==================================================
            CHANGE THEME
==================================================*/

function changeTheme(theme){

applyTheme(theme);

}

/*==================================================
            ACTIVE THEME CARD
==================================================*/

function highlightActiveTheme(){

document

.querySelectorAll(

".themeCard"

)

.forEach(card=>{

card.classList.remove(

"active"

);

if(

card.dataset.theme===

Reader.theme

){

card.classList.add(

"active"

);

}

});

}

/*==================================================
            TOGGLE DARK/LIGHT
==================================================*/

function toggleTheme(){

if(

Reader.theme==="dark"

){

applyTheme(

"light"

);

}else{

applyTheme(

"dark"

);

}

}

/*==================================================
            NEXT THEME
==================================================*/

function nextTheme(){

const themes=[

"dark",

"light",

"maroon",

"gold"

];

let index=

themes.indexOf(

Reader.theme

);

index++;

if(

index>=themes.length

){

index=0;

}

applyTheme(

themes[index]

);

}

/*==================================================
            PREVIOUS THEME
==================================================*/

function previousTheme(){

const themes=[

"dark",

"light",

"maroon",

"gold"

];

let index=

themes.indexOf(

Reader.theme

);

index--;

if(

index<0

){

index=

themes.length-1;

}

applyTheme(

themes[index]

);

}

/*==================================================
            AUTO THEME
==================================================*/

function autoTheme(){

const hour=

new Date()

.getHours();

if(

hour>=6&&

hour<18

){

applyTheme(

"light"

);

}else{

applyTheme(

"dark"

);

}

}

/*==================================================
            SYSTEM THEME
==================================================*/

function followSystemTheme(){

const dark=

window.matchMedia(

"(prefers-color-scheme: dark)"

).matches;

applyTheme(

dark?

"dark":

"light"

);

}

/*==================================================
            SYSTEM CHANGE
==================================================*/

window.matchMedia(

"(prefers-color-scheme: dark)"

).addEventListener(

"change",

()=>{

if(

localStorage.getItem(

"followSystem"

)==="true"

){

followSystemTheme();

}

}

);

/*==================================================
            SAVE OPTION
==================================================*/

function setFollowSystem(value){

localStorage.setItem(

"followSystem",

value

);

if(value){

followSystemTheme();

}

}

/*==================================================
            RESET SETTINGS
==================================================*/

function resetThemeSettings(){

applyTheme(

"dark"

);

localStorage.removeItem(

"followSystem"

);

showToast(

"Theme Reset"

);

}

/*==================================================
            PART 6 END
==================================================*/
/*==================================================
        CHISHTI LIBRARY READER V3
            JAVASCRIPT PART 7
        SEARCH SYSTEM
==================================================*/

/*==================================================
            SEARCH DATA
==================================================*/

Reader.searchText=[];

/*==================================================
            BUILD SEARCH INDEX
==================================================*/

async function buildSearchIndex(){

Reader.searchText=[];

if(!Reader.pdf)return;

showLoader();

for(

let i=1;

i<=Reader.totalPages;

i++

){

const page=

await Reader.pdf.getPage(i);

const text=

await page.getTextContent();

const content=

text.items

.map(

item=>item.str

)

.join(" ");

Reader.searchText.push({

page:i,

text:content.toLowerCase()

});

updateLoadingProgress(

(i/

Reader.totalPages)

*100

);

}

hideLoader();

}

/*==================================================
            SEARCH BOOK
==================================================*/

function searchBook(){

const input=

document.getElementById(

"searchInput"

);

if(!input)return;

const keyword=

input.value

.trim()

.toLowerCase();

if(

keyword===""

){

clearSearch();

return;

}

Reader.searchResults=

Reader.searchText.filter(

item=>

item.text.includes(

keyword

)

);

renderSearchResults(

keyword

);

}

/*==================================================
            RENDER RESULTS
==================================================*/

function renderSearchResults(keyword){

const container=

document.getElementById(

"searchResults"

);

if(!container)return;

container.innerHTML="";

if(

Reader.searchResults.length===0

){

container.innerHTML=

`

<div class="searchEmpty">

No Result Found

</div>

`;

showToast(

"No Results"

);

return;

}

Reader.searchResults.forEach(

result=>{

const card=

document.createElement(

"div"

);

card.className=

"searchResult";

const preview=

result.text

.substring(

result.text.indexOf(

keyword

)-40,

result.text.indexOf(

keyword

)+80

);

card.innerHTML=

`

<h4>

Page ${result.page}

</h4>

<p>

...${preview}...

</p>

`;

card.onclick=()=>{

goToPage(

result.page

);

closeSearchPanel();

};

container.appendChild(

card

);

}

);

showToast(

Reader.searchResults.length+

" Results Found"

);

}

/*==================================================
            CLEAR SEARCH
==================================================*/

function clearSearch(){

Reader.searchResults=[];

const container=

document.getElementById(

"searchResults"

);

if(container)

container.innerHTML="";

}

/*==================================================
            SEARCH ENTER
==================================================*/

document

.getElementById(

"searchInput"

)

?.addEventListener(

"keydown",

e=>{

if(

e.key==="Enter"

){

searchBook();

}

}

);

/*==================================================
            OPEN PANEL
==================================================*/

function openSearchPanel(){

document

.getElementById(

"searchPanel"

)

.classList.add(

"active"

);

}

/*==================================================
            CLOSE PANEL
==================================================*/

function closeSearchPanel(){

document

.getElementById(

"searchPanel"

)

.classList.remove(

"active"

);

}

/*==================================================
            HIGHLIGHT RESULT
==================================================*/

function highlightSearchWord(

text,

word

){

const regex=

new RegExp(

word,

"gi"

);

return text.replace(

regex,

match=>

`<mark>${match}</mark>`

);

}

/*==================================================
            PART 7 END
==================================================*/
/*==================================================
        CHISHTI LIBRARY READER V3
            JAVASCRIPT PART 8
        TABLE OF CONTENTS + THUMBNAILS
==================================================*/

/*==================================================
            LOAD OUTLINE
==================================================*/

async function loadTableOfContents(){

if(!Reader.pdf)return;

const outline=

await Reader.pdf.getOutline();

Reader.toc=[];

if(!outline)return;

for(const item of outline){

let page=1;

try{

const destination=

await Reader.pdf.getDestination(

item.dest

);

const ref=

destination[0];

page=

(await Reader.pdf.getPageIndex(ref))+1;

}catch(e){

page=1;

}

Reader.toc.push({

title:item.title,

page:page

});

}

renderTOC();

}

/*==================================================
            RENDER TOC
==================================================*/

function renderTOC(){

const container=

document.getElementById(

"tocContainer"

);

if(!container)return;

container.innerHTML="";

Reader.toc.forEach(item=>{

const row=

document.createElement(

"div"

);

row.className=

"tocItem";

row.innerHTML=

`

<span>${item.title}</span>

<strong>${item.page}</strong>

`;

row.onclick=()=>{

goToPage(item.page);

closeTOC();

};

container.appendChild(row);

});

}

/*==================================================
            LOAD THUMBNAILS
==================================================*/

async function generateThumbnails(){

const container=

document.getElementById(

"thumbnailContainer"

);

if(!container)return;

container.innerHTML="";

for(

let i=1;

i<=Reader.totalPages;

i++

){

const page=

await Reader.pdf.getPage(i);

const viewport=

page.getViewport({

scale:0.22

});

const canvas=

document.createElement(

"canvas"

);

const ctx=

canvas.getContext("2d");

canvas.width=

viewport.width;

canvas.height=

viewport.height;

await page.render({

canvasContext:ctx,

viewport:viewport

}).promise;

const card=

document.createElement(

"div"

);

card.className=

"thumbnailCard";

card.innerHTML=

`

<div class="thumbnailNumber">

Page ${i}

</div>

`;

card.prepend(canvas);

card.onclick=()=>{

goToPage(i);

closeThumbnailPanel();

};

container.appendChild(card);

}

}

/*==================================================
            TOC PANEL
==================================================*/

function openTOC(){

document

.getElementById(

"tocPanel"

)

.classList.add(

"active"

);

}

function closeTOC(){

document

.getElementById(

"tocPanel"

)

.classList.remove(

"active"

);

}

/*==================================================
        THUMBNAIL PANEL
==================================================*/

function openThumbnailPanel(){

document

.getElementById(

"thumbnailSidebar"

)

.classList.add(

"active"

);

}

function closeThumbnailPanel(){

document

.getElementById(

"thumbnailSidebar"

)

.classList.remove(

"active"

);

}

/*==================================================
            REFRESH
==================================================*/

async function refreshOutline(){

await loadTableOfContents();

await generateThumbnails();

}

/*==================================================
            PART 8 END
==================================================*/
/*==================================================
        CHISHTI LIBRARY READER V3
            JAVASCRIPT PART 9
        LIKE + SHARE SYSTEM
==================================================*/

/*==================================================
                LOAD LIKES
==================================================*/

function loadLikes(){

const likes=

localStorage.getItem(

STORAGE.LIKES

);

Reader.likes=

likes?

parseInt(likes):0;

updateLikeCounter();

}

/*==================================================
                UPDATE COUNTER
==================================================*/

function updateLikeCounter(){

const counter=

document.getElementById(

"likeCount"

);

if(counter){

counter.textContent=

Reader.likes;

}

}

/*==================================================
                LIKE BOOK
==================================================*/

function likeBook(){

const key=

"liked_"+

Reader.bookTitle;

if(

localStorage.getItem(key)

){

showToast(

"You already liked this book"

);

return;

}

Reader.likes++;

localStorage.setItem(

STORAGE.LIKES,

Reader.likes

);

localStorage.setItem(

key,

true

);

updateLikeCounter();

animateLikeButton();

showToast(

"Thanks for liking ❤️"

);

}

/*==================================================
            LIKE ANIMATION
==================================================*/

function animateLikeButton(){

const button=

document.getElementById(

"likeButton"

);

if(!button)return;

button.classList.add(

"pulse"

);

setTimeout(()=>{

button.classList.remove(

"pulse"

);

},600);

}

/*==================================================
                SHARE BOOK
==================================================*/

async function shareBook(){

const shareData={

title:

Reader.bookTitle,

text:

"I am reading "+

Reader.bookTitle+

" on Chishti Library",

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

showToast(

"Book Shared"

);

}

catch(e){}

}else{

copyBookLink();

}

}

/*==================================================
            COPY LINK
==================================================*/

function copyBookLink(){

navigator.clipboard

.writeText(

window.location.href

);

showToast(

"Book Link Copied"

);

}

/*==================================================
            SHARE WHATSAPP
==================================================*/

function shareWhatsApp(){

const url=

encodeURIComponent(

window.location.href

);

const text=

encodeURIComponent(

"I am reading "+

Reader.bookTitle+

" on Chishti Library"

);

window.open(

`https://wa.me/?text=${text}%20${url}`,

"_blank"

);

}

/*==================================================
            SHARE FACEBOOK
==================================================*/

function shareFacebook(){

const url=

encodeURIComponent(

window.location.href

);

window.open(

`https://www.facebook.com/sharer/sharer.php?u=${url}`,

"_blank"

);

}

/*==================================================
            SHARE TWITTER
==================================================*/

function shareTwitter(){

const url=

encodeURIComponent(

window.location.href

);

const text=

encodeURIComponent(

Reader.bookTitle

);

window.open(

`https://twitter.com/intent/tweet?text=${text}&url=${url}`,

"_blank"

);

}

/*==================================================
            SHARE TELEGRAM
==================================================*/

function shareTelegram(){

const url=

encodeURIComponent(

window.location.href

);

const text=

encodeURIComponent(

Reader.bookTitle

);

window.open(

`https://t.me/share/url?url=${url}&text=${text}`,

"_blank"

);

}

/*==================================================
            PART 9 END
==================================================*/
/*==================================================
        CHISHTI LIBRARY READER V3
            JAVASCRIPT PART 10
        FIREBASE COMMENTS SYSTEM
==================================================*/

/*==================================================
                FIREBASE CONFIG
   Replace with your own Firebase project keys
==================================================*/

const firebaseConfig={

apiKey:"YOUR_API_KEY",

authDomain:"YOUR_PROJECT.firebaseapp.com",

projectId:"YOUR_PROJECT_ID",

storageBucket:"YOUR_PROJECT.appspot.com",

messagingSenderId:"YOUR_SENDER_ID",

appId:"YOUR_APP_ID"

};

/*==================================================
                INITIALIZE FIREBASE
==================================================*/

firebase.initializeApp(firebaseConfig);

const db=firebase.firestore();

/*==================================================
                LOAD COMMENTS
==================================================*/

function loadComments(){

if(!Reader.bookTitle)return;

db.collection("comments")

.where(

"book",

"==",

Reader.bookTitle

)

.orderBy(

"time",

"desc"

)

.onSnapshot(snapshot=>{

const container=

document.getElementById(

"commentList"

);

if(!container)return;

container.innerHTML="";

snapshot.forEach(doc=>{

createCommentCard(

doc.data()

);

});

updateCommentCount();

});

}

/*==================================================
                SUBMIT COMMENT
==================================================*/

async function submitComment(){

const name=

document

.getElementById(

"commentName"

)

.value

.trim();

const message=

document

.getElementById(

"commentMessage"

)

.value

.trim();

if(

name===""||

message===""

){

showToast(

"Please fill all fields"

);

return;

}

await db

.collection(

"comments"

)

.add({

book:

Reader.bookTitle,

name:name,

message:message,

page:

Reader.currentPage,

time:

firebase.firestore

.FieldValue

.serverTimestamp()

});

document

.getElementById(

"commentMessage"

)

.value="";

showToast(

"Comment Posted"

);

}

/*==================================================
            CREATE COMMENT
==================================================*/

function createCommentCard(data){

const container=

document.getElementById(

"commentList"

);

const card=

document.createElement(

"div"

);

card.className=

"commentCard";

const avatar=

data.name

.charAt(0)

.toUpperCase();

card.innerHTML=

`

<div class="commentAvatar">

${avatar}

</div>

<div class="commentRight">

<div class="commentHeader">

<div>

<div class="commentUser">

${data.name}

</div>

<div class="commentDate">

Page ${data.page}

</div>

</div>

</div>

<div class="commentText">

${escapeHTML(data.message)}

</div>

<div class="commentFooter">

<button onclick="likeComment(this)">

👍 Like

</button>

<button onclick="replyComment('${data.name}')">

↩ Reply

</button>

</div>

</div>

`;

container.appendChild(card);

}

/*==================================================
            COMMENT COUNT
==================================================*/

async function updateCommentCount(){

const snap=

await db

.collection(

"comments"

)

.where(

"book",

"==",

Reader.bookTitle

)

.get();

const total=

document.getElementById(

"commentCount"

);

if(total){

total.textContent=

snap.size;

}

}

/*==================================================
            COMMENT LIKE
==================================================*/

function likeComment(button){

let count=

Number(

button.dataset.count||0

);

count++;

button.dataset.count=count;

button.innerHTML=

`👍 ${count}`;

}

/*==================================================
            COMMENT REPLY
==================================================*/

function replyComment(name){

const input=

document.getElementById(

"commentMessage"

);

input.focus();

input.value=

"@"+name+" ";

}

/*==================================================
            ESCAPE HTML
==================================================*/

function escapeHTML(text){

const div=

document.createElement("div");

div.innerText=text;

return div.innerHTML;

}

/*==================================================
            PART 10 END
==================================================*/
/*==================================================
        CHISHTI LIBRARY READER V3
            JAVASCRIPT PART 11
        READING HISTORY + RECENT BOOKS
==================================================*/

/*==================================================
            LOAD HISTORY
==================================================*/

function loadHistory(){

const history=

localStorage.getItem(

STORAGE.HISTORY

);

Reader.history=

history?

JSON.parse(history):[];

renderHistory();

}

/*==================================================
            SAVE HISTORY
==================================================*/

function saveHistory(){

localStorage.setItem(

STORAGE.HISTORY,

JSON.stringify(

Reader.history

)

);

}

/*==================================================
            ADD HISTORY
==================================================*/

function addToHistory(){

if(!Reader.bookTitle)return;

const index=

Reader.history.findIndex(

book=>

book.title===

Reader.bookTitle

);

const item={

title:

Reader.bookTitle,

author:

Reader.bookAuthor,

page:

Reader.currentPage,

total:

Reader.totalPages,

time:

new Date()

.toLocaleString(),

url:

Reader.bookUrl

};

if(index!==-1){

Reader.history.splice(

index,

1

);

}

Reader.history.unshift(

item

);

if(

Reader.history.length>25

){

Reader.history.pop();

}

saveHistory();

renderHistory();

}

/*==================================================
            RENDER HISTORY
==================================================*/

function renderHistory(){

const container=

document.getElementById(

"historyContainer"

);

if(!container)return;

container.innerHTML="";

if(

Reader.history.length===0

){

container.innerHTML=

`

<div class="emptyState">

No Reading History

</div>

`;

return;

}

Reader.history.forEach(book=>{

const card=

document.createElement(

"div"

);

card.className=

"historyCard";

card.innerHTML=

`

<div class="historyInfo">

<h3>

${book.title}

</h3>

<p>

${book.author}

</p>

<small>

Page ${book.page}/${book.total}

</small>

</div>

<div class="historyActions">

<button

onclick="resumeBook('${book.url}',${book.page})">

Resume

</button>

</div>

`;

container.appendChild(

card

);

});

}

/*==================================================
            RESUME BOOK
==================================================*/

async function resumeBook(

url,

page

){

await openBook(

url

);

Reader.currentPage=

page;

queueRender();

showToast(

"Resumed Reading"

);

}

/*==================================================
            UPDATE HISTORY
==================================================*/

function updateHistoryPage(){

const index=

Reader.history.findIndex(

book=>

book.title===

Reader.bookTitle

);

if(index!==-1){

Reader.history[index].page=

Reader.currentPage;

Reader.history[index].time=

new Date()

.toLocaleString();

saveHistory();

}

}

/*==================================================
            REMOVE HISTORY
==================================================*/

function removeHistory(title){

Reader.history=

Reader.history.filter(

book=>

book.title!==title

);

saveHistory();

renderHistory();

showToast(

"History Removed"

);

}

/*==================================================
            CLEAR HISTORY
==================================================*/

function clearHistory(){

if(

!confirm(

"Clear Reading History?"

)

)return;

Reader.history=[];

saveHistory();

renderHistory();

showToast(

"History Cleared"

);

}

/*==================================================
            AUTO SAVE
==================================================*/

setInterval(()=>{

if(

Reader.bookTitle

){

updateHistoryPage();

saveLastPage();

}

},10000);

/*==================================================
            PART 11 END
==================================================*/
/*==================================================
        CHISHTI LIBRARY READER V3
            JAVASCRIPT PART 12
        WATERMARK + READING PROGRESS + TOAST
==================================================*/

/*==================================================
            DRAW WATERMARK
==================================================*/

function drawWatermark(context,canvas){

if(!context||!canvas)return;

context.save();

context.translate(

canvas.width/2,

canvas.height/2

);

context.rotate(

-25*Math.PI/180

);

context.font=

"bold 48px Poppins";

context.fillStyle=

"rgba(0,0,0,0.05)";

context.textAlign=

"center";

context.fillText(

Reader.watermark,

0,

0

);

context.restore();

}

/*==================================================
            UPDATE PROGRESS
==================================================*/

function updateReadingProgress(){

const percent=

Math.round(

(

Reader.currentPage/

Reader.totalPages

)*100

);

const progress=

document.getElementById(

"readingProgressFill"

);

const text=

document.getElementById(

"readingProgressText"

);

if(progress){

progress.style.width=

percent+"%";

}

if(text){

text.textContent=

percent+"% Completed";

}

}

/*==================================================
            LOADING PROGRESS
==================================================*/

function updateLoadingProgress(percent){

const bar=

document.getElementById(

"loadingBar"

);

const text=

document.getElementById(

"loadingPercent"

);

if(bar){

bar.style.width=

percent+"%";

}

if(text){

text.textContent=

Math.round(percent)+"%";

}

}

/*==================================================
            SHOW TOAST
==================================================*/

function showToast(message){

const toast=

document.getElementById(

"toast"

);

if(!toast)return;

toast.textContent=

message;

toast.classList.remove(

"show"

);

void toast.offsetWidth;

toast.classList.add(

"show"

);

}

/*==================================================
            HIDE TOAST
==================================================*/

function hideToast(){

const toast=

document.getElementById(

"toast"

);

if(!toast)return;

toast.classList.remove(

"show"

);

}

/*==================================================
            LOADING TEXT
==================================================*/

function setLoadingText(text){

const loadingText=

document.getElementById(

"loadingText"

);

if(loadingText){

loadingText.textContent=text;

}

}

/*==================================================
            PAGE INFO
==================================================*/

function updatePageInfo(){

const pageInfo=

document.getElementById(

"pageInfo"

);

if(!pageInfo)return;

pageInfo.textContent=

`Page ${Reader.currentPage} of ${Reader.totalPages}`;

}

/*==================================================
            BOOK TITLE
==================================================*/

function updateBookHeader(){

if(DOM.bookTitle){

DOM.bookTitle.textContent=

Reader.bookTitle;

}

if(DOM.bookAuthor){

DOM.bookAuthor.textContent=

Reader.bookAuthor;

}

}

/*==================================================
            READER STATUS
==================================================*/

function updateReaderStatus(){

updatePageCounter();

updatePageInfo();

updateReadingProgress();

updateBookHeader();

}

/*==================================================
            PAGE CHANGE
==================================================*/

function onPageChanged(){

updateReaderStatus();

addToHistory();

saveLastPage();

}

/*==================================================
            BOOK LOADED
==================================================*/

function onBookLoaded(){

hideLoader();

updateReaderStatus();

loadBookmarks();

loadLikes();

loadComments();

buildSearchIndex();

generateThumbnails();

loadTableOfContents();

showToast(

"Book Ready to Read"

);

}

/*==================================================
            PART 12 END
==================================================*/
/*==================================================
        CHISHTI LIBRARY READER V3
            JAVASCRIPT PART 13
        SETTINGS + SIDEBARS + UI CONTROLS
==================================================*/

/*==================================================
            SETTINGS PANEL
==================================================*/

function openSettings(){

const panel=

document.getElementById(

"settingsPanel"

);

if(panel){

panel.classList.add(

"active"

);

}

}

/*==================================================
            CLOSE SETTINGS
==================================================*/

function closeSettings(){

const panel=

document.getElementById(

"settingsPanel"

);

if(panel){

panel.classList.remove(

"active"

);

}

}

/*==================================================
            TOGGLE SETTINGS
==================================================*/

function toggleSettings(){

const panel=

document.getElementById(

"settingsPanel"

);

if(!panel)return;

panel.classList.toggle(

"active"

);

}

/*==================================================
            SIDEBAR
==================================================*/

function openSidebar(id){

closeAllPanels();

const panel=

document.getElementById(id);

if(panel){

panel.classList.add(

"active"

);

}

}

/*==================================================
            CLOSE SIDEBAR
==================================================*/

function closeSidebar(id){

const panel=

document.getElementById(id);

if(panel){

panel.classList.remove(

"active"

);

}

}

/*==================================================
            CLOSE ALL PANELS
==================================================*/

function closeAllPanels(){

document

.querySelectorAll(

".sidePanel,.activePanel,#settingsPanel,#commentPanel,#thumbnailSidebar"

)

.forEach(panel=>{

panel.classList.remove(

"active"

);

});

}

/*==================================================
            ESC KEY
==================================================*/

document.addEventListener(

"keydown",

event=>{

if(

event.key==="Escape"

){

closeAllPanels();

}

});

/*==================================================
            CLICK OUTSIDE
==================================================*/

document.addEventListener(

"click",

event=>{

const panels=

document.querySelectorAll(

".sidePanel,#settingsPanel,#commentPanel"

);

panels.forEach(panel=>{

if(

panel.classList.contains("active") &&

!panel.contains(event.target) &&

!event.target.closest("[data-panel]")

){

panel.classList.remove(

"active"

);

}

});

});

/*==================================================
            AUTO HIDE HEADER
==================================================*/

let headerTimer;

function showHeader(){

const header=

document.getElementById(

"readerHeader"

);

if(!header)return;

header.style.opacity="1";

clearTimeout(

headerTimer

);

headerTimer=

setTimeout(()=>{

header.style.opacity=".15";

},4000);

}

document.addEventListener(

"mousemove",

showHeader

);

/*==================================================
            READER MODE
==================================================*/

function toggleReaderMode(){

document.body.classList.toggle(

"readingMode"

);

showToast(

document.body.classList.contains(

"readingMode"

)

?

"Reading Mode Enabled"

:

"Reading Mode Disabled"

);

}

/*==================================================
            CURSOR MODE
==================================================*/

let cursorHidden=false;

function toggleCursor(){

cursorHidden=!cursorHidden;

document.body.style.cursor=

cursorHidden

?

"none"

:

"default";

}

/*==================================================
            PART 13 END
==================================================*/
/*==================================================
        CHISHTI LIBRARY READER V3
            JAVASCRIPT PART 14
    REALISTIC PAGE FLIP + TOUCH GESTURES
==================================================*/

/*==================================================
            PAGE FLIP SOUND
==================================================*/

const flipSound=new Audio(

"assets/audio/page-flip.mp3"

);

flipSound.preload="auto";

/*==================================================
            PLAY SOUND
==================================================*/

function playFlipSound(){

flipSound.currentTime=0;

flipSound.play()

.catch(()=>{});

}

/*==================================================
            REAL PAGE FLIP
==================================================*/

async function realPageFlip(direction="next"){

const page=

document.getElementById(

"flipPage"

);

if(!page)return;

page.style.display="block";

page.style.transition=

"none";

page.style.transform=

direction==="next"

?

"rotateY(0deg)"

:

"rotateY(-180deg)";

requestAnimationFrame(()=>{

page.style.transition=

"transform .9s cubic-bezier(.22,.61,.36,1)";

page.style.transform=

direction==="next"

?

"rotateY(-180deg)"

:

"rotateY(0deg)";

});

playFlipSound();

await new Promise(resolve=>{

setTimeout(resolve,900);

});

page.style.display="none";

}

/*==================================================
            NEXT PAGE
==================================================*/

async function flipNext(){

if(

Reader.currentPage>=Reader.totalPages

)return;

await realPageFlip("next");

Reader.currentPage++;

onPageChanged();

queueRender();

}

/*==================================================
            PREVIOUS PAGE
==================================================*/

async function flipPrevious(){

if(

Reader.currentPage<=1

)return;

await realPageFlip("previous");

Reader.currentPage--;

onPageChanged();

queueRender();

}

/*==================================================
            TOUCH GESTURES
==================================================*/

let touchStartX=0;

let touchEndX=0;

/*==================================================
            TOUCH START
==================================================*/

DOM.viewer?.addEventListener(

"touchstart",

e=>{

touchStartX=

e.changedTouches[0].clientX;

}

);

/*==================================================
            TOUCH END
==================================================*/

DOM.viewer?.addEventListener(

"touchend",

e=>{

touchEndX=

e.changedTouches[0].clientX;

handleSwipe();

}

);

/*==================================================
            HANDLE SWIPE
==================================================*/

function handleSwipe(){

const distance=

touchEndX-touchStartX;

if(distance<-80){

flipNext();

}

else if(distance>80){

flipPrevious();

}

}

/*==================================================
            MOUSE DRAG PAGE
==================================================*/

let dragging=false;

let dragStart=0;

DOM.viewer?.addEventListener(

"mousedown",

e=>{

dragging=true;

dragStart=e.clientX;

}

);

document.addEventListener(

"mouseup",

e=>{

if(!dragging)return;

dragging=false;

const diff=

e.clientX-dragStart;

if(diff<-120){

flipNext();

}

else if(diff>120){

flipPrevious();

}

});

/*==================================================
            PAGE CORNER EFFECT
==================================================*/

DOM.viewer?.addEventListener(

"mousemove",

e=>{

const rect=

DOM.viewer.getBoundingClientRect();

const x=

e.clientX-rect.left;

const width=

rect.width;

const page=

document.getElementById(

"flipPage"

);

if(!page)return;

if(x>width-80){

page.style.boxShadow=

"-20px 0 60px rgba(0,0,0,.35)";

}

else{

page.style.boxShadow="none";

}

});

/*==================================================
            AUTO PAGE FLIP
==================================================*/

let autoFlipTimer=null;

function startAutoFlip(seconds=10){

stopAutoFlip();

autoFlipTimer=

setInterval(()=>{

if(

Reader.currentPage<

Reader.totalPages

){

flipNext();

}else{

stopAutoFlip();

}

},seconds*1000);

showToast(

"Auto Reading Started"

);

}

function stopAutoFlip(){

clearInterval(

autoFlipTimer

);

showToast(

"Auto Reading Stopped"

);

}

/*==================================================
            PART 14 END
==================================================*/
/*==================================================
        CHISHTI LIBRARY READER V3
            JAVASCRIPT PART 15
      DOWNLOAD + PRINT + FAVORITES SYSTEM
==================================================*/

/*==================================================
            FAVORITES
==================================================*/

Reader.favorites=[];

/*==================================================
            LOAD FAVORITES
==================================================*/

function loadFavorites(){

const data=

localStorage.getItem(

"chishtiFavorites"

);

Reader.favorites=

data?

JSON.parse(data):[];

updateFavoriteButton();

}

/*==================================================
            SAVE FAVORITES
==================================================*/

function saveFavorites(){

localStorage.setItem(

"chishtiFavorites",

JSON.stringify(

Reader.favorites

)

);

}

/*==================================================
            TOGGLE FAVORITE
==================================================*/

function toggleFavorite(){

if(!Reader.bookTitle)return;

const index=

Reader.favorites.findIndex(

book=>

book.title===

Reader.bookTitle

);

if(index===-1){

Reader.favorites.push({

title:Reader.bookTitle,

author:Reader.bookAuthor,

url:Reader.bookUrl,

date:new Date().toLocaleString()

});

showToast(

"Book Added To Favorites ❤️"

);

}else{

Reader.favorites.splice(

index,

1

);

showToast(

"Book Removed"

);

}

saveFavorites();

updateFavoriteButton();

renderFavorites();

}

/*==================================================
            UPDATE BUTTON
==================================================*/

function updateFavoriteButton(){

const button=

document.getElementById(

"favoriteButton"

);

if(!button)return;

const found=

Reader.favorites.find(

b=>b.title===Reader.bookTitle

);

button.classList.toggle(

"active",

!!found

);

}

/*==================================================
            RENDER FAVORITES
==================================================*/

function renderFavorites(){

const container=

document.getElementById(

"favoriteContainer"

);

if(!container)return;

container.innerHTML="";

Reader.favorites.forEach(book=>{

const card=

document.createElement(

"div"

);

card.className=

"favoriteCard";

card.innerHTML=

`

<h3>${book.title}</h3>

<p>${book.author}</p>

<button onclick="resumeBook('${book.url}',1)">

Open

</button>

`;

container.appendChild(card);

});

}

/*==================================================
            DOWNLOAD PDF
==================================================*/

function downloadBook(){

if(!Reader.bookUrl){

showToast(

"No Book Loaded"

);

return;

}

const link=

document.createElement(

"a"

);

link.href=

Reader.bookUrl;

link.download=

Reader.bookTitle+".pdf";

document.body.appendChild(

link

);

link.click();

document.body.removeChild(

link

);

showToast(

"Download Started"

);

}

/*==================================================
            PRINT PDF
==================================================*/

function printBook(){

if(!Reader.bookUrl){

showToast(

"No Book Loaded"

);

return;

}

const win=

window.open(

Reader.bookUrl,

"_blank"

);

if(win){

win.onload=()=>{

win.print();

};

}

}

/*==================================================
            COPY BOOK INFO
==================================================*/

function copyBookInfo(){

const text=

`

Book : ${Reader.bookTitle}

Author : ${Reader.bookAuthor}

Pages : ${Reader.totalPages}

`;

navigator.clipboard

.writeText(text);

showToast(

"Book Information Copied"

);

}

/*==================================================
            EXPORT BOOKMARKS
==================================================*/

function exportBookmarks(){

const file=

new Blob(

[

JSON.stringify(

Reader.bookmarks,

null,

2

)

],

{

type:"application/json"

}

);

const url=

URL.createObjectURL(file);

const a=

document.createElement(

"a"

);

a.href=url;

a.download=

"bookmarks.json";

a.click();

URL.revokeObjectURL(

url

);

}

/*==================================================
            IMPORT BOOKMARKS
==================================================*/

function importBookmarks(file){

const reader=

new FileReader();

reader.onload=function(e){

Reader.bookmarks=

JSON.parse(

e.target.result

);

saveBookmarks();

renderBookmarks();

showToast(

"Bookmarks Imported"

);

};

reader.readAsText(file);

}

/*==================================================
            PART 15 END
==================================================*/
/*==================================================
        CHISHTI LIBRARY READER V3
            JAVASCRIPT PART 16
        PDF CACHE + FAST LOADING SYSTEM
==================================================*/

/*==================================================
            PDF CACHE STORAGE
==================================================*/

const PDFCache={

pages:{},

thumbnails:{},

text:{}

};


/*==================================================
            CACHE PAGE
==================================================*/

async function cachePage(pageNumber){

if(PDFCache.pages[pageNumber]){

return PDFCache.pages[pageNumber];

}

const page=

await Reader.pdf.getPage(

pageNumber

);


PDFCache.pages[pageNumber]=page;


return page;

}


/*==================================================
            FAST PAGE RENDER
==================================================*/

async function fastRenderPage(

pageNumber,

canvas,

context

){

try{

const page=

await cachePage(

pageNumber

);


const viewport=

page.getViewport({

scale:Reader.zoom

});


canvas.width=

viewport.width;


canvas.height=

viewport.height;


await page.render({

canvasContext:context,

viewport:viewport,

intent:"display"

}).promise;


drawWatermark(

context,

canvas

);


}

catch(error){

console.log(

"Render Error",

error

);

}

}


/*==================================================
            PRELOAD NEXT PAGES
==================================================*/

async function preloadPages(){

if(!Reader.pdf)return;


const pages=[

Reader.currentPage+1,

Reader.currentPage+2,

Reader.currentPage-1

];


for(const page of pages){

if(

page>=1 &&

page<=Reader.totalPages

){

await cachePage(page);

}

}

}


/*==================================================
            SMART READER LOADING
==================================================*/

async function smartLoadBook(){

showLoader();


setLoadingText(

"Preparing Book..."

);


await renderCurrentPages();


updateLoadingProgress(

70

);


await preloadPages();


updateLoadingProgress(

100

);


hideLoader();


onBookLoaded();


}


/*==================================================
            CLEAR CACHE
==================================================*/

function clearPDFCache(){

PDFCache.pages={};

PDFCache.thumbnails={};

PDFCache.text={};


showToast(

"Cache Cleared"

);

}


/*==================================================
            MEMORY CONTROL
==================================================*/

function limitCache(){

const keys=

Object.keys(

PDFCache.pages

);


if(keys.length>15){

delete PDFCache.pages[

keys[0]

];

}

}


/*==================================================
            AUTO CACHE CLEAN
==================================================*/

setInterval(()=>{

limitCache();

},30000);


/*==================================================
            PDF QUALITY
==================================================*/

function setPDFQuality(level){

switch(level){

case "low":

Reader.zoom=.8;

break;


case "medium":

Reader.zoom=1;

break;


case "high":

Reader.zoom=1.5;

break;


case "ultra":

Reader.zoom=2;

break;

}


updateZoomIndicator();

queueRender();

showToast(

"Quality Updated"

);

}


/*==================================================
            CONNECTION CHECK
==================================================*/

function checkConnection(){

if(

navigator.onLine

){

return true;

}


showToast(

"No Internet Connection"

);


return false;

}


/*==================================================
            ONLINE EVENTS
==================================================*/

window.addEventListener(

"offline",

()=>{

showToast(

"Offline Mode"

);

});


window.addEventListener(

"online",

()=>{

showToast(

"Connection Restored"

);

});


/*==================================================
            PART 16 END
==================================================*/
/*==================================================
        CHISHTI LIBRARY READER V3
            JAVASCRIPT PART 17
        BOOK INFO + METADATA + FAVORITES
==================================================*/

/*==================================================
            BOOK METADATA
==================================================*/

Reader.metadata={

title:"",

author:"",

subject:"",

keywords:"",

creator:"",

pages:0

};

/*==================================================
            LOAD METADATA
==================================================*/

async function loadBookMetadata(){

if(!Reader.pdf)return;

try{

const meta=

await Reader.pdf.getMetadata();

const info=

meta.info;

Reader.metadata={

title:

info.Title||Reader.bookTitle,

author:

info.Author||Reader.bookAuthor,

subject:

info.Subject||"",

keywords:

info.Keywords||"",

creator:

info.Creator||"",

pages:

Reader.totalPages

};

updateMetadataUI();

}

catch(error){

console.log(

"Metadata unavailable"

);

}

}

/*==================================================
            UPDATE METADATA UI
==================================================*/

function updateMetadataUI(){

const title=

document.getElementById(

"metaTitle"

);

const author=

document.getElementById(

"metaAuthor"

);

const pages=

document.getElementById(

"metaPages"

);

if(title)

title.textContent=

Reader.metadata.title;

if(author)

author.textContent=

Reader.metadata.author;

if(pages)

pages.textContent=

Reader.metadata.pages+

" Pages";

}

/*==================================================
            FAVORITE BOOKS
==================================================*/

const FAVORITES_KEY=

"chishtiFavorites";


function loadFavorites(){

const data=

localStorage.getItem(

FAVORITES_KEY

);

Reader.favorites=

data?

JSON.parse(data):[];

}


/*==================================================
            ADD FAVORITE
==================================================*/

function addFavorite(){

loadFavorites();

const exists=

Reader.favorites.some(

book=>

book.title===Reader.bookTitle

);

if(exists){

showToast(

"Already in Favorites"

);

return;

}

Reader.favorites.push({

title:

Reader.bookTitle,

author:

Reader.bookAuthor,

url:

Reader.bookUrl,

date:

new Date()

.toLocaleString()

});

localStorage.setItem(

FAVORITES_KEY,

JSON.stringify(

Reader.favorites

)

);

showToast(

"Added to Favorites ⭐"

);

}


/*==================================================
            REMOVE FAVORITE
==================================================*/

function removeFavorite(title){

loadFavorites();

Reader.favorites=

Reader.favorites.filter(

book=>

book.title!==title

);

localStorage.setItem(

FAVORITES_KEY,

JSON.stringify(

Reader.favorites

)

);

renderFavorites();

}


/*==================================================
            RENDER FAVORITES
==================================================*/

function renderFavorites(){

const box=

document.getElementById(

"favoritesContainer"

);

if(!box)return;

loadFavorites();

box.innerHTML="";

Reader.favorites.forEach(book=>{

const item=

document.createElement(

"div"

);

item.className=

"favoriteCard";

item.innerHTML=

`

<h3>${book.title}</h3>

<p>${book.author}</p>

<button>

Open

</button>

`;

item.querySelector(

"button"

)

.onclick=()=>{

openBook(

book.url,

book.title,

book.author

);

};

box.appendChild(item);

});

}


/*==================================================
            CHECK FAVORITE
==================================================*/

function isFavorite(){

loadFavorites();

return Reader.favorites.some(

book=>

book.title===Reader.bookTitle

);

}


/*==================================================
            INIT METADATA
==================================================*/

async function initializeBookInfo(){

await loadBookMetadata();

loadFavorites();

renderFavorites();

}


/*==================================================
            PART 17 END
==================================================*/
/*==================================================
        CHISHTI LIBRARY READER V3
            JAVASCRIPT PART 18
        PDF CACHE + FAST LOADING ENGINE
==================================================*/

/*==================================================
            PDF CACHE STORAGE
==================================================*/

const PDFCache={

pages:{},

enabled:true

};


/*==================================================
            CACHE PAGE
==================================================*/

async function cachePage(pageNumber){

if(!Reader.pdf)return;

if(

PDFCache.pages[pageNumber]

)return;


const page=

await Reader.pdf.getPage(

pageNumber

);


PDFCache.pages[pageNumber]=page;


}


/*==================================================
            PRELOAD NEXT PAGES
==================================================*/

async function preloadPages(){

if(!Reader.pdf)return;


const nextPages=[

Reader.currentPage+1,

Reader.currentPage+2,

Reader.currentPage+3

];


for(const page of nextPages){

if(

page<=Reader.totalPages

){

await cachePage(page);

}

}

}


/*==================================================
            FAST GET PAGE
==================================================*/

async function getFastPage(number){

if(

PDFCache.pages[number]

){

return PDFCache.pages[number];

}


const page=

await Reader.pdf.getPage(number);


PDFCache.pages[number]=page;


return page;

}


/*==================================================
            CLEAR CACHE
==================================================*/

function clearPDFCache(){

PDFCache.pages={};

showToast(

"Cache Cleared"

);

}


/*==================================================
            SMART RENDER
==================================================*/

async function fastRenderPage(

number,

canvas,

context

){

try{


const page=

await getFastPage(number);


const viewport=

page.getViewport({

scale:Reader.zoom

});


canvas.width=

viewport.width;


canvas.height=

viewport.height;


await page.render({

canvasContext:context,

viewport:viewport

}).promise;


drawWatermark(

context,

canvas

);


}

catch(error){

console.error(

"Render Error",

error

);

}

}


/*==================================================
            BACKGROUND LOADING
==================================================*/

function startBackgroundLoader(){

setInterval(()=>{


if(

Reader.pdf

){

preloadPages();

}


},5000);

}


/*==================================================
            MEMORY CONTROL
==================================================*/

function optimizeMemory(){

const keys=

Object.keys(

PDFCache.pages

);


if(

keys.length>15

){

delete PDFCache.pages[

keys[0]

];

}

}


/*==================================================
            DEVICE SPEED CHECK
==================================================*/

function detectDeviceSpeed(){

const memory=

navigator.deviceMemory||4;


if(memory<=2){

Reader.zoom=.8;

}

else if(memory>=8){

Reader.zoom=1.2;

}

}


/*==================================================
            FAST START
==================================================*/

function enableFastLoading(){

detectDeviceSpeed();

startBackgroundLoader();


setInterval(()=>{

optimizeMemory();

},15000);

}


/*==================================================
            PART 18 END
==================================================*/
/*==================================================
        CHISHTI LIBRARY READER V3
            JAVASCRIPT PART 19
        OFFLINE MODE + CACHE SYSTEM
==================================================*/

/*==================================================
            CACHE SETTINGS
==================================================*/

const CACHE_NAME=

"chishti-library-books-v3";


/*==================================================
            SAVE BOOK OFFLINE
==================================================*/

async function saveBookOffline(){

if(!Reader.bookUrl){

showToast(

"No Book Loaded"

);

return;

}

try{

const response=

await fetch(

Reader.bookUrl

);

const blob=

await response.blob();

const reader=

new FileReader();


reader.onload=()=>{

localStorage.setItem(

"offlineBook",

reader.result

);

localStorage.setItem(

"offlineBookTitle",

Reader.bookTitle

);

showToast(

"Book Saved Offline"

);

};


reader.readAsDataURL(blob);


}

catch(error){

console.error(error);

showToast(

"Offline Save Failed"

);

}

}


/*==================================================
            OPEN OFFLINE BOOK
==================================================*/

async function openOfflineBook(){

const book=

localStorage.getItem(

"offlineBook"

);


if(!book){

showToast(

"No Offline Book"

);

return;

}


await openBook(

book,

localStorage.getItem(

"offlineBookTitle"

),

"Offline Mode"

);


showToast(

"Offline Book Opened"

);

}


/*==================================================
            CHECK OFFLINE
==================================================*/

function checkOfflineStatus(){

if(

navigator.onLine

){

showToast(

"Online"

);

}

else{

showToast(

"Offline Mode"

);

}

}


/*==================================================
            NETWORK EVENTS
==================================================*/

window.addEventListener(

"offline",

()=>{

showToast(

"Internet Disconnected - Offline Mode"

);

}

);


window.addEventListener(

"online",

()=>{

showToast(

"Internet Connected"

);

}

);


/*==================================================
            SERVICE WORKER
==================================================*/

async function registerReaderServiceWorker(){

if(

"serviceWorker"

in navigator

){

try{

await navigator.serviceWorker.register(

"service-worker.js"

);

console.log(

"Service Worker Registered"

);

}

catch(error){

console.error(

"Service Worker Error",

error

);

}

}

}


/*==================================================
            CLEAR CACHE
==================================================*/

async function clearReaderCache(){

if(

"caches"

in window

){

const result=

await caches.delete(

CACHE_NAME

);

showToast(

result?

"Cache Cleared":

"Nothing To Clear"

);

}

}


/*==================================================
            STORAGE INFO
==================================================*/

function storageInfo(){

let size=0;

for(

let key in localStorage

){

size+=

localStorage[key].length;

}

const mb=

(size/1024/1024)

.toFixed(2);


showToast(

"Storage Used: "+mb+" MB"

);

}


/*==================================================
            AUTO SAVE OFFLINE
==================================================*/

function enableAutoOffline(){

localStorage.setItem(

"autoOffline",

"true"

);

showToast(

"Auto Offline Enabled"

);

}


function disableAutoOffline(){

localStorage.removeItem(

"autoOffline"

);

showToast(

"Auto Offline Disabled"

);

}


/*==================================================
            INITIALIZE OFFLINE
==================================================*/

document.addEventListener(

"DOMContentLoaded",

()=>{

registerReaderServiceWorker();

checkOfflineStatus();

}

);


/*==================================================
            PART 19 END
==================================================*/
/*==================================================
        CHISHTI LIBRARY READER V3
            JAVASCRIPT PART 20
        DOWNLOAD + PRINT + PDF ACTIONS
==================================================*/


/*==================================================
            DOWNLOAD BOOK
==================================================*/

function downloadBook(){

if(!Reader.bookUrl){

showToast(

"No Book Available"

);

return;

}


const link=

document.createElement(

"a"

);


link.href=

Reader.bookUrl;


link.download=

Reader.bookTitle||

"Chishti-Library-Book.pdf";


document.body.appendChild(link);


link.click();


document.body.removeChild(link);


showToast(

"Download Started"

);

}


/*==================================================
            PRINT CURRENT PAGE
==================================================*/

async function printCurrentPage(){

if(!Reader.pdf)return;


try{


const page=

await Reader.pdf.getPage(

Reader.currentPage

);


const viewport=

page.getViewport({

scale:2

});


const canvas=

document.createElement(

"canvas"

);


const context=

canvas.getContext(

"2d"

);


canvas.width=

viewport.width;


canvas.height=

viewport.height;



await page.render({

canvasContext:context,

viewport:viewport

}).promise;



const image=

canvas.toDataURL(

"image/png"

);



const win=

window.open("");



win.document.write(

`

<html>

<head>

<title>

Print Page

</title>

</head>

<body>

<img src="${image}"

style="width:100%">

<script>

window.print();

</script>

</body>

</html>

`

);



}catch(error){

console.error(error);

showToast(

"Print Error"

);

}


}


/*==================================================
            PRINT FULL BOOK
==================================================*/

async function printFullBook(){

if(!Reader.pdf)return;


showToast(

"Preparing Print..."

);


let pages=[];


for(

let i=1;

i<=Reader.totalPages;

i++

){


const page=

await Reader.pdf.getPage(i);


const viewport=

page.getViewport({

scale:1.5

});


const canvas=

document.createElement(

"canvas"

);


const ctx=

canvas.getContext(

"2d"

);


canvas.width=

viewport.width;


canvas.height=

viewport.height;


await page.render({

canvasContext:ctx,

viewport

}).promise;



pages.push(

canvas.toDataURL(

"image/png"

)

);


}



const win=

window.open("");



win.document.write(

`

<html>

<body>

${

pages.map(

img=>

`

<img src="${img}"

style="width:100%;page-break-after:always">

`

).join("")

}

<script>

window.print();

</script>

</body>

</html>

`

);


}


/*==================================================
            OPEN PDF NEW TAB
==================================================*/

function openOriginalPDF(){

if(!Reader.bookUrl)return;


window.open(

Reader.bookUrl,

"_blank"

);


}


/*==================================================
            COPY BOOK INFO
==================================================*/

function copyBookInfo(){

const info=

`

${Reader.bookTitle}

Author:

${Reader.bookAuthor}

Pages:

${Reader.totalPages}

Read on Chishti Library

`;



navigator.clipboard

.writeText(info);



showToast(

"Book Info Copied"

);

}


/*==================================================
            SHARE PDF FILE
==================================================*/

async function sharePDFFile(){

if(!navigator.share){

shareBook();

return;

}


try{


const response=

await fetch(

Reader.bookUrl

);


const blob=

await response.blob();



const file=

new File(

[blob],

Reader.bookTitle+".pdf",

{

type:"application/pdf"

}

);



await navigator.share({

title:Reader.bookTitle,

files:[file]

});


}catch(e){

showToast(

"Sharing Not Supported"

);

}


}


/*==================================================
            CHECK SUPPORT
==================================================*/

function checkBrowserSupport(){

return {

pdf:

!!window.pdfjsLib,

share:

!!navigator.share,

fullscreen:

!!document.fullscreenEnabled,

storage:

!!window.localStorage

};

}


/*==================================================
            PART 20 END
==================================================*/
/*==================================================
        CHISHTI LIBRARY READER V3
            JAVASCRIPT PART 21
        PDF CACHE + FAST LOADING SYSTEM
==================================================*/

/*==================================================
            CACHE STORAGE
==================================================*/

const PDFCache={

pages:{},

thumbnails:{},

text:{}

};


/*==================================================
            CACHE PAGE
==================================================*/

async function cachePage(pageNumber){

if(

PDFCache.pages[pageNumber]

)return PDFCache.pages[pageNumber];


const page=

await Reader.pdf.getPage(

pageNumber

);


PDFCache.pages[pageNumber]=page;


return page;

}


/*==================================================
            FAST PAGE RENDER
==================================================*/

async function fastRenderPage(

pageNumber,

canvas,

context

){

try{

const page=

await cachePage(

pageNumber

);


const viewport=

page.getViewport({

scale:Reader.zoom

});


canvas.width=

viewport.width;


canvas.height=

viewport.height;


await page.render({

canvasContext:context,

viewport:viewport,

intent:"display"

}).promise;


drawWatermark(

context,

canvas

);


}

catch(error){

console.error(

"Fast Render Error",

error

);

}

}


/*==================================================
            PRELOAD NEXT PAGES
==================================================*/

async function preloadPages(){

if(!Reader.pdf)return;


const pages=[

Reader.currentPage+1,

Reader.currentPage+2,

Reader.currentPage-1

];


for(const page of pages){

if(

page>0 &&

page<=Reader.totalPages

){

cachePage(page);

}

}

}


/*==================================================
            CLEAR CACHE
==================================================*/

function clearPDFCache(){

PDFCache.pages={};

PDFCache.thumbnails={};

PDFCache.text={};


showToast(

"Cache Cleared"

);

}


/*==================================================
            SMART CACHE
==================================================*/

function smartCache(){

const maxCache=20;


const keys=

Object.keys(

PDFCache.pages

);


if(

keys.length>maxCache

){

const remove=

keys[0];


delete PDFCache.pages[remove];

}

}


/*==================================================
            MEMORY CONTROL
==================================================*/

setInterval(()=>{

smartCache();

},30000);


/*==================================================
            OFFLINE SAVE CHECK
==================================================*/

function checkOffline(){

if(

navigator.onLine

){

showToast(

"Online Mode"

);

}

else{

showToast(

"Offline Mode"

);

}

}


window.addEventListener(

"online",

checkOffline

);


window.addEventListener(

"offline",

checkOffline

);


/*==================================================
            LOAD OPTIMIZER
==================================================*/

async function optimizeReader(){

setLoadingText(

"Optimizing Reader..."

);


await preloadPages();


updateLoadingProgress(

100

);


setTimeout(()=>{

hideLoader();

},500);

}


/*==================================================
            PART 21 END
==================================================*/
/*==================================================
        CHISHTI LIBRARY READER V3
            JAVASCRIPT PART 22
        ADVANCED BOOK CACHE + OFFLINE MODE
==================================================*/

/*==================================================
            CACHE DATABASE
==================================================*/

const BookCache = {

dbName:"ChishtiLibraryCache",

store:"books",

version:1

};


/*==================================================
            OPEN INDEXED DB
==================================================*/

function openBookCache(){

return new Promise((resolve,reject)=>{

const request=

indexedDB.open(

BookCache.dbName,

BookCache.version

);


request.onupgradeneeded=e=>{

const db=e.target.result;


if(!db.objectStoreNames.contains(BookCache.store)){

db.createObjectStore(

BookCache.store,

{

keyPath:"url"

}

);

}

};


request.onsuccess=()=>{

resolve(request.result);

};


request.onerror=()=>{

reject(request.error);

};

});

}


/*==================================================
            SAVE BOOK CACHE
==================================================*/

async function saveBookOffline(url,data){

try{

const db=

await openBookCache();


const transaction=

db.transaction(

BookCache.store,

"readwrite"

);


const store=

transaction.objectStore(

BookCache.store

);


store.put({

url:url,

data:data,

title:Reader.bookTitle,

date:new Date()

.toISOString()

});


showToast(

"Book Saved Offline"

);


}

catch(error){

console.log(error);

showToast(

"Offline Save Failed"

);

}

}


/*==================================================
            LOAD OFFLINE BOOK
==================================================*/

async function loadOfflineBook(url){

try{

const db=

await openBookCache();


const transaction=

db.transaction(

BookCache.store,

"readonly"

);


const store=

transaction.objectStore(

BookCache.store

);


const request=

store.get(url);


request.onsuccess=()=>{


if(request.result){

openBook(

request.result.data,

request.result.title

);


showToast(

"Offline Book Opened"

);


}else{


showToast(

"No Offline Copy"

);


}


};


}

catch(error){

console.log(error);

}

}


/*==================================================
            CHECK OFFLINE
==================================================*/

async function checkOfflineBook(url){

const db=

await openBookCache();


const transaction=

db.transaction(

BookCache.store,

"readonly"

);


const store=

transaction.objectStore(

BookCache.store

);


const request=

store.get(url);


return new Promise(resolve=>{


request.onsuccess=()=>{


resolve(

!!request.result

);


};


});

}


/*==================================================
            DELETE OFFLINE BOOK
==================================================*/

async function deleteOfflineBook(url){

const db=

await openBookCache();


const transaction=

db.transaction(

BookCache.store,

"readwrite"

);


transaction

.objectStore(

BookCache.store

)

.delete(url);


showToast(

"Offline Copy Deleted"

);

}


/*==================================================
            OFFLINE STATUS
==================================================*/

function updateNetworkStatus(){

const online=

navigator.onLine;


if(online){

showToast(

"Online Mode"

);

}else{

showToast(

"Offline Mode"

);

}

}


window.addEventListener(

"online",

updateNetworkStatus

);


window.addEventListener(

"offline",

updateNetworkStatus

);


/*==================================================
            AUTO CACHE CURRENT BOOK
==================================================*/

async function autoSaveBook(){

if(

Reader.bookUrl

){

try{

const response=

await fetch(

Reader.bookUrl

);


const blob=

await response.blob();


saveBookOffline(

Reader.bookUrl,

blob

);


}

catch(e){}

}

}


/*==================================================
            PART 22 END
==================================================*/
/*==================================================
        CHISHTI LIBRARY READER V3
            JAVASCRIPT PART 23
        PWA + OFFLINE READING + CACHE SYSTEM
==================================================*/

/*==================================================
            SERVICE WORKER REGISTER
==================================================*/

function registerServiceWorker(){

if(

"serviceWorker" in navigator

){

navigator.serviceWorker

.register(

"service-worker.js"

)

.then(()=>{

console.log(

"Service Worker Registered"

);

})

.catch(error=>{

console.error(

"Service Worker Error",

error

);

});

}

}


/*==================================================
            CACHE BOOK
==================================================*/

async function cacheBook(url){

try{

const cache=

await caches.open(

"chishti-library-books"

);


await cache.add(url);


showToast(

"Book Saved Offline"

);


}

catch(error){

console.error(

"Cache Error",

error

);

showToast(

"Offline Save Failed"

);

}

}


/*==================================================
            CHECK OFFLINE BOOK
==================================================*/

async function isBookOffline(url){

const cache=

await caches.open(

"chishti-library-books"

);


const response=

await cache.match(url);


return !!response;

}


/*==================================================
            REMOVE OFFLINE BOOK
==================================================*/

async function removeOfflineBook(url){

const cache=

await caches.open(

"chishti-library-books"

);


await cache.delete(url);


showToast(

"Offline Book Removed"

);

}


/*==================================================
            DOWNLOAD BOOK
==================================================*/

async function downloadBookOffline(){

if(!Reader.bookUrl){

showToast(

"No Book Loaded"

);

return;

}


await cacheBook(

Reader.bookUrl

);

}


/*==================================================
            OFFLINE STATUS
==================================================*/

function updateNetworkStatus(){

const status=

navigator.onLine;


if(status){

showToast(

"Internet Connected"

);

}

else{

showToast(

"Offline Mode"

);

}

}


window.addEventListener(

"online",

updateNetworkStatus

);


window.addEventListener(

"offline",

updateNetworkStatus

);


/*==================================================
            READING CACHE
==================================================*/

function saveReaderState(){

const state={

book:

Reader.bookTitle,

page:

Reader.currentPage,

zoom:

Reader.zoom,

theme:

Reader.theme,

time:

Date.now()

};


localStorage.setItem(

"readerState",

JSON.stringify(state)

);

}


/*==================================================
            RESTORE STATE
==================================================*/

function restoreReaderState(){

const data=

localStorage.getItem(

"readerState"

);


if(!data)return;


const state=

JSON.parse(data);


if(state.zoom){

Reader.zoom=

state.zoom;

}


if(state.theme){

applyTheme(

state.theme

);

}

}


/*==================================================
            AUTO SAVE STATE
==================================================*/

setInterval(()=>{

saveReaderState();

},5000);


/*==================================================
            INIT OFFLINE
==================================================*/

window.addEventListener(

"load",

()=>{

registerServiceWorker();

restoreReaderState();

}

);


/*==================================================
            PART 23 END
==================================================*/
/*==================================================
        CHISHTI LIBRARY READER V3
            JAVASCRIPT PART 24
        FINAL SECURITY + OPTIMIZATION
==================================================*/

/*==================================================
            DISABLE CONTEXT MENU
==================================================*/

document.addEventListener(

"contextmenu",

e=>{

if(

e.target.tagName==="CANVAS"

){

e.preventDefault();

}

}

);


/*==================================================
            PREVENT IMAGE DRAG
==================================================*/

document.addEventListener(

"dragstart",

e=>{

if(

e.target.tagName==="CANVAS" ||

e.target.tagName==="IMG"

){

e.preventDefault();

}

}

);


/*==================================================
            READER VISIBILITY
==================================================*/

document.addEventListener(

"visibilitychange",

()=>{

if(

document.hidden

){

saveLastPage();

saveBookmarks();

}

}

);


/*==================================================
            BEFORE CLOSE SAVE
==================================================*/

window.addEventListener(

"beforeunload",

()=>{

saveLastPage();

saveBookmarks();

saveHistory();

}

);


/*==================================================
            NETWORK STATUS
==================================================*/

window.addEventListener(

"online",

()=>{

showToast(

"Internet Connected"

);

}

);


window.addEventListener(

"offline",

()=>{

showToast(

"Offline Mode"

);

}

);


/*==================================================
            MEMORY CLEANUP
==================================================*/

function clearReaderMemory(){

Reader.searchResults=[];

Reader.thumbnails=[];

Reader.toc=[];

if(

window.gc

){

window.gc();

}

}


/*==================================================
            CACHE CURRENT PAGE
==================================================*/

async function cacheCurrentPage(){

if(!Reader.pdf)return;

const page=

await Reader.pdf.getPage(

Reader.currentPage

);

return page;

}


/*==================================================
            PRELOAD NEXT PAGE
==================================================*/

async function preloadNextPage(){

if(

!Reader.pdf ||

Reader.currentPage>=Reader.totalPages

)return;


const next=

await Reader.pdf.getPage(

Reader.currentPage+1

);

const viewport=

next.getViewport({

scale:.5

});


const canvas=

document.createElement(

"canvas"

);


canvas.width=

viewport.width;


canvas.height=

viewport.height;


await next.render({

canvasContext:

canvas.getContext("2d"),

viewport:

viewport

}).promise;


Reader.cachePage=canvas;

}


/*==================================================
            PERFORMANCE MONITOR
==================================================*/

function readerPerformance(){

const memory=

performance.memory;


if(memory){

console.log(

"Reader Memory:",

Math.round(

memory.usedJSHeapSize/

1024/

1024

)+" MB"

);

}

}


/*==================================================
            CLEAN PDF OBJECT
==================================================*/

async function closeBook(){

if(

Reader.pdf

){

await Reader.pdf.destroy();

}

Reader.pdf=null;

Reader.currentPage=1;

Reader.totalPages=0;

clearReaderMemory();

showToast(

"Book Closed"

);

}


/*==================================================
            VERSION CHECK
==================================================*/

const ReaderVersion={

name:

"CHISHTI LIBRARY READER",

version:

"3.0.0",

features:[

"PDF.js",

"3D Page Flip",

"Firebase Comments",

"Bookmarks",

"Themes",

"Watermark"

]

};


console.log(

ReaderVersion

);


/*==================================================
            PART 24 END
==================================================*/
/*==================================================
        CHISHTI LIBRARY READER V3
            JAVASCRIPT PART 25
        FINAL SYSTEM + INITIAL STARTUP
==================================================*/

/*==================================================
            READER START
==================================================*/

async function startReader(){

try{

showLoader();

setLoadingText(

"Preparing Chishti Library Reader..."

);

updateLoadingProgress(10);


/* LOAD SAVED DATA */

loadTheme();

loadBookmarks();

loadLikes();

loadHistory();


updateLoadingProgress(25);


/* CHECK BOOK URL */

const url=

window.bookUrl ||

document.body.dataset.book;


if(url){

await openBook(

url,

window.bookTitle||"Chishti Library",

window.bookAuthor||""

);

}


updateLoadingProgress(70);


/* EXTRA SYSTEMS */

await loadTableOfContents();

await generateThumbnails();


updateLoadingProgress(90);


onBookLoaded();


updateLoadingProgress(100);


setTimeout(()=>{

hideLoader();

document.body.classList.add(

"reader-loaded"

);

},600);


}

catch(error){

console.error(

"Reader Start Error",

error

);

showToast(

"Reader Initialization Failed"

);

}

}


/*==================================================
            SERVICE WORKER
==================================================*/

function registerOfflineMode(){

if(

"serviceWorker" in navigator

){

navigator.serviceWorker

.register(

"service-worker.js"

)

.then(()=>{

console.log(

"Offline Mode Ready"

);

})

.catch(error=>{

console.log(error);

});

}

}


/*==================================================
            PREVENT CONTEXT MENU
==================================================*/

document.addEventListener(

"contextmenu",

e=>{

if(

document.body.classList.contains(

"readingMode"

)

){

e.preventDefault();

}

});


/*==================================================
            DOUBLE CLICK ZOOM
==================================================*/

let lastClick=0;

DOM.viewer?.addEventListener(

"click",

()=>{

const now=

Date.now();


if(

now-lastClick<300

){

if(

Reader.zoom===1

){

Reader.zoom=1.5;

}else{

Reader.zoom=1;

}

updateZoomIndicator();

queueRender();

}


lastClick=now;

});


/*==================================================
            NETWORK STATUS
==================================================*/

window.addEventListener(

"online",

()=>{

showToast(

"Internet Connected"

);

});


window.addEventListener(

"offline",

()=>{

showToast(

"Offline Mode"

);

});


/*==================================================
            CLEAN MEMORY
==================================================*/

function clearReaderMemory(){

Reader.searchText=[];

Reader.thumbnails=[];

Reader.pendingPage=null;

}


/*==================================================
            CLOSE READER
==================================================*/

function closeReader(){

clearReaderMemory();


if(

Reader.pdf

){

Reader.pdf.destroy();

}


location.href="/";

}


/*==================================================
            VERSION INFO
==================================================*/

const ReaderVersion={

name:

"CHISHTI LIBRARY READER",

version:

"V3.0",

features:[

"PDF.JS",

"3D Page Flip",

"Bookmarks",

"Firebase Comments",

"Themes",

"Watermark",

"Offline Support"

]

};


/*==================================================
            FINAL BOOT
==================================================*/

window.addEventListener(

"load",

()=>{

registerOfflineMode();

startReader();

});


/*==================================================
            JAVASCRIPT PART 25 END
            COMPLETE JS SYSTEM
==================================================*/
