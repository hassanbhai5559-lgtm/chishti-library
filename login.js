/* ==================================================
   CHISHTI LIBRARY
   login.js
   ADMIN AUTHENTICATION
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


/* ==================================================
   ELEMENTS
================================================== */

const loginForm =
    document.getElementById("loginForm");

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const loginBtn =
    document.getElementById("loginBtn");

const loginError =
    document.getElementById("loginError");

const loginLoading =
    document.getElementById("loginLoading");

const togglePassword =
    document.getElementById("togglePassword");


/* ==================================================
   ALREADY LOGGED IN
================================================== */

auth.onAuthStateChanged(function(user){

    if(user){

        window.location.replace("admin.html");

    }

});


/* ==================================================
   LOGIN
================================================== */

loginForm.addEventListener("submit", async function(event){

    event.preventDefault();

    clearError();

    const email =
        loginEmail.value.trim();

    const password =
        loginPassword.value;


    if(!email || !password){

        showError(
            "Please enter your email and password."
        );

        return;

    }


    setLoading(true);


    try{

        await auth.signInWithEmailAndPassword(
            email,
            password
        );


        window.location.replace("admin.html");


    }catch(error){

        console.error(
            "Login error:",
            error
        );


        showError(
            getFirebaseErrorMessage(error)
        );


        setLoading(false);

    }

});


/* ==================================================
   PASSWORD TOGGLE
================================================== */

togglePassword.addEventListener(
    "click",
    function(){

        const isPassword =
            loginPassword.type === "password";


        loginPassword.type =
            isPassword
                ? "text"
                : "password";


        togglePassword.innerHTML =
            isPassword
                ? '<i class="fas fa-eye-slash"></i>'
                : '<i class="fas fa-eye"></i>';

    }
);


/* ==================================================
   LOADING
================================================== */

function setLoading(isLoading){

    loginBtn.disabled =
        isLoading;


    if(isLoading){

        loginBtn.innerHTML =
            '<i class="fas fa-spinner fa-spin"></i> Logging in...';

        loginLoading.style.display =
            "block";

    }else{

        loginBtn.innerHTML =
            '<i class="fas fa-right-to-bracket"></i> Login';

        loginLoading.style.display =
            "none";

    }

}


/* ==================================================
   ERROR
================================================== */

function showError(message){

    loginError.textContent =
        message;

    loginError.classList.add(
        "show"
    );

}


function clearError(){

    loginError.textContent =
        "";

    loginError.classList.remove(
        "show"
    );

}


/* ==================================================
   FIREBASE ERROR MESSAGE
================================================== */

function getFirebaseErrorMessage(error){

    switch(error.code){

        case "auth/invalid-email":
            return "Email address is invalid.";

        case "auth/user-disabled":
            return "This admin account has been disabled.";

        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
            return "Incorrect email or password.";

        case "auth/too-many-requests":
            return "Too many login attempts. Please try again later.";

        case "auth/network-request-failed":
            return "Network error. Please check your internet connection.";

        default:
            return error.message ||
                   "Login failed. Please try again.";

    }

}
