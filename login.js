/* ==================================================
   CHISHTI LIBRARY
   NORMAL USER LOGIN
   login.js
================================================== */


/* ==================================================
   FIREBASE CONFIG
================================================== */

const firebaseConfig = {

    apiKey: "YOUR_API_KEY",

    authDomain: "YOUR_PROJECT.firebaseapp.com",

    projectId: "YOUR_PROJECT_ID",

    storageBucket: "YOUR_PROJECT.firebasestorage.app",

    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",

    appId: "YOUR_APP_ID"

};


/* ==================================================
   INITIALIZE FIREBASE
================================================== */

if (!firebase.apps.length) {

    firebase.initializeApp(firebaseConfig);

}


const auth = firebase.auth();

const db = firebase.firestore();


/* ==================================================
   ELEMENTS
================================================== */

const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const submitBtn =
    document.getElementById("submitBtn");

const googleBtn =
    document.getElementById("googleBtn");

const switchBtn =
    document.getElementById("switchBtn");

const switchQuestion =
    document.getElementById("switchQuestion");

const formTitle =
    document.getElementById("formTitle");

const formSubtitle =
    document.getElementById("formSubtitle");

const forgotPasswordBtn =
    document.getElementById("forgotPasswordBtn");

const messageBox =
    document.getElementById("message");


/* ==================================================
   MODE
================================================== */

let isSignup = false;


/* ==================================================
   SHOW MESSAGE
================================================== */

function showMessage(text, type = "error") {

    messageBox.textContent = text;

    messageBox.className =
        "message " + type;

}


function clearMessage() {

    messageBox.textContent = "";

    messageBox.className = "message";

}


/* ==================================================
   BUTTON LOADING
================================================== */

function setLoading(button, loading, text) {

    if (!button) return;

    button.disabled = loading;

    if (loading) {

        button.dataset.oldText =
            button.textContent;

        button.textContent = text;

    } else {

        button.textContent =
            button.dataset.oldText || text;

    }

}


/* ==================================================
   FIREBASE ERROR
================================================== */

function getFriendlyError(error) {

    const code = error.code || "";

    switch (code) {

        case "auth/invalid-email":
            return "Email address is not valid.";

        case "auth/user-not-found":
            return "No account exists with this email.";

        case "auth/wrong-password":
            return "Incorrect password.";

        case "auth/invalid-credential":
            return "Email or password is incorrect.";

        case "auth/email-already-in-use":
            return "This email already has an account.";

        case "auth/weak-password":
            return "Password should be at least 6 characters.";

        case "auth/popup-closed-by-user":
            return "Google login was cancelled.";

        case "auth/popup-blocked":
            return "Please allow the Google login popup.";

        case "auth/network-request-failed":
            return "Network error. Please try again.";

        case "auth/too-many-requests":
            return "Too many attempts. Please try again later.";

        default:
            return error.message ||
                "Something went wrong. Please try again.";

    }

}


/* ==================================================
   SAVE USER PROFILE
================================================== */

async function saveUserProfile(user) {

    if (!user) return;

    const userRef =
        db.collection("users").doc(user.uid);

    const userDoc =
        await userRef.get();

    const userData = {

        uid: user.uid,

        name:
            user.displayName ||
            userDataSafeName(user.email),

        email:
            user.email || "",

        photoURL:
            user.photoURL || "",

        provider:
            getProviderName(user),

        updatedAt:
            firebase.firestore.FieldValue.serverTimestamp()

    };


    if (!userDoc.exists) {

        userData.createdAt =
            firebase.firestore.FieldValue
            .serverTimestamp();

    }


    await userRef.set(
        userData,
        { merge: true }
    );

}


/* ==================================================
   SAFE USER NAME
================================================== */

function userDataSafeName(email) {

    if (!email) {

        return "Library User";

    }

    return email
        .split("@")[0]
        .trim() || "Library User";

}


/* ==================================================
   PROVIDER
================================================== */

function getProviderName(user) {

    if (
        user.providerData &&
        user.providerData.length
    ) {

        const provider =
            user.providerData[0].providerId;

        if (provider === "google.com") {

            return "google";

        }

        if (provider === "password") {

            return "password";

        }

        return provider;

    }

    return "unknown";

}


/* ==================================================
   REDIRECT AFTER LOGIN
================================================== */

function redirectAfterLogin() {

    /*
       Normal users ko HOME par bhejo.

       Admin ko yahan handle nahi karna.
       Admin ka login separate admin page se hoga.
    */

    const params =
        new URLSearchParams(
            window.location.search
        );

    const redirect =
        params.get("redirect");


    /*
       Sirf same-site relative paths allow karo.
       External website par redirect nahi karna.
    */

    if (
        redirect &&
        redirect.startsWith("/") &&
        !redirect.startsWith("//")
    ) {

        window.location.href = redirect;

        return;

    }


    window.location.href = "index.html";

}


/* ==================================================
   EMAIL LOGIN / SIGNUP
================================================== */

loginForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        clearMessage();


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
                "Please enter your password."
            );

            return;

        }


        if (
            isSignup &&
            password.length < 6
        ) {

            showMessage(
                "Password must be at least 6 characters."
            );

            return;

        }


        try {

            setLoading(
                submitBtn,
                true,
                isSignup
                    ? "Creating account..."
                    : "Logging in..."
            );


            let result;


            if (isSignup) {

                result =
                    await auth
                    .createUserWithEmailAndPassword(
                        email,
                        password
                    );

            } else {

                result =
                    await auth
                    .signInWithEmailAndPassword(
                        email,
                        password
                    );

            }


            const user =
                result.user;


            await saveUserProfile(user);


            showMessage(
                isSignup
                    ? "Account created successfully."
                    : "Login successful.",
                "success"
            );


            setTimeout(
                redirectAfterLogin,
                500
            );


        } catch (error) {

            console.error(
                "Authentication error:",
                error
            );


            showMessage(
                getFriendlyError(error)
            );


        } finally {

            setLoading(
                submitBtn,
                false,
                isSignup
                    ? "Create account"
                    : "Login"
            );

        }

    }
);


/* ==================================================
   GOOGLE LOGIN
================================================== */

googleBtn.addEventListener(
    "click",
    async function() {

        clearMessage();


        try {

            setLoading(
                googleBtn,
                true,
                "Connecting..."
            );


            const provider =
                new firebase.auth.GoogleAuthProvider();


            provider.setCustomParameters({
                prompt: "select_account"
            });


            const result =
                await auth.signInWithPopup(
                    provider
                );


            const user =
                result.user;


            await saveUserProfile(user);


            showMessage(
                "Google login successful.",
                "success"
            );


            setTimeout(
                redirectAfterLogin,
                500
            );


        } catch (error) {

            console.error(
                "Google login error:",
                error
            );


            /*
               Popup close ko normal error
               ki tarah show na karo.
            */

            if (
                error.code !==
                "auth/popup-closed-by-user"
            ) {

                showMessage(
                    getFriendlyError(error)
                );

            }


        } finally {

            setLoading(
                googleBtn,
                false,
                "Continue with Google"
            );

        }

    }
);


/* ==================================================
   SWITCH LOGIN / SIGNUP
================================================== */

switchBtn.addEventListener(
    "click",
    function() {

        isSignup = !isSignup;

        clearMessage();


        passwordInput.value = "";


        if (isSignup) {

            formTitle.textContent =
                "Create Account";

            formSubtitle.textContent =
                "Create your Chishti Library account";

            submitBtn.textContent =
                "Create account";

            switchQuestion.textContent =
                "Already have an account?";

            switchBtn.textContent =
                "Login";

            forgotPasswordBtn.style.display =
                "none";


        } else {

            formTitle.textContent =
                "Welcome Back";

            formSubtitle.textContent =
                "Login to your Chishti Library account";

            submitBtn.textContent =
                "Login";

            switchQuestion.textContent =
                "Don't have an account?";

            switchBtn.textContent =
                "Create account";

            forgotPasswordBtn.style.display =
                "block";

        }

    }
);


/* ==================================================
   FORGOT PASSWORD
================================================== */

forgotPasswordBtn.addEventListener(
    "click",
    async function() {

        clearMessage();


        const email =
            emailInput.value.trim();


        if (!email) {

            showMessage(
                "Enter your email first, then click Forgot password."
            );

            emailInput.focus();

            return;

        }


        try {

            setLoading(
                forgotPasswordBtn,
                true,
                "Sending..."
            );


            await auth
                .sendPasswordResetEmail(email);


            showMessage(
                "Password reset email has been sent. Check your inbox.",
                "success"
            );


        } catch (error) {

            console.error(
                "Password reset error:",
                error
            );


            showMessage(
                getFriendlyError(error)
            );


        } finally {

            setLoading(
                forgotPasswordBtn,
                false,
                "Forgot password?"
            );

        }

    }
);


/* ==================================================
   AUTH STATE
================================================== */

auth.onAuthStateChanged(
    async function(user) {

        /*
           Agar user already logged in hai,
           login page dobara show na karo.
        */

        if (!user) {

            return;

        }


        /*
           Agar user already login hai,
           home par redirect kar do.
        */

        try {

            await saveUserProfile(user);

        } catch (error) {

            console.error(
                "Profile save error:",
                error
            );

        }


        redirectAfterLogin();

    }
);


/* ==================================================
   ENTER KEY FRIENDLY
================================================== */

[emailInput, passwordInput]
    .forEach(function(input) {

        input.addEventListener(
            "keydown",
            function(event) {

                if (
                    event.key === "Enter"
                ) {

                    loginForm.requestSubmit();

                }

            }
        );

    });


/* ==================================================
   READY
================================================== */

console.log(
    "Chishti Library normal login ready."
);
