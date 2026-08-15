/* =========================================================
   CHISHTI LIBRARY
   login.js
   Firebase Login System
   ========================================================= */


/* =========================================================
   FIREBASE CONFIG
   ========================================================= */

const firebaseConfig = {

    apiKey: "PASTE_YOUR_FIREBASE_API_KEY_HERE",

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
   FIREBASE INITIALIZE
   ========================================================= */

if (!firebase.apps.length) {

    firebase.initializeApp(firebaseConfig);

}


const auth =
    firebase.auth();


const db =
    firebase.firestore();


/* =========================================================
   ELEMENT HELPER
   ========================================================= */

function getElement(id) {

    return document.getElementById(id);

}


/* =========================================================
   MESSAGE
   ========================================================= */

function showMessage(message, type = "error") {

    const errorBox =
        getElement("loginError");

    const messageBox =
        getElement("loginMessage");


    const box =
        errorBox || messageBox;


    if (!box) {

        alert(message);

        return;

    }


    box.textContent = message;

    box.style.display = "block";


    if (type === "success") {

        box.style.color = "#16803c";

    } else {

        box.style.color = "#b00000";

    }

}


/* =========================================================
   CLEAR MESSAGE
   ========================================================= */

function clearMessage() {

    const errorBox =
        getElement("loginError");

    const messageBox =
        getElement("loginMessage");


    if (errorBox) {

        errorBox.textContent = "";

        errorBox.style.display = "none";

    }


    if (messageBox) {

        messageBox.textContent = "";

        messageBox.style.display = "none";

    }

}


/* =========================================================
   BUTTON LOADING
   ========================================================= */

function setButtonLoading(button, loading, text) {

    if (!button) return;


    if (loading) {

        button.dataset.oldText =
            button.innerHTML;

        button.disabled = true;

        button.innerHTML =
            '<i class="fas fa-spinner fa-spin"></i> ' +
            text;

    } else {

        button.disabled = false;

        if (button.dataset.oldText) {

            button.innerHTML =
                button.dataset.oldText;

        }

    }

}


/* =========================================================
   GOOGLE LOGIN
   ========================================================= */

async function googleLogin() {

    clearMessage();


    const button =
        getElement("googleLoginBtn");


    setButtonLoading(
        button,
        true,
        "Connecting..."
    );


    try {

        const provider =
            new firebase.auth.GoogleAuthProvider();


        provider.setCustomParameters({

            prompt: "select_account"

        });


        const result =
            await auth.signInWithPopup(provider);


        const user =
            result.user;


        console.log(
            "Google login successful:",
            user.email
        );


        await saveUser(user, "google");


        showMessage(
            "Google login successful. Redirecting...",
            "success"
        );


        redirectAfterLogin(user);


    } catch (error) {

        console.error(
            "Google login error:",
            error
        );


        showFirebaseError(error);

    }


    setButtonLoading(
        button,
        false
    );

}


/* =========================================================
   GUEST / ANONYMOUS LOGIN
   ========================================================= */

async function guestLogin() {

    clearMessage();


    const button =
        getElement("guestLoginBtn");


    setButtonLoading(
        button,
        true,
        "Entering..."
    );


    try {

        const result =
            await auth.signInAnonymously();


        const user =
            result.user;


        console.log(
            "Guest login successful:",
            user.uid
        );


        await saveUser(user, "guest");


        showMessage(
            "Guest login successful. Redirecting...",
            "success"
        );


        redirectAfterLogin(user);


    } catch (error) {

        console.error(
            "Guest login error:",
            error
        );


        showFirebaseError(error);

    }


    setButtonLoading(
        button,
        false
    );

}


/* =========================================================
   EMAIL / PASSWORD LOGIN
   ========================================================= */

async function emailLogin() {

    clearMessage();


    const emailInput =
        getElement("loginEmail");


    const passwordInput =
        getElement("loginPassword");


    if (!emailInput || !passwordInput) {

        showMessage(
            "Email/password fields nahi mile."
        );

        return;

    }


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


    const button =
        getElement("emailLoginBtn") ||
        getElement("loginBtn");


    setButtonLoading(
        button,
        true,
        "Logging in..."
    );


    try {

        const result =
            await auth.signInWithEmailAndPassword(
                email,
                password
            );


        const user =
            result.user;


        console.log(
            "Email login successful:",
            user.email
        );


        await saveUser(user, "email");


        showMessage(
            "Login successful. Redirecting...",
            "success"
        );


        redirectAfterLogin(user);


    } catch (error) {

        console.error(
            "Email login error:",
            error
        );


        showFirebaseError(error);

    }


    setButtonLoading(
        button,
        false
    );

}


/* =========================================================
   CREATE USER ACCOUNT
   ========================================================= */

async function registerUser() {

    clearMessage();


    const emailInput =
        getElement("registerEmail") ||
        getElement("loginEmail");


    const passwordInput =
        getElement("registerPassword") ||
        getElement("loginPassword");


    if (!emailInput || !passwordInput) {

        showMessage(
            "Registration fields nahi mile."
        );

        return;

    }


    const email =
        emailInput.value.trim();


    const password =
        passwordInput.value;


    if (!email) {

        showMessage(
            "Please enter your email."
        );

        return;

    }


    if (!password) {

        showMessage(
            "Please enter a password."
        );

        return;

    }


    if (password.length < 6) {

        showMessage(
            "Password kam az kam 6 characters ka hona chahiye."
        );

        return;

    }


    const button =
        getElement("registerBtn");


    setButtonLoading(
        button,
        true,
        "Creating..."
    );


    try {

        const result =
            await auth.createUserWithEmailAndPassword(
                email,
                password
            );


        const user =
            result.user;


        console.log(
            "Account created:",
            user.email
        );


        await saveUser(user, "email");


        showMessage(
            "Account created successfully.",
            "success"
        );


        redirectAfterLogin(user);


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        showFirebaseError(error);

    }


    setButtonLoading(
        button,
        false
    );

}


/* =========================================================
   SAVE USER IN FIRESTORE
   ========================================================= */

async function saveUser(user, provider) {

    if (!user) return;


    try {

        const userRef =
            db
            .collection("users")
            .doc(user.uid);


        const userDoc =
            await userRef.get();


        const data = {

            uid:
                user.uid,

            provider:
                provider,

            email:
                user.email || "",

            displayName:
                user.displayName || "Guest",

            photoURL:
                user.photoURL || "",

            lastLogin:
                firebase.firestore
                .FieldValue
                .serverTimestamp()

        };


        if (!userDoc.exists) {

            data.createdAt =
                firebase.firestore
                .FieldValue
                .serverTimestamp();

        }


        await userRef.set(
            data,
            {
                merge: true
            }
        );


    } catch (error) {

        console.error(
            "User Firestore save error:",
            error
        );

    }

}


/* =========================================================
   LOGIN REDIRECT
   ========================================================= */

function redirectAfterLogin(user) {

    /*
       Normal users ko home page par bhejna.
       Agar tumhari home file index.html nahi hai
       to yahan filename change kar dena.
    */


    const currentPath =
        window.location.pathname.toLowerCase();


    if (
        currentPath.includes("admin") ||
        currentPath.includes("admin-login")
    ) {

        window.location.href =
            "admin.html";

        return;

    }


    window.location.href =
        "index.html";

}


/* =========================================================
   LOGOUT
   ========================================================= */

async function logoutUser() {

    try {

        await auth.signOut();


        window.location.href =
            "login.html";


    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

        showFirebaseError(error);

    }

}


/* =========================================================
   AUTH STATE
   ========================================================= */

auth.onAuthStateChanged(
    function(user) {

        console.log(
            "Auth state:",
            user
                ? user.email || "Guest"
                : "Logged out"
        );


        /*
           Agar already login hai to
           login page par dobara form na dikhaye.
        */


        if (user) {

            const loginPage =
                getElement("loginPage");


            if (loginPage) {

                loginPage.classList.add(
                    "logged-in"
                );

            }

        }

    }
);


/* =========================================================
   FIREBASE ERROR HANDLER
   ========================================================= */

function showFirebaseError(error) {

    let message =
        "Login failed. Please try again.";


    switch (error.code) {

        case "auth/api-key-not-valid":

            message =
                "Firebase API key invalid hai. login.js mein Firebase Console wali exact API key paste karo.";

            break;


        case "auth/invalid-api-key":

            message =
                "Firebase API key invalid hai. Firebase Console se correct API key copy karo.";

            break;


        case "auth/popup-closed-by-user":

            message =
                "Google login popup close kar diya gaya.";

            break;


        case "auth/popup-blocked":

            message =
                "Browser ne Google login popup block kar diya. Popups allow karo.";

            break;


        case "auth/cancelled-popup-request":

            message =
                "Google login request cancel ho gayi.";

            break;


        case "auth/network-request-failed":

            message =
                "Internet/network problem. Connection check karo.";

            break;


        case "auth/operation-not-allowed":

            message =
                "Firebase Console mein ye login method enabled nahi hai.";

            break;


        case "auth/unauthorized-domain":

            message =
                "Is website domain ko Firebase Authentication ke Authorized Domains mein add karo.";

            break;


        case "auth/user-not-found":

            message =
                "Is email ka account Firebase mein nahi mila.";

            break;


        case "auth/wrong-password":

            message =
                "Password incorrect hai.";

            break;


        case "auth/invalid-credential":

            message =
                "Email ya password incorrect hai.";

            break;


        case "auth/email-already-in-use":

            message =
                "Is email se account pehle se bana hua hai.";

            break;


        case "auth/weak-password":

            message =
                "Password kam az kam 6 characters ka hona chahiye.";

            break;


        case "auth/invalid-email":

            message =
                "Email address valid nahi hai.";

            break;


        case "auth/too-many-requests":

            message =
                "Bohat zyada login attempts ho gaye. Thori der baad try karo.";

            break;


        case "auth/operation-not-supported-in-this-environment":

            message =
                "Ye login method current environment mein supported nahi hai.";

            break;


        case "auth/argument-error":

            message =
                "Firebase configuration ya login arguments mein problem hai.";

            break;


        case "auth/invalid-credential":

            message =
                "Login credentials invalid hain.";

            break;


        default:

            if (error.message) {

                message =
                    error.message;

            }

    }


    showMessage(
        message,
        "error"
    );

}


/* =========================================================
   ENTER KEY LOGIN
   ========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter"
        ) {

            const passwordInput =
                getElement(
                    "loginPassword"
                );


            if (
                document.activeElement ===
                passwordInput
            ) {

                emailLogin();

            }

        }

    }
);


/* =========================================================
   BUTTON EVENT LISTENERS
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {


        const googleButton =
            getElement(
                "googleLoginBtn"
            );


        if (googleButton) {

            googleButton.addEventListener(
                "click",
                googleLogin
            );

        }


        const guestButton =
            getElement(
                "guestLoginBtn"
            );


        if (guestButton) {

            guestButton.addEventListener(
                "click",
                guestLogin
            );

        }


        const emailButton =
            getElement(
                "emailLoginBtn"
            ) ||
            getElement(
                "loginBtn"
            );


        if (emailButton) {

            emailButton.addEventListener(
                "click",
                emailLogin
            );

        }


        const registerButton =
            getElement(
                "registerBtn"
            );


        if (registerButton) {

            registerButton.addEventListener(
                "click",
                registerUser
            );

        }


        const logoutButton =
            getElement(
                "logoutBtn"
            );


        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                logoutUser
            );

        }


    }
);


/* =========================================================
   DEBUG INFO
   ========================================================= */

console.log(
    "Chishti Library Login System Loaded"
);

console.log(
    "Firebase Project:",
    firebaseConfig.projectId
);
