const chat = document.getElementById("chat");
let knowledgeData = [];

// GitHub Pages par sahi path se knowledge.json load karne ke liye:
const jsonFile = 'knowledge.json'; 

// 1. JSON Data load karna (Updated to load knowledge.json)
fetch(jsonFile)
    .then(response => {
        if (!response.ok) {
            throw new Error("HTTP error " + response.status);
        }
        return response.json();
    })
    .then(data => {
        knowledgeData = data;
        console.log("Chatbot database loaded successfully from knowledge.json!", knowledgeData);
    })
    .catch(error => {
        console.error("Error loading knowledge.json: ", error);
        addMsg("⚠️ Chishti AI System Alert: `knowledge.json` file load nahi ho saki.", "bot");
    });

function addMsg(text, type) {
    const div = document.createElement("div");
    div.className = "msg " + type;
    div.innerHTML = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

function typing(cb) {
    const t = document.createElement("div");
    t.className = "msg bot";
    t.innerHTML = `
    <div class="typing">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
    </div>`;
    chat.appendChild(t);
    chat.scrollTop = chat.scrollHeight;

    setTimeout(() => {
        t.remove();
        cb();
    }, 900);
}

/* ===== SMART AI BRAIN (ADVANCED MATCHING) ===== */
function ai(msg) {
    // 1. User message ko clean karein (Extra symbols, double quotes aur spaces khatam)
    const cleanMsg = msg.replace(/['"!?.,;:-]+/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

    if (knowledgeData && knowledgeData.length > 0) {
        // Pehle exact ya partial match dhoondein
        for (let item of knowledgeData) {
            const cleanQuestion = item.question.replace(/['"!?.,;:-]+/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
            
            // Agar bilkul match ho jaye ya user ka message database ke question ke andar mojood ho
            if (cleanMsg === cleanQuestion || cleanMsg.includes(cleanQuestion) || cleanQuestion.includes(cleanMsg)) {
                return item.answer;
            }
        }

        // Doosra check: Agar keywords match ho rahe hon (E.g. "saim chishti birth" ya "latif sajid")
        for (let item of knowledgeData) {
            const cleanQuestion = item.question.replace(/['"!?.,;:-]+/g, '').toLowerCase().trim();
            const words = cleanMsg.split(' ');
            
            // Agar user ke likhe hue ahem words question mein aa rahe hain
            let matchCount = 0;
            words.forEach(word => {
                if (word.length > 3 && cleanQuestion.includes(word)) {
                    matchCount++;
                }
            });

            // Agar kam az kam 2 bade words match ho jayein (Jaise "saim" aur "chishti")
            if (matchCount >= 2) {
                return item.answer;
            }
        }
    }

    // Fallback: Agar upar kuch bhi match na ho lekin "salam" ya "hello" ho
    if (cleanMsg.includes("hi") || cleanMsg.includes("hello") || cleanMsg.includes("hey") || cleanMsg.includes("salam")) {
        return "Wa Alaikum Assalam! Welcome to Chishti Library. How may I assist you today?";
    }
    
    return "Mera jawab database mein nahi mila. Aap Saim Chishti ke bare mein, ya unki books ke mutalik sawal pooch sakte hain.";
}

function send() {
    const input = document.getElementById("input");
    const text = input.value.trim();
    if (!text) return;

    addMsg(text, "user");
    input.value = "";

    typing(() => {
        addMsg(ai(text), "bot");
    });
}
