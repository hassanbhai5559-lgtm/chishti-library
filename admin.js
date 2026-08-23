/* =========================================
   CHISHTI AI ADMIN PANEL
========================================= */


/* ---------- DEFAULT KNOWLEDGE ---------- */

const defaultKnowledge = [
  {
    question: "hello",
    answer: "Assalamu Alaikum! Welcome to Chishti Library. How can I help you today?"
  },
  {
    question: "hi",
    answer: "Wa Alaikum Assalam! Welcome to Chishti Library. How may I assist you?"
  },
  {
    question: "who are you",
    answer: "I am Chishti AI, the digital assistant of Chishti Library, designed to help you find authentic Islamic literature."
  },
  {
    question: "what is chishti library",
    answer: "Chishti Library is a Digital Islamic Library providing access to Islamic books, Naats, Manqabats, and research resources."
  },
  {
    question: "who is saim chishti",
    answer: "Hazrat Allama Saim Chishti (رحمۃ اللہ علیہ) ek mashhoor scholar, musannif aur Naat go shayar the jinhone deen aur adab ki khidmat ki."
  },
  {
    question: "who is latif sajid chishti",
    answer: "Sahibzada Muhammad Latif Sajid Chishti is a writer and poet associated with the literary legacy of Hazrat Saim Chishti."
  },
  {
    question: "saim chishti family",
    answer: "Hazrat Allama Saim Chishti (r.a) ke teen betay hain: Sahibzada Muhammad Latif Sajid Chishti, Sahibzada Muhammad Shafiq Mujahid Chishti, aur Sahibzada Muhammad Tauseef Haider Chishti."
  },
  {
    question: "books available",
    answer: "We have a collection of Islamic books including Naat, Manqabat, Karbala, Aqaid, Fiqh and Tareekh volumes."
  },
  {
    question: "kitabein",
    answer: "Chishti Library par aapko Naat, Manqabat, Tareekh-e-Karbala, Aqaid aur Fiqh par kutabein milengi."
  },
  {
    question: "download books",
    answer: "To download books, navigate to the Books page, select your desired book, and click the Download PDF button."
  },
  {
    question: "read online",
    answer: "Yes! You can read available books online by clicking the Read Online or View PDF button."
  },
  {
    question: "naat kya hai",
    answer: "Naat woh mubarak kalaam hai jismein Nabi-e-Kareem Muhammad ﷺ ki shan, mohabbat aur madah bayan ki jati hai."
  },
  {
    question: "manqabat kya hai",
    answer: "Manqabat woh kalaam hai jismein buzurgan-e-deen, Ahl-e-Bait ya kisi buzurg shakhsiyat ki fazilat bayan ki jati hai."
  },
  {
    question: "hamd kya hai",
    answer: "Hamd Allah Ta'ala ki tareef aur sana par mabni kalaam ko kaha jata hai."
  },
  {
    question: "quran kya hai",
    answer: "Quran Majeed Allah Ta'ala ki aakhri kitab hai jo hamare pyare Nabi ﷺ par nazil hui."
  },
  {
    question: "hadith kya hai",
    answer: "Hadees shareef Huzoor Pak ﷺ ke aqwaal, af'aal aur khamosh tauseeq ko kehte hain."
  },
  {
    question: "imam hussain kaun the",
    answer: "Hazrat Imam Hussain (RA) Huzoor Nabi-e-Kareem ﷺ ke pyare nawase aur Hazrat Ali (RA) aur Syeda Fatima (RA) ke bete hain."
  },
  {
    question: "ahl e bait meaning",
    answer: "Ahl-e-Bait refers to the blessed household and family of Prophet Muhammad ﷺ."
  },
  {
    question: "chishti library kahan hai",
    answer: "Chishti Library ek Digital Islamic Library hai jahan Islamic books, Naat, Manqabat, Hamd, Maqala aur research material online available hai."
  },
  {
    question: "chishti library website",
    answer: "Chishti Library ki website par aap Home, Books, Authors, Developer aur Contact sections explore kar sakte hain."
  },
  {
    question: "books page",
    answer: "Books page par Chishti Library ki available digital books dekhi ja sakti hain. Aap book search karke usay online read ya available hone par PDF download kar sakte hain."
  },
  {
    question: "books kaise search karein",
    answer: "Books search karne ke liye Books page ya Home page ke search box mein book ka title, author ya related keyword enter karein."
  },
  {
    question: "book kaise read karein",
    answer: "Books section mein apni pasand ki book select karein aur Read Online ya View PDF option par click karein."
  },
  {
    question: "author kaise dekhein",
    answer: "Authors section mein Chishti Library se associated authors aur writers ke profiles aur available information dekhi ja sakti hai."
  },
  {
    question: "karbala kya hai",
    answer: "Karbala Islamic history ka ek azeem waqia hai jahan Hazrat Imam Hussain (RA) aur unke companions ne haq aur deen ke liye azeem qurbani di."
  },
  {
    question: "allah kaun hai",
    answer: "Allah Ta'ala pure jahan ka Khaliq aur Maalik hai. Wo akela hai aur Uska koi shareek nahi."
  },
  {
    question: "nabi muhammad kaun hain",
    answer: "Hazrat Muhammad Mustafa ﷺ Allah Ta'ala ke aakhri Nabi aur Rasool hain."
  },
  {
    question: "last prophet kaun hain",
    answer: "Hazrat Muhammad Mustafa ﷺ Allah Ta'ala ke Khatam-un-Nabiyyin aur aakhri Nabi hain."
  },
  {
    question: "islam ke kitne arkan hain",
    answer: "Islam ke bunyadi arkan paanch hain: Kalma, Namaz, Roza, Zakat aur Hajj."
  },
  {
    question: "thanks",
    answer: "You are very welcome! May Allah bless you and reward you abundantly. JazakAllahu Khairan."
  },
  {
    question: "shukriya",
    answer: "Aap ka bhi shukriya! Allah aap ko khush rakhe aur ilm ki shama roshan rakhne ki taufeeq de."
  },
  {
    question: "bye",
    answer: "Allah Hafiz! Please visit Chishti Library again. Have a blessed day."
  }
];


/* ---------- BOOK DATA ---------- */

const books = [
  {
    title: "Al-Rehman",
    author: "Sahibzada Muhammad Latif Sajid Chishti",
    category: "Hamd",
    cover: "al-rehman-cover.png"
  },
  {
    title: "Husn-e-Kainat",
    author: "Hazrat Allama Saim Chishti",
    category: "Naat",
    cover: "husn-e-kainat-cover.png"
  },
  {
    title: "Shahdaye Karbala",
    author: "Hazrat Allama Saim Chishti",
    category: "Manqabat",
    cover: "shahdaye karbala-cover.png"
  },
  {
    title: "Shaheed Ibn-e-Shaheed",
    author: "Hazrat Allama Saim Chishti",
    category: "Seerat",
    cover: "shaheed-ibn-e-shaheed-cover.png"
  },
  {
    title: "Nawaye Saim",
    author: "Hazrat Allama Saim Chishti",
    category: "Naat",
    cover: "Nawaye Saim-cover.png"
  },
  {
    title: "Kulliyat-e-Saim Chishti",
    author: "Hazrat Allama Saim Chishti",
    category: "Kulliyat",
    cover: "kulliyat e saim chishti-cover.png"
  },
  {
    title: "Armaghan-e-Madina",
    author: "Hazrat Allama Saim Chishti",
    category: "Naat",
    cover: "Armaghan-e-Madina-By-Allama-Saim-Chishti-cover.webp"
  },
  {
    title: "Shan-e-Kainat",
    author: "Hazrat Allama Saim Chishti",
    category: "Naat",
    cover: "naat-cover2.png"
  },
  {
    title: "Rehmat Da Khazana",
    author: "Hazrat Allama Saim Chishti",
    category: "Naat",
    cover: "rehmatdakhazana-cover.png"
  },
  {
    title: "Madinay Diyan Kaliyan",
    author: "Hazrat Allama Saim Chishti",
    category: "Naat",
    cover: "madinydiankalinyan-cover.png"
  },
  {
    title: "Darooda Di Dali",
    author: "Sahibzada Muhammad Latif Sajid Chishti",
    category: "Naat",
    cover: "darooda di dali-cover..png"
  },
  {
    title: "Sbhy Hamdan Ne Rab Sohnay",
    author: "Sahibzada Muhammad Latif Sajid Chishti",
    category: "Hamd",
    cover: "Sbhy Hamdan Ne Rab Sohnay-cover.jpeg"
  },
  {
    title: "Saqi e Baghdad",
    author: "Sahibzada Muhammad Latif Sajid Chishti",
    category: "Manqabat",
    cover: "Saqi e Baghdad.cover.jpeg"
  },
  {
    title: "Rab de rang niraly hamdya punjabi",
    author: "Sahibzada Muhammad Latif Sajid Chishti",
    category: "Hamd",
    cover: "Rab de rang niraly hamdya-cover.jpeg"
  },
  {
    title: "Hammad Hico",
    author: "Sahibzada Muhammad Latif Sajid Chishti",
    category: "Hamd",
    cover: "Hammad Hico-cover.jpeg"
  },
  {
    title: "Mazhar E noor e Khuda",
    author: "Sahibzada Muhammad Latif Sajid Chishti",
    category: "Hamd",
    cover: "Mazhar E noor e Khuda-cover.png"
  },
  {
    title: "Ali Ali Hai",
    author: "Hazrat Allama Saim Chishti",
    category: "Manqabat",
    cover: "ALI ALI HAI-COVER.png"
  },
  {
    title: "Roohe Kainat",
    author: "Hazrat Allama Saim Chishti",
    category: "Naat",
    cover: "Rooh-cover.png"
  },
  {
    title: "Kabe da Kaba",
    author: "Hazrat Allama Saim Chishti",
    category: "Naat",
    cover: "cover.png"
  },
  {
    title: "Madinangina",
    author: "Hazrat Allama Saim Chishti",
    category: "Naat",
    cover: "Madinangin.png"
  },
  {
    title: "Noor da Chashma",
    author: "Hazrat Allama Saim Chishti",
    category: "Naat",
    cover: "noor da chashma-cover.png"
  },
  {
    title: "Allama Saim Zinda Hai",
    author: "Hazrat Allama Saim Chishti",
    category: "Naat",
    cover: "allama saim zinda hai-cover .png"
  },
  {
    title: "Kalam e Saim",
    author: "Hazrat Allama Saim Chishti",
    category: "Naat",
    cover: " kalam e saim-cover.png"
  },
  {
    title: "Baharan Muskrappy",
    author: "Hazrat Allama Saim Chishti",
    category: "Naat",
    cover: " baharhan muskrappy-cover.png"
  },
  {
    title: "Kuliyat e Saim Urdu",
    author: "Hazrat Allama Saim Chishti",
    category: "Naat",
    cover: "Kuliyat e Saim Urdu-cover.png"
  }
];


/* ---------- STORAGE ---------- */

function loadKnowledge() {

  const saved = localStorage.getItem("chishtiAIKnowledge");

  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error(error);
    }
  }

  return [...defaultKnowledge];
}


let knowledge = loadKnowledge();


function saveKnowledge() {
  localStorage.setItem(
    "chishtiAIKnowledge",
    JSON.stringify(knowledge, null, 2)
  );
}


/* ---------- DOM ---------- */

const knowledgeList = document.getElementById("knowledgeList");
const booksList = document.getElementById("booksList");

const knowledgeCount =
  document.getElementById("knowledgeCount");

const bookCount =
  document.getElementById("bookCount");

const questionCount =
  document.getElementById("questionCount");

const modal =
  document.getElementById("knowledgeModal");

const form =
  document.getElementById("knowledgeForm");

const questionInput =
  document.getElementById("questionInput");

const answerInput =
  document.getElementById("answerInput");

const editIndex =
  document.getElementById("editIndex");

const modalTitle =
  document.getElementById("modalTitle");


/* ---------- NAVIGATION ---------- */

document.querySelectorAll(".nav-btn").forEach(button => {

  button.addEventListener("click", () => {

    const sectionName =
      button.dataset.section;

    document.querySelectorAll(".nav-btn")
      .forEach(btn => btn.classList.remove("active"));

    document.querySelectorAll(".section")
      .forEach(section => section.classList.remove("active"));

    button.classList.add("active");

    document
      .getElementById(sectionName)
      .classList.add("active");

  });

});


/* ---------- RENDER KNOWLEDGE ---------- */

function renderKnowledge(search = "") {

  knowledgeList.innerHTML = "";

  const term = search.toLowerCase().trim();

  const filtered = knowledge.filter(item => {

    return (
      item.question.toLowerCase().includes(term) ||
      item.answer.toLowerCase().includes(term)
    );

  });


  if (filtered.length === 0) {

    knowledgeList.innerHTML = `
      <div class="knowledge-card">
        <p>No knowledge found.</p>
      </div>
    `;

    return;
  }


  filtered.forEach((item) => {

    const originalIndex =
      knowledge.indexOf(item);

    const card =
      document.createElement("div");

    card.className = "knowledge-card";

    card.innerHTML = `
      <div class="question">
        ${escapeHTML(item.question)}
      </div>

      <div class="answer">
        ${escapeHTML(item.answer)}
      </div>

      <div class="card-actions">

        <button
          class="edit-btn"
          onclick="editKnowledge(${originalIndex})"
        >
          Edit
        </button>

        <button
          class="delete-btn"
          onclick="deleteKnowledge(${originalIndex})"
        >
          Delete
        </button>

      </div>
    `;

    knowledgeList.appendChild(card);

  });

}


/* ---------- RENDER BOOKS ---------- */

function renderBooks() {

  booksList.innerHTML = "";

  books.forEach(book => {

    const card =
      document.createElement("div");

    card.className = "book-card";

    card.innerHTML = `
      <img
        src="${escapeAttribute(book.cover)}"
        alt="${escapeAttribute(book.title)}"
        onerror="this.style.display='none'"
      >

      <div class="book-info">

        <h3>
          ${escapeHTML(book.title)}
        </h3>

        <p>
          ${escapeHTML(book.author)}
        </p>

        <p>
          ${escapeHTML(book.category)}
        </p>

      </div>
    `;

    booksList.appendChild(card);

  });

}


/* ---------- STATS ---------- */

function updateStats() {

  knowledgeCount.textContent =
    knowledge.length;

  questionCount.textContent =
    knowledge.length;

  bookCount.textContent =
    books.length;

}


/* ---------- OPEN MODAL ---------- */

document
  .getElementById("addKnowledgeBtn")
  .addEventListener("click", () => {

    modalTitle.textContent =
      "Add Knowledge";

    editIndex.value = "";

    questionInput.value = "";

    answerInput.value = "";

    modal.classList.add("show");

    questionInput.focus();

  });


/* ---------- CLOSE MODAL ---------- */

function closeModal() {
  modal.classList.remove("show");
}

document
  .getElementById("closeModal")
  .addEventListener("click", closeModal);

document
  .getElementById("cancelBtn")
  .addEventListener("click", closeModal);

modal.addEventListener("click", event => {

  if (event.target === modal) {
    closeModal();
  }

});


/* ---------- SAVE ---------- */

form.addEventListener("submit", event => {

  event.preventDefault();

  const question =
    questionInput.value.trim();

  const answer =
    answerInput.value.trim();

  const index =
    editIndex.value;


  if (!question || !answer) {
    alert("Question aur answer dono required hain.");
    return;
  }


  if (index === "") {

    knowledge.push({
      question,
      answer
    });

  } else {

    knowledge[Number(index)] = {
      question,
      answer
    };

  }


  saveKnowledge();

  renderKnowledge(
    document.getElementById("searchInput").value
  );

  updateStats();

  closeModal();

});


/* ---------- EDIT ---------- */

window.editKnowledge = function(index) {

  const item =
    knowledge[index];

  modalTitle.textContent =
    "Edit Knowledge";

  editIndex.value =
    index;

  questionInput.value =
    item.question;

  answerInput.value =
    item.answer;

  modal.classList.add("show");

  questionInput.focus();

};


/* ---------- DELETE ---------- */

window.deleteKnowledge = function(index) {

  const item =
    knowledge[index];

  const confirmed =
    confirm(
      `Delete this knowledge?\n\n${item.question}`
    );

  if (!confirmed) {
    return;
  }

  knowledge.splice(index, 1);

  saveKnowledge();

  renderKnowledge(
    document.getElementById("searchInput").value
  );

  updateStats();

};


/* ---------- SEARCH ---------- */

document
  .getElementById("searchInput")
  .addEventListener("input", event => {

    renderKnowledge(event.target.value);

  });


/* ---------- EXPORT JSON ---------- */

document
  .getElementById("exportBtn")
  .addEventListener("click", () => {

    const json =
      JSON.stringify(knowledge, null, 2);

    const blob =
      new Blob([json], {
        type: "application/json"
      });

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "knowledge.json";

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

  });


/* ---------- RESET ---------- */

document
  .getElementById("resetBtn")
  .addEventListener("click", () => {

    const confirmed =
      confirm(
        "Reset local knowledge to default?"
      );

    if (!confirmed) {
      return;
    }

    knowledge =
      [...defaultKnowledge];

    saveKnowledge();

    renderKnowledge();

    updateStats();

  });


/* ---------- SECURITY HELPERS ---------- */

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function escapeAttribute(value) {

  return escapeHTML(value);

}


/* ---------- START ---------- */

renderKnowledge();

renderBooks();

updateStats();
