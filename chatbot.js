<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Chishti AI Library</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>
body{
margin:0;
font-family:Arial;
background:#0f172a;
color:white;
display:flex;
flex-direction:column;
height:100vh;
}

header{
background:#111827;
padding:15px;
text-align:center;
font-weight:bold;
font-size:20px;
}

#chat{
flex:1;
overflow-y:auto;
padding:15px;
display:flex;
flex-direction:column;
gap:10px;
}

.msg{
max-width:75%;
padding:12px;
border-radius:12px;
line-height:1.4;
animation:fade .3s ease;
}

.user{
background:#2563eb;
align-self:flex-end;
}

.bot{
background:#374151;
align-self:flex-start;
}

.inputBox{
display:flex;
padding:10px;
background:#111827;
}

input{
flex:1;
padding:12px;
border:none;
border-radius:8px;
outline:none;
background:#1f2937;
color:white;
}

button{
margin-left:10px;
padding:12px 16px;
border:none;
background:#22c55e;
color:white;
border-radius:8px;
cursor:pointer;
}

/* typing */
.typing{
display:flex;
gap:4px;
}

.dot{
width:6px;
height:6px;
background:white;
border-radius:50%;
animation:blink 1s infinite;
}

.dot:nth-child(2){animation-delay:.2s;}
.dot:nth-child(3){animation-delay:.4s;}

@keyframes blink{
0%,100%{opacity:.2}
50%{opacity:1}
}

@keyframes fade{
from{opacity:0;transform:translateY(10px)}
to{opacity:1;transform:translateY(0)}
}
</style>
</head>

<body>

<header>🤖 Chishti AI Smart Library</header>

<div id="chat"></div>

<div class="inputBox">
<input id="input" placeholder="Ask anything..." onkeydown="if(event.key === 'Enter') send()">
<button onclick="send()">Send</button>
</div>

<script>
const chat = document.getElementById("chat");
let knowledgeData = [];

// GitHub Pages par automatic sahi path se chatbot.json load karne ke liye path check:
const jsonFile = 'chatbot.json'; 

// 1. JSON Data load karna (Updated to load chatbot.json instead of knowledge.json)
fetch(jsonFile)
    .then(response => {
        if (!response.ok) {
            throw new Error("HTTP error " + response.status);
        }
        return response.json();
    })
    .then(data => {
        knowledgeData = data;
        console.log("Chatbot database loaded successfully!", knowledgeData);
    })
    .catch(error => {
        console.error("Error loading chatbot.json: ", error);
        addMsg("⚠️ Chishti AI System Alert: `chatbot.json` file load nahi ho saki.", "bot");
    });

function addMsg(text,type){
const div=document.createElement("div");
div.className="msg "+type;
div.innerHTML=text;
chat.appendChild(div);
chat.scrollTop=chat.scrollHeight;
}

function typing(cb){
const t=document.createElement("div");
t.className="msg bot";
t.innerHTML=`
<div class="typing">
<div class="dot"></div>
<div class="dot"></div>
<div class="dot"></div>
</div>`;
chat.appendChild(t);
chat.scrollTop=chat.scrollHeight;

setTimeout(()=>{
t.remove();
cb();
},900);
}

/* ===== SMART AI BRAIN (FIXED) ===== */
function ai(msg){
    // Clean string (punctuation symbols aur extra spaces hatayein)
    const cleanMsg = msg.replace(/['"!?.,;:-]+/g, '').toLowerCase().trim();

    // 1. Array Database Match:
    if (knowledgeData && knowledgeData.length > 0) {
        for (let item of knowledgeData) {
            const cleanQuestion = item.question.replace(/['"!?.,;:-]+/g, '').toLowerCase().trim();
            
            // Sahi matching check
            if (cleanMsg === cleanQuestion || cleanMsg.includes(cleanQuestion) || cleanQuestion.includes(cleanMsg)) {
                return item.answer;
            }
        }
    }

    // 2. Default fallback options agar matching bilkul na ho:
    if (cleanMsg.includes("hi") || cleanMsg.includes("hello") || cleanMsg.includes("hey") || cleanMsg.includes("salam")) {
        return "Wa Alaikum Assalam! Welcome to Chishti Library. How may I assist you today?";
    }
    
    return "Mera jawab database mein nahi mila. Aap Saim Chishti ke bare mein, ya unki books ke mutalik sawal pooch sakte hain.";
}

function send(){
const input=document.getElementById("input");
const text=input.value.trim();
if(!text) return;

addMsg(text,"user");
input.value="";

typing(()=>{
addMsg(ai(text),"bot");
});
}
</script>

</body>
</html>
