/* =========================================
   FIREBASE BOOK SYSTEM
========================================= */

const firebaseBooks = {};


/* =========================================
   CREATE / GET BOOK DOCUMENT
========================================= */

async function getFirebaseBook(book) {

    if (!window.chishtiDB) {
        console.error("Firebase database not available");
        return null;
    }

    /*
       Local book ID ko Firebase document ID
       banaya ja raha hai.

       Example:

       books/1
       books/2
       books/3

       Is se duplicate documents nahi banenge.
    */

    const ref = db
        .collection("books")
        .doc(String(book.id));


    const snapshot = await ref.get();


    if (!snapshot.exists) {

        const newBook = {

            localId: book.id,

            title: book.title,

            author: book.author,

            category: book.category,

            categoryName: book.categoryName,

            cover: book.cover,

            pdf: book.pdf,

            description: book.description,

            views: 0,

            likes: 0,

            shares: 0,

            comments: 0,

            downloads: 0,

            createdAt:
                firebase.firestore.FieldValue.serverTimestamp(),

            updatedAt:
                firebase.firestore.FieldValue.serverTimestamp()

        };


        await ref.set(newBook);

        console.log(
            "🔥 Firebase book created:",
            book.title
        );


        return newBook;

    }


    return snapshot.data();

}
