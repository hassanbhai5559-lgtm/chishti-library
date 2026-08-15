/* =========================================================
   CHISHTI LIBRARY
   login.js
========================================================= */


/* =========================================================
   FIREBASE CONFIG
========================================================= */

const firebaseConfig = {

    apiKey:
        "AIzaSyD0h4LFzHbInFRMgtjosgSbGgoBxNwFbGU",

    authDomain:
        "chishti-library.firebaseapp.com",

    projectId:
        "chishti-library",

    storageBucket:
        "chishti-library.firebasestorage.app",

    messagingSenderId:
        "103447043162",

    appId:
        "1:103447043162:web:f242cd2670aaa9786e8c63",

    measurementId:
        "G-833P7N3LNT"

};


/* =========================================================
   CHECK FIREBASE
========================================================= */

if (typeof firebase === "undefined") {

    console.error(
        "Firebase SDK load nahi hua."
    );

    throw new Error(
        "Firebase SDK is not loaded."
    );

}


/* =========================================================
   INITIALIZE
========================================================= */

firebase.initializeApp(
    firebaseConfig
);


const auth =
    firebase.auth();


const db =
    firebase.firestore();


/* =========================================================
   ELEMENTS
========================================================= */

const emailInput =
    document.getElementById(
        "loginEmail"
    );


const passwordInput =
    document.getElementById(
        "loginPassword"
    );


const emailLoginBtn =
    document.getElementById(
        "emailLoginBtn"
    );


const googleLoginBtn =
    document.getElementById(
        "googleLoginBtn"
    );


const guestLoginBtn =
    document.getElementById(
        "guestLoginBtn"
    );


const passwordToggle =
    document.getElementById(
        "passwordToggle"
    );


const errorBox =
    document.getElementById(
        "loginError"
    );


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    message,
    success = false
) {

    if (!errorBox) return;


    errorBox.innerText =
        message;


    errorBox.style.display =
        "block";


    if (success) {

        errorBox.style.background =
            "#e9f9ef";

        errorBox.style.color =
            "#16803c";

    } else {

        errorBox.style.background =
            "#fff0f0";

        errorBox.style.color =
            "#b00000";

    }

}


/* =========================================================
   HIDE MESSAGE
========================================================= */

function hideMessage() {

    if (!errorBox) return;

    errorBox.innerText = "";

    errorBox.style.display =
        "none";

}


/* =========================================================
   BUTTON LOADING
========================================================= */

function setLoading(
    button,
    loading,
    text
) {

    if (!button) return;


    if (loading) {

        button.disabled =
            true;

        button.dataset.original =
            button.innerHTML;

        button.innerHTML =
            '<i class="fas fa-spinner fa-spin"></i> ' +
            text;

    } else {

        button.disabled =
            false;

        if (
            button.dataset.original
        ) {

            button.innerHTML =
                button.dataset.original;

        }

    }

}


/* =========================================================
   EMAIL LOGIN
========================================================= */

async function emailLogin() {

    hideMessage();


    const email =
        emailInput.value.trim();


    const password =
        passwordInput.value;


    if (!email) {

        showMessage(
            "Please enter your email."
        );

        emailInput.focus();

        return;

    }


    if (!password) {

        showMessage(
            "Please enter your password."
        );

        passwordInput.focus();

        return;

    }


    setLoading(
        emailLoginBtn,
        true,
        "Logging in..."
    );


    try {

        await auth
            .signInWithEmailAndPassword(
                email,
                password
            );


        showMessage(
            "Login successful. Redirecting...",
            true
        );


        redirectUser();


    } catch (error) {

        console.error(
            "Email login error:",
            error
        );


        let message =
            "Login failed.";


        if (
            error.code ===
            "auth/invalid-email"
        ) {

            message =
                "Invalid email address.";

        }

        else if (
            error.code ===
            "auth/user-not-found"
        ) {

            message =
                "No account found with this email.";

        }

        else if (
            error.code ===
            "auth/wrong-password"
        ) {

            message =
                "Incorrect password.";

        }

        else if (
            error.code ===
            "auth/invalid-credential"
        ) {

            message =
                "Email or password is incorrect.";

        }

        else if (
            error.code ===
            "auth/too-many-requests"
        ) {

            message =
                "Too many attempts. Try again later.";

        }

        else if (
            error.code ===
            "auth/api-key-not-valid"
        ) {

            message =
                "Firebase API key is invalid. Check your Firebase Web App configuration.";

        }

        else {

            message =
                error.message;

        }


        showMessage(
            message
        );


        setLoading(
            emailLoginBtn,
            false
        );

    }

}


/* =========================================================
   GOOGLE LOGIN
========================================================= */

async function googleLogin() {

    hideMessage();


    setLoading(
        googleLoginBtn,
        true,
        "Connecting..."
    );


    try {

        const provider =
            new firebase
            .auth
            .GoogleAuthProvider();


        provider.setCustomParameters({

            prompt:
                "select_account"

        });


        const result =
            await auth.signInWithPopup(
                provider
            );


        const user =
            result.user;


        console.log(
            "Google login:",
            user.email
        );


        await saveUser(
            user,
            "google"
        );


        showMessage(
            "Google login successful. Redirecting...",
            true
        );


        redirectUser();


    } catch (error) {

        console.error(
            "Google login error:",
            error
        );


        let message =
            "Google login failed.";


        if (
            error.code ===
            "auth/popup-closed-by-user"
        ) {

            message =
                "Google login window was closed.";

        }

        else if (
            error.code ===
            "auth/popup-blocked"
        ) {

            message =
                "Popup blocked. Please allow popups.";

        }

        else if (
            error.code ===
            "auth/api-key-not-valid"
        ) {

            message =
                "Firebase API key invalid hai. Firebase Console ki current Web App config check karo.";

        }

        else if (
            error.code ===
            "auth/unauthorized-domain"
        ) {

            message =
                "This website domain Firebase Authentication mein authorized nahi hai.";

        }

        else {

            message =
                error.message;

        }


        showMessage(
            message
        );


        setLoading(
            googleLoginBtn,
            false
        );

    }

}


/* =========================================================
   GUEST LOGIN
========================================================= */

async function guestLogin() {

    hideMessage();


    setLoading(
        guestLoginBtn,
        true,
        "Connecting..."
    );


    try {

        const result =
            await auth
            .signInAnonymously();


        const user =
            result.user;


        await saveUser(
            user,
            "guest"
        );


        showMessage(
            "Guest login successful. Redirecting...",
            true
        );


        redirectUser();


    } catch (error) {

        console.error(
            "Guest login error:",
            error
        );


        let message =
            "Guest login failed.";


        if (
            error.code ===
            "auth/operation-not-allowed"
        ) {

            message =
                "Anonymous Authentication Firebase Console mein enable nahi hai.";

        }

        else if (
            error.code ===
            "auth/api-key-not-valid"
        ) {

            message =
                "Firebase API key invalid hai.";

        }

        else {

            message =
                error.message;

        }


        showMessage(
            message
        );


        setLoading(
            guestLoginBtn,
            false
        );

    }

}


/* =========================================================
   SAVE USER
========================================================= */

async function saveUser(
    user,
    provider
) {

    if (!user) return;


    try {

        const userRef =
            db
            .collection("users")
            .doc(user.uid);


        const userDoc =
            await userRef.get();


        if (!userDoc.exists) {

            await userRef.set({

                uid:
                    user.uid,

                email:
                    user.email || "",

                name:
                    user.displayName ||
                    "Guest",

                photoURL:
                    user.photoURL || "",

                provider:
                    provider,

                createdAt:
                    firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

                lastLogin:
                    firebase.firestore
                    .FieldValue
                    .serverTimestamp()

            });

        } else {

            await userRef.update({

                lastLogin:
                    firebase.firestore
                    .FieldValue
                    .serverTimestamp()

            });

        }

    } catch (error) {

        console.error(
            "Save user error:",
            error
        );

    }

}


/* =========================================================
   REDIRECT
========================================================= */

function redirectUser() {

    setTimeout(
        function() {

            window.location.href =
                "index.html";

        },
        700
    );

}


/* =========================================================
   PASSWORD SHOW / HIDE
========================================================= */

if (passwordToggle) {

    passwordToggle.addEventListener(
        "click",
        function() {

            const icon =
                passwordToggle
                .querySelector("i");


            if (
                passwordInput.type ===
                "password"
            ) {

                passwordInput.type =
                    "text";


                icon.classList.remove(
                    "fa-eye"
                );


                icon.classList.add(
                    "fa-eye-slash"
                );

            } else {

                passwordInput.type =
                    "password";


                icon.classList.remove(
                    "fa-eye-slash"
                );


                icon.classList.add(
                    "fa-eye"
                );

            }

        }
    );

}


/* =========================================================
   BUTTON EVENTS
========================================================= */

if (emailLoginBtn) {

    emailLoginBtn.addEventListener(
        "click",
        emailLogin
    );

}


if (googleLoginBtn) {

    googleLoginBtn.addEventListener(
        "click",
        googleLogin
    );

}


if (guestLoginBtn) {

    guestLoginBtn.addEventListener(
        "click",
        guestLogin
    );

}


/* =========================================================
   ENTER KEY
========================================================= */

if (passwordInput) {

    passwordInput.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key ===
                "Enter"
            ) {

                emailLogin();

            }

        }
    );

}


/* =========================================================
   AUTH STATE
========================================================= */

auth.onAuthStateChanged(
    function(user) {

        if (user) {

            console.log(
                "Firebase user:",
                user.email ||
                "Guest"
            );

        }

    }
);


/* =========================================================
   DEBUG
========================================================= */

console.log(
    "Chishti Library login.js loaded."
);

console.log(
    "Firebase SDK:",
    typeof firebase
);

console.log(
    "Firebase Project:",
    firebase.app()
        .options
        .projectId
);
