// ==============================
// Chishti AI Brain v1.0
// Core Intent Engine
// ==============================

import greetings from "./brain/greetings.json" assert { type: "json" };
import smalltalk from "./brain/smalltalk.json" assert { type: "json" };
import commands from "./brain/commands.json" assert { type: "json" };
import books from "./database/books.json" assert { type: "json" };
import authors from "./database/authors.json" assert { type: "json" };
import fallback from "./brain/fallback.json" assert { type: "json" };

// ==============================
// Merge Brain
// ==============================

const brain = [
    ...commands,
    ...books,
    ...authors,
    ...greetings,
    ...smalltalk
];

// ==============================
// Normalize Text
// ==============================

function normalize(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, "");
}


// ==============================
// Book Search First
// ==============================

const foundBook = searchBooks(message);

if (foundBook) {

    return `
📖 ${foundBook.data.title}

Author:
${foundBook.data.author}

Language:
${foundBook.data.language}

Type:
${foundBook.data.category}

Use the Reader to start reading this book.
`;

}

function matchIntent(message) {

    const input = normalize(message);

    for (const item of brain) {

        if (!item.keywords) continue;

        for (const key of item.keywords) {

            if (input.includes(normalize(key))) {
                return item.response;
            }

        }

    }

    return fallback.response;

}


const result = naturalSearch(message);

if (result) {

    if (result.type === "book") {

        return `
📖 ${result.data.title}

Author:
${result.data.author}

Open Reader:
${result.data.reader}
`;

    }

    if (result.type === "author") {

        return `
👤 ${result.data.name}

Books:
${result.data.books.length}

Open Author Profile.
`;

    }

}// ==============================
// Public Function
// ==============================

export function askAI(message) {

    return matchIntent(message);

}

// ==============================
// Priority Engine
// ==============================

const priority = [

    commands,

    books,

    authors,

    greetings,

    smalltalk

];

// ==============================
// Search Function
// ==============================

function searchCollection(message, collection) {

    const input = normalize(message);

    for (const item of collection) {

        if (!item.keywords) continue;

        for (const keyword of item.keywords) {

            if (input.includes(normalize(keyword))) {

                return item.response;

            }

        }

    }

    return null;

}

// ==============================
// Priority Match
// ==============================

function matchIntent(message) {

    for (const collection of priority) {

        const result = searchCollection(message, collection);

        if (result) {

            return result;

        }

    }

    return fallback.response;

}

// ==============================
// Public Function
// ==============================

export function askAI(message) {

    return matchIntent(message);

}

// ==============================
// Smart Score Matching
// ==============================

function getScore(message, keywords) {

    const input = normalize(message);

    let score = 0;

    for (const keyword of keywords) {

        const key = normalize(keyword);

        if (input.includes(key)) {

            score++;

        }

    }

    return score;

}

// ==============================
// Find Best Match
// ==============================

function searchCollection(message, collection) {

    let bestItem = null;
    let highestScore = 0;

    for (const item of collection) {

        if (!item.keywords) continue;

        const score = getScore(message, item.keywords);

        if (score > highestScore) {

            highestScore = score;
            bestItem = item;

        }

    }

    return bestItem;

}

// ==============================
// AI Brain
// ==============================

function matchIntent(message) {

    let best = null;
    let bestScore = 0;

    for (const collection of priority) {

        const result = searchCollection(message, collection);

        if (!result) continue;

        const score = getScore(message, result.keywords);

        if (score > bestScore) {

            bestScore = score;
            best = result;

        }

    }

    if (best) {

        return best.response;

    }

    return fallback.response;

}

// ==============================
// Export
// ==============================

export function askAI(message){

    return matchIntent(message);

}

// ==============================
// Dynamic Book Search
// ==============================

function searchBooks(message) {

    const input = normalize(message);

    for (const book of books) {

        // Book Title
        if (book.title && input.includes(normalize(book.title))) {

            return {
                type: "book",
                data: book
            };

        }

        // Alternate Titles
        if (book.alternate_titles) {

            for (const alt of book.alternate_titles) {

                if (input.includes(normalize(alt))) {

                    return {
                        type: "book",
                        data: book
                    };

                }

            }

        }

        // Keywords
        if (book.keywords) {

            for (const key of book.keywords) {

                if (input.includes(normalize(key))) {

                    return {
                        type: "book",
                        data: book
                    };

                }

            }

        }

    }

    return null;

}

// ==============================
// Dynamic Author Search
// ==============================

function searchAuthors(message) {

    const input = normalize(message);

    for (const author of authors) {

        // Main Name
        if (author.name && input.includes(normalize(author.name))) {

            return {
                type: "author",
                data: author
            };

        }

        // Aliases
        if (author.aliases) {

            for (const alias of author.aliases) {

                if (input.includes(normalize(alias))) {

                    return {
                        type: "author",
                        data: author
                    };

                }

            }

        }

        // Keywords
        if (author.keywords) {

            for (const key of author.keywords) {

                if (input.includes(normalize(key))) {

                    return {
                        type: "author",
                        data: author
                    };

                }

            }

        }

    }

    return null;

}

// ==============================
// Natural Language Search
// ==============================

function naturalSearch(message) {

    const input = normalize(message);

    // -------- Books --------

    for (const book of books) {

        const names = [

            book.title,

            ...(book.alternate_titles || []),

            ...(book.keywords || [])

        ];

        for (const word of names) {

            if (input.includes(normalize(word))) {

                return {

                    type: "book",

                    data: book

                };

            }

        }

    }

    // -------- Authors --------

    for (const author of authors) {

        const names = [

            author.name,

            ...(author.aliases || []),

            ...(author.keywords || [])

        ];

        for (const word of names) {

            if (input.includes(normalize(word))) {

                return {

                    type: "author",

                    data: author

                };

            }

        }

    }

    return null;

}

// ==============================
// Action Engine
// ==============================

function createAction(type, data) {

    switch (type) {

        case "book":

            return {

                reply: `📖 ${data.title}`,

                action: "OPEN_BOOK",

                payload: {

                    id: data.book_id,

                    title: data.title,

                    reader: data.reader

                }

            };

        case "author":

            return {

                reply: `👤 ${data.name}`,

                action: "OPEN_AUTHOR",

                payload: {

                    id: data.author_id,

                    name: data.name

                }

            };

        default:

            return null;

    }

}

// ==============================
// Memory Engine
// ==============================

const memory = {

    lastBook: null,

    lastAuthor: null,

    lastSearch: null,

    history: []

};

// ==============================
// Save Book
// ==============================

function rememberBook(book){

    memory.lastBook = book;

    memory.history.push({

        type: "book",

        value: book.title,

        time: Date.now()

    });

}

// ==============================
// Save Author
// ==============================

function rememberAuthor(author){

    memory.lastAuthor = author;

    memory.history.push({

        type: "author",

        value: author.name,

        time: Date.now()

    });

}

// ==============================
// Save Search
// ==============================

function rememberSearch(text){

    memory.lastSearch = text;

}

// ==============================
// Continue Reading
// ==============================

function continueReading(){

    if(!memory.lastBook){

        return {

            reply: "Aap ne abhi tak koi book open nahi ki."

        };

    }

    return {

        reply: `Continue Reading\n\n${memory.lastBook.title}`,

        action:"OPEN_BOOK",

        payload:{

            id:memory.lastBook.book_id,

            reader:memory.lastBook.reader

        }

    };

}

// ==============================
// Recent History
// ==============================

function getHistory(){

    return memory.history;

}
