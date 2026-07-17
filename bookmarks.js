/*=========================================
 CHISHTI READER PRO
 bookmarks.js
 Version 1
=========================================*/

const bookmarkKey =
"chishti_bookmarks_" + pdfFile;

/*==============================
Load
==============================*/

function getBookmarks(){

return JSON.parse(

localStorage.getItem(bookmarkKey)

)||[];

}

/*==============================
Save
==============================*/

function saveBookmarks(data){

localStorage.setItem(

bookmarkKey,

JSON.stringify(data)

);

}

/*==============================
Add
==============================*/

function addBookmark(){

const title = prompt(

"Bookmark Name",

"Page " + pageNum

);

if(!title) return;

const list = getBookmarks();

list.push({

page:pageNum,

title:title,

date:new Date().toLocaleString()

});

saveBookmarks(list);

renderBookmarks();

}

/*==============================
Delete
==============================*/

function deleteBookmark(index){

let list=getBookmarks();

list.splice(index,1);

saveBookmarks(list);

renderBookmarks();

}

/*==============================
Render
==============================*/

function renderBookmarks(){

const sidebar=document.getElementById(

"thumbnailContainer"

);

const list=getBookmarks();

const old=document.getElementById(

"bookmarkArea"

);

if(old) old.remove();

const wrap=document.createElement("div");

wrap.id="bookmarkArea";

wrap.innerHTML=

"<h3 style='margin:15px 0;color:#0b6b3a;'>Bookmarks</h3>";

list.forEach((b,index)=>{

const item=document.createElement("div");

item.className="page-thumb";

item.innerHTML=`

<strong>${b.title}</strong>

<br>

Page ${b.page}

<br>

<small>${b.date}</small>

<div style="margin-top:8px">

<button onclick="goBookmark(${b.page})">

Open

</button>

<button onclick="deleteBookmark(${index})">

Delete

</button>

</div>

`;

wrap.appendChild(item);

});

sidebar.prepend(wrap);

}

/*==============================
Go
==============================*/

function goBookmark(page){

pageNum=page;

queueRender(page);

highlightThumbnail(page);

}

/*==============================
Button
==============================*/

const btn=

document.getElementById("bookmark");

btn.onclick=addBookmark;

/*==============================
Start
==============================*/

renderBookmarks();

console.log(

"Bookmarks Loaded"

);
