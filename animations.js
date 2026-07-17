/*=========================================
 CHISHTI READER PRO
 animations.js
 Version 1
=========================================*/

const book =
document.querySelector(".book-container");

const canvas =
document.getElementById("pdfCanvas");

/*=========================
Book Open
=========================*/

function bookOpen(){

book.animate([

{

transform:"scale(.75) rotateY(-25deg)",

opacity:0

},

{

transform:"scale(1.05) rotateY(5deg)",

opacity:1

},

{

transform:"scale(1) rotateY(0deg)",

opacity:1

}

],{

duration:900,

easing:"ease"

});

}

/*=========================
Book Close
=========================*/

function bookClose(){

book.animate([

{

transform:"scale(1)",

opacity:1

},

{

transform:"scale(.85) rotateY(20deg)",

opacity:.5

},

{

transform:"scale(.6)",

opacity:0

}

],{

duration:600,

easing:"ease"

});

}

/*=========================
Next Page
=========================*/

function pageFlipNext(){

canvas.animate([

{

transform:"rotateY(0deg)",

opacity:1

},

{

transform:"rotateY(-18deg)",

opacity:.7

},

{

transform:"rotateY(0deg)",

opacity:1

}

],{

duration:350,

easing:"ease"

});

}

/*=========================
Previous Page
=========================*/

function pageFlipPrev(){

canvas.animate([

{

transform:"rotateY(0deg)",

opacity:1

},

{

transform:"rotateY(18deg)",

opacity:.7

},

{

transform:"rotateY(0deg)",

opacity:1

}

],{

duration:350,

easing:"ease"

});

}

/*=========================
Zoom Effect
=========================*/

function zoomAnimation(){

canvas.animate([

{

transform:"scale(.95)"

},

{

transform:"scale(1.03)"

},

{

transform:"scale(1)"

}

],{

duration:300,

easing:"ease"

});

}

/*=========================
Bookmark Effect
=========================*/

function bookmarkAnimation(){

const btn =
document.getElementById("bookmark");

btn.animate([

{

transform:"scale(1)"

},

{

transform:"scale(1.4)"

},

{

transform:"scale(1)"

}

],{

duration:400

});

}

/*=========================
Button Click
=========================*/

document

.querySelectorAll("button")

.forEach(btn=>{

btn.addEventListener("click",()=>{

btn.animate([

{

transform:"scale(1)"

},

{

transform:"scale(.9)"

},

{

transform:"scale(1)"

}

],{

duration:180

});

});

});

/*=========================
Floating Book
=========================*/

setInterval(()=>{

book.animate([

{

transform:"translateY(0px)"

},

{

transform:"translateY(-5px)"

},

{

transform:"translateY(0px)"

}

],{

duration:4000,

easing:"ease-in-out"

});

},4000);

/*=========================
Glow Effect
=========================*/

setInterval(()=>{

book.style.boxShadow=

"0 20px 60px rgba(212,175,55,.25)";

setTimeout(()=>{

book.style.boxShadow=

"0 20px 40px rgba(0,0,0,.20)";

},1000);

},2000);

/*=========================
Mouse Light
=========================*/

document.addEventListener(

"mousemove",

e=>{

const x=e.clientX/window.innerWidth;

const y=e.clientY/window.innerHeight;

book.style.transform=

`rotateY(${(x-.5)*3}deg)
 rotateX(${(.5-y)*3}deg)`;

});

/*=========================
Open Reader
=========================*/

window.onload=()=>{

bookOpen();

};
