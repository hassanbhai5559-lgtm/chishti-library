/*==================================================
CHISHTI LIBRARY
login.js
==================================================*/

/*==========================
ADMIN EMAIL
==========================*/

const ADMIN_EMAIL = "admin@chishtilibrary.com";

/*==========================
LOGIN
==========================*/

const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    message.style.color = "#0b6b3a";
    message.innerHTML = "Signing in...";

    auth.signInWithEmailAndPassword(email, password)

        .then((userCredential) => {

            const user = userCredential.user;

            // Sirf Admin Email Allow
            if (user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {

                auth.signOut();

                message.style.color = "red";
                message.innerHTML = "Access Denied! You are not Admin.";

                return;
            }

            message.style.color = "green";
            message.innerHTML = "Login Successful...";

            setTimeout(() => {

                window.location.href = "admin.html";

            }, 1000);

        })

        .catch((error) => {

            message.style.color = "red";
            message.innerHTML = error.message;

        });

});

/*==========================
ALREADY LOGIN
==========================*/

auth.onAuthStateChanged((user) => {

    if (user && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {

        window.location.href = "admin.html";

    }

});
