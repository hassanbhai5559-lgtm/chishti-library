/* =========================================================
   CHISHTI AI SERVER
   Books + Knowledge Base + Reader Control
========================================================= */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


/* =========================================================
   BASIC SETUP
========================================================= */

dotenv.config();

const app = express();

const PORT =
    process.env.PORT || 3000;

const FRONTEND_ORIGIN =
    process.env.FRONTEND_ORIGIN ||
    "https://hassanbhai5559-lgtm.github.io";


/* =========================================================
   OPENAI
========================================================= */

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


/* =========================================================
   PATH SETUP
========================================================= */

const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);


/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(
    cors({
        origin: FRONTEND_ORIGIN,
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type"]
    })
);

app.use(
    express.json({
        limit: "1mb"
    })
);


/* =========================================================
   LOAD JSON FILES
========================================================= */

function loadJSON(filename, fallback) {

    try {

        const filePath =
            path.join(__dirname, filename);

        const raw =
            fs.readFileSync(
                filePath,
                "utf8"
            );

        return JSON.parse(raw);

    } catch (error) {

        console.error(
            `Failed to load ${filename}:`,
            error.message
        );

        return fallback;
    }
}


const booksData =
    loadJSON("books.json", []);

const knowledgeData =
    loadJSON("knowledge.json", []);

const chatbotData =
    loadJSON("chatbot.json", []);


/* =========================================================
   BOOK DATA
========================================================= */

function getBooksArray() {

    if (Array.isArray(booksData)) {
        return booksData;
    }

    if (
        booksData &&
        Array.isArray(booksData.books)
    ) {
        return booksData.books;
    }

    if (
        booksData &&
        Array.isArray(booksData.entries)
    ) {
        return booksData.entries;
    }

    return [];
}


const books =
    getBooksArray();


console.log(
    `Loaded ${books.length} books.`
);


/* =========================================================
   TEXT NORMALIZATION
========================================================= */

function normalizeText(value) {

    return String(value || "")
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}


/* =========================================================
   BOOK SEARCH
========================================================= */

function searchLibrary(query) {

    const q =
        normalizeText(query);

    if (!q) {
        return [];
    }

    const words =
        q.split(/\s+/)
            .filter(Boolean);


    const results =
        books
            .map(book => {

                const title =
                    normalizeText(
                        book.title ||
                        book.name
                    );

                const author =
                    normalizeText(
                        book.author
                    );

                const category =
                    normalizeText(
                        book.category
                    );

                const description =
                    normalizeText(
                        book.description
                    );

                const id =
                    normalizeText(
                        book.id
                    );

                const searchable =
                    [
                        title,
                        author,
                        category,
                        description,
                        id
                    ]
                        .filter(Boolean)
                        .join(" ");


                let score = 0;


                /* Exact phrase */

                if (title === q) {
                    score += 30;
                }

                if (title.includes(q)) {
                    score += 15;
                }

                if (author.includes(q)) {
                    score += 10;
                }

                if (category.includes(q)) {
                    score += 8;
                }

                if (description.includes(q)) {
                    score += 5;
                }


                /* Individual words */

                for (const word of words) {

                    if (word.length < 2) {
                        continue;
                    }

                    if (title.includes(word)) {
                        score += 6;
                    }

                    if (author.includes(word)) {
                        score += 4;
                    }

                    if (category.includes(word)) {
                        score += 3;
                    }

                    if (description.includes(word)) {
                        score += 2;
                    }

                    if (searchable.includes(word)) {
                        score += 1;
                    }
                }


                return {
                    book,
                    score
                };

            })
            .filter(item => item.score > 0)
            .sort(
                (a, b) =>
                    b.score - a.score
            )
            .slice(0, 10)
            .map(item => item.book);


    return results;
}


/* =========================================================
   FIND BOOK
========================================================= */

function findBook(identifier) {

    const q =
        normalizeText(identifier);

    if (!q) {
        return null;
    }


    /* Exact ID */

    const byId =
        books.find(
            book =>
                String(book.id) ===
                String(identifier)
        );

    if (byId) {
        return byId;
    }


    /* Exact title/name */

    const exact =
        books.find(book => {

            const title =
                normalizeText(
                    book.title ||
                    book.name
                );

            return title === q;
        });

    if (exact) {
        return exact;
    }


    /* Partial title */

    const partial =
        books.find(book => {

            const title =
                normalizeText(
                    book.title ||
                    book.name
                );

            return title.includes(q);
        });

    if (partial) {
        return partial;
    }


    /* Author / slug / filename */

    const other =
        books.find(book => {

            const values = [

                book.author,
                book.slug,
                book.pdf,
                book.pdfUrl,
                book.id

            ];

            return values.some(
                value =>
                    normalizeText(value)
                        .includes(q)
            );
        });


    return other || null;
}


/* =========================================================
   KNOWLEDGE BASE SEARCH
========================================================= */

function getKnowledgeEntries() {

    const entries = [];


    /* chatbot.json */

    if (Array.isArray(chatbotData)) {

        for (
            const item
            of chatbotData
        ) {

            entries.push({
                source: "chatbot",
                ...item
            });

        }

    } else if (
        chatbotData &&
        Array.isArray(
            chatbotData.entries
        )
    ) {

        for (
            const item
            of chatbotData.entries
        ) {

            entries.push({
                source: "chatbot",
                ...item
            });

        }

    }


    /* knowledge.json */

    if (Array.isArray(knowledgeData)) {

        for (
            const item
            of knowledgeData
        ) {

            entries.push({
                source: "knowledge",
                ...item
            });

        }

    } else if (
        knowledgeData &&
        Array.isArray(
            knowledgeData.entries
        )
    ) {

        for (
            const item
            of knowledgeData.entries
        ) {

            entries.push({
                source: "knowledge",
                ...item
            });

        }

    }


    return entries;
}


function searchKnowledge(query) {

    const q =
        normalizeText(query);

    if (!q) {
        return [];
    }

    const words =
        q.split(/\s+/)
            .filter(Boolean);


    const entries =
        getKnowledgeEntries();


    const results =
        entries
            .map(item => {

                const searchable =
                    normalizeText(
                        [
                            item.category,
                            item.question,
                            item.answer,
                            item.title,
                            item.name,
                            item.description,
                            item.content,
                            item.text
                        ]
                            .filter(Boolean)
                            .join(" ")
                    );


                let score = 0;


                /* Exact phrase */

                if (
                    searchable.includes(q)
                ) {
                    score += 10;
                }


                /* Individual words */

                for (
                    const word
                    of words
                ) {

                    if (word.length < 2) {
                        continue;
                    }

                    if (
                        searchable.includes(
                            word
                        )
                    ) {
                        score += 2;
                    }

                }


                return {
                    item,
                    score
                };

            })
            .filter(
                item =>
                    item.score > 0
            )
            .sort(
                (a, b) =>
                    b.score - a.score
            )
            .slice(0, 8)
            .map(
                item =>
                    item.item
            );


    return results;
}


/* =========================================================
   OPENAI SYSTEM PROMPT
========================================================= */

const SYSTEM_PROMPT = `

You are Chishti AI, the AI librarian of Chishti Library.

Your job is to help users discover books, understand library
information, use the Chishti Reader and interact naturally.

IMPORTANT RULES:

1. Use verified library metadata and knowledge-base results
   whenever available.

2. When the user asks about Chishti Library, Hazrat Allama
   Saim Chishti, his books, family, Reader, website or
   Chishti AI, use the knowledge search tool when necessary.

3. For book questions, use the library search tool.

4. If the user asks to open a book, first identify the correct
   book and then use open_book.

5. If the user asks for Reader controls, use reader_command.

6. Never invent biography details, dates, education, teachers,
   languages, family information or authorship.

7. If information is unavailable or not verified, clearly say
   that the information is not currently verified.

8. Never reveal API keys, passwords, private credentials,
   server secrets or environment variables.

9. Chishti AI is an AI librarian. Do not present yourself as
   a qualified Mufti or religious authority.

10. Answer naturally in the language used by the user.
    English, Urdu and Roman Urdu are supported.

11. Be concise for simple questions and detailed when the user
    asks for explanation.

12. Do not claim that a book exists unless it is found in the
    library data.

13. When a search returns no matching book, tell the user that
    no matching book was found.

14. Respect the official book titles stored in books.json.

ABOUT CHISHTI LIBRARY:

Chishti Library is a digital Islamic library containing books
and literary material including Naat, Manqabat, Hamd, Maqala,
Kulliyat and other available categories.

ABOUT HAZRAT ALLAMA SAIM CHISHTI:

Use only verified information available through the knowledge
base and library metadata. Do not invent missing biographical
details.

KNOWN FAMILY INFORMATION:

The available verified library information identifies these
sons:

1. Sahibzada Muhammad Latif Sajid Chishti
2. Sahibzada Muhammad Shafiq Mujahid Chishti
3. Sahibzada Muhammad Touseef Haider Chishti

Do not add unverified family details.

READER:

The Chishti Reader supports PDF reading, page navigation,
zoom, search, bookmarks, themes, read aloud, fullscreen,
download and printing where available.

When the user explicitly requests a Reader action, use the
appropriate reader command.

`;


/* =========================================================
   OPENAI TOOLS
========================================================= */

const tools = [

    /* =====================================================
       SEARCH LIBRARY
    ===================================================== */

    {
        type: "function",

        name: "search_library",

        description:
            "Search the Chishti Library books by title, author, category or description.",

        parameters: {

            type: "object",

            properties: {

                query: {
                    type: "string",
                    description:
                        "Book title, author, category or search phrase."
                }

            },

            required: ["query"],

            additionalProperties: false
        }
    },


    /* =====================================================
       SEARCH KNOWLEDGE
    ===================================================== */

    {
        type: "function",

        name: "search_knowledge",

        description:
            "Search the verified Chishti AI knowledge base for information about Chishti Library, Hazrat Allama Saim Chishti, books, family information, Reader, website features, categories and help topics.",

        parameters: {

            type: "object",

            properties: {

                query: {
                    type: "string",
                    description:
                        "The user's question or search query."
                }

            },

            required: ["query"],

            additionalProperties: false
        }
    },


    /* =====================================================
       GET BOOK INFO
    ===================================================== */

    {
        type: "function",

        name: "get_book_info",

        description:
            "Get complete information about a specific Chishti Library book.",

        parameters: {

            type: "object",

            properties: {

                identifier: {
                    type: "string",
                    description:
                        "Book ID, title, name, slug or PDF filename."
                }

            },

            required: ["identifier"],

            additionalProperties: false
        }
    },


    /* =====================================================
       OPEN BOOK
    ===================================================== */

    {
        type: "function",

        name: "open_book",

        description:
            "Open a specific Chishti Library book in the Chishti Reader.",

        parameters: {

            type: "object",

            properties: {

                identifier: {
                    type: "string",
                    description:
                        "Book ID or exact/partial book title."
                }

            },

            required: ["identifier"],

            additionalProperties: false
        }
    },


    /* =====================================================
       READER COMMAND
    ===================================================== */

    {
        type: "function",

        name: "reader_command",

        description:
            "Control the Chishti Reader.",

        parameters: {

            type: "object",

            properties: {

                command: {

                    type: "string",

                    enum: [

                        "next_page",
                        "previous_page",
                        "go_to_page",
                        "zoom_in",
                        "zoom_out",
                        "reset_zoom",
                        "fullscreen",
                        "print",
                        "download",
                        "listen",
                        "pause_listen",
                        "stop_listen"

                    ],

                    description:
                        "Reader action to perform."
                },

                page: {

                    type: "integer",

                    description:
                        "Page number for go_to_page."

                }

            },

            required: ["command"],

            additionalProperties: false
        }
    }

];


/* =========================================================
   TOOL EXECUTION
========================================================= */

async function executeTool(
    name,
    args
) {

    /* =====================================================
       SEARCH LIBRARY
    ===================================================== */

    if (
        name ===
        "search_library"
    ) {

        const results =
            searchLibrary(
                args.query
            );

        return {

            type:
                "library_search",

            query:
                args.query,

            results

        };
    }


    /* =====================================================
       SEARCH KNOWLEDGE
    ===================================================== */

    if (
        name ===
        "search_knowledge"
    ) {

        const results =
            searchKnowledge(
                args.query
            );

        return {

            type:
                "knowledge_search",

            query:
                args.query,

            results

        };
    }


    /* =====================================================
       GET BOOK INFO
    ===================================================== */

    if (
        name ===
        "get_book_info"
    ) {

        const book =
            findBook(
                args.identifier
            );


        if (!book) {

            return {

                type:
                    "book_info",

                found:
                    false,

                identifier:
                    args.identifier

            };

        }


        return {

            type:
                "book_info",

            found:
                true,

            book

        };
    }


    /* =====================================================
       OPEN BOOK
    ===================================================== */

    if (
        name ===
        "open_book"
    ) {

        const book =
            findBook(
                args.identifier
            );


        if (!book) {

            return {

                type:
                    "reader_action",

                action:
                    "open_book",

                success:
                    false,

                error:
                    "Book not found."

            };

        }


        return {

            type:
                "reader_action",

            action:
                "open_book",

            success:
                true,

            book: {

                id:
                    book.id,

                title:
                    book.title ||
                    book.name,

                pdf:
                    book.pdf ||
                    book.pdfUrl ||
                    ""

            }

        };

    }


    /* =====================================================
       READER COMMAND
    ===================================================== */

    if (
        name ===
        "reader_command"
    ) {

        return {

            type:
                "reader_action",

            action:
                args.command,

            ...(args.page != null
                ? {
                    page:
                        Number(args.page)
                }
                : {})

        };

    }


    /* =====================================================
       UNKNOWN TOOL
    ===================================================== */

    return {

        error:
            `Unknown tool: ${name}`

    };

}


/* =========================================================
   CHAT API
========================================================= */

app.post(
    "/api/chat",
    async (req, res) => {

        try {

            const message =
                String(
                    req.body?.message ||
                    ""
                ).trim();

            const previousResponseId =
                req.body?.previousResponseId ||
                null;


            /* =============================================
               VALIDATION
            ============================================= */

            if (!message) {

                return res
                    .status(400)
                    .json({

                        ok: false,

                        error:
                            "Message is required."

                    });

            }


            if (
                !process.env.OPENAI_API_KEY
            ) {

                return res
                    .status(500)
                    .json({

                        ok: false,

                        error:
                            "OPENAI_API_KEY is not configured."

                    });

            }


            /* =============================================
               FIRST REQUEST
            ============================================= */

            let response =
                await openai.responses.create({

                    model:
                        process.env.OPENAI_MODEL ||
                        "gpt-5.6",

                    instructions:
                        SYSTEM_PROMPT,

                    input:
                        message,

                    previous_response_id:
                        previousResponseId ||
                        undefined,

                    tools,

                    store:
                        true

                });


            /* =============================================
               TOOL LOOP
            ============================================= */

            const actions = [];

            let rounds = 0;


            while (
                rounds < 5
            ) {

                rounds++;


                const functionCalls =
                    response.output
                        .filter(
                            item =>
                                item.type ===
                                "function_call"
                        );


                if (
                    functionCalls.length === 0
                ) {
                    break;
                }


                const toolOutputs = [];


                for (
                    const call
                    of functionCalls
                ) {

                    let args = {};


                    try {

                        args =
                            JSON.parse(
                                call.arguments ||
                                "{}"
                            );

                    } catch (error) {

                        console.error(
                            "Invalid tool arguments:",
                            error
                        );

                        args = {};

                    }


                    const result =
                        await executeTool(
                            call.name,
                            args
                        );


                    /* =====================================
                       SAVE READER ACTIONS
                    ===================================== */

                    if (
                        result &&
                        result.type ===
                        "reader_action"
                    ) {

                        actions.push(
                            result
                        );

                    }


                    /* =====================================
                       TOOL OUTPUT
                    ===================================== */

                    toolOutputs.push({

                        type:
                            "function_call_output",

                        call_id:
                            call.call_id,

                        output:
                            JSON.stringify(
                                result
                            )

                    });

                }


                /* =========================================
                   CONTINUE RESPONSE
                ========================================= */

                response =
                    await openai.responses.create({

                        model:
                            process.env.OPENAI_MODEL ||
                            "gpt-5.6",

                        instructions:
                            SYSTEM_PROMPT,

                        previous_response_id:
                            response.id,

                        input:
                            toolOutputs,

                        tools,

                        store:
                            true

                    });

            }


            /* =============================================
               FINAL RESPONSE
            ============================================= */

            return res.json({

                ok:
                    true,

                responseId:
                    response.id,

                answer:
                    response.output_text ||
                    "I could not generate a response.",

                actions

            });


        } catch (error) {

            console.error(
                "Chishti AI API Error:",
                error
            );


            return res
                .status(500)
                .json({

                    ok:
                        false,

                    error:
                        error?.message ||
                        "AI request failed."

                });

        }

    }
);


/* =========================================================
   HEALTH CHECK
========================================================= */

app.get(
    "/api/health",
    (req, res) => {

        res.json({

            ok:
                true,

            service:
                "Chishti AI",

            books:
                books.length,

            knowledge:
                getKnowledgeEntries()
                    .length,

            uptime:
                process.uptime(),

            timestamp:
                new Date()
                    .toISOString()

        });

    }
);


/* =========================================================
   ROOT
========================================================= */

app.get(
    "/",
    (req, res) => {

        res.json({

            ok:
                true,

            message:
                "Chishti AI backend is running.",

            service:
                "Chishti AI"

        });

    }
);


/* =========================================================
   START SERVER
========================================================= */

app.listen(
    PORT,
    () => {

        console.log(
            "===================================="
        );

        console.log(
            "      CHISHTI AI SERVER"
        );

        console.log(
            "===================================="
        );

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            `Books loaded: ${books.length}`
        );

        console.log(
            `Knowledge entries: ${
                getKnowledgeEntries().length
            }`
        );

        console.log(
            `Frontend: ${FRONTEND_ORIGIN}`
        );

        console.log(
            "===================================="
        );

    }
);
