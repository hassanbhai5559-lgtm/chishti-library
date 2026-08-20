"use strict";

/*
=========================================================
CHISHTI LIBRARY - LOGIN SYSTEM
=========================================================

IMPORTANT:

Firebase configuration is NOT written here.

firebase.js handles:

- Firebase initialization
- Firebase Auth
- Firestore
- Current user
- Auth state

This file only handles the LOGIN PAGE.
=========================================================
*/


document.addEventListener(
    "DOMContentLoaded",
    function () {


        /*
        =================================================
        ELEMENTS
        =================================================
        */

        const loginForm =
            document.getElementById("loginForm");

        const emailInput =
            document.getElementById("email");

        const passwordInput =
            document.getElementById("password");

        const loginButton =
            document.getElementById("loginButton");

        const loginButtonText =
            document.getElementById("loginButtonText");

        const googleButton =
            document.getElementById("googleButton");

        const forgotPassword =
            document.getElementById("forgotPassword");

        const signupButton =
            document.getElementById("signupButton");

        const continueButton =
            document.getElementById("continueButton");

        const togglePassword =
            document.getElementById("togglePassword");

        const messageBox =
            document.getElementById("message");


        /*
        =================================================
        MESSAGE SYSTEM
        =================================================
        */

        function showMessage(
            message,
            type = "error"
        ) {

            if (!messageBox) {
                return;
            }

            messageBox.textContent =
                message;

            messageBox.className =
                "message " + type;

            messageBox.style.display =
                "block";

        }


        function hideMessage() {

            if (!messageBox) {
                return;
            }

            messageBox.textContent = "";

            messageBox.className =
                "message";

            messageBox.style.display =
                "none";

        }


        /*
        =================================================
        LOADING
        =================================================
        */

        function setLoginLoading(
            loading
        ) {

            if (!loginButton) {
                return;
            }


            loginButton.disabled =
                loading;


            if (loading) {

                loginButtonText.innerHTML = `
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Logging in...
                `;

            } else {

                loginButtonText.textContent =
                    "Login";

            }

        }


        /*
        =================================================
        PASSWORD SHOW / HIDE
        =================================================
        */

        if (togglePassword) {

            togglePassword.addEventListener(
                "click",
                function () {

                    const isPassword =
                        passwordInput.type ===
                        "password";


                    if (isPassword) {

                        passwordInput.type =
                            "text";

                        togglePassword.innerHTML =
                            '<i class="fa-solid fa-eye-slash"></i>';

                        togglePassword.setAttribute(
                            "aria-label",
                            "Hide password"
                        );

                    } else {

                        passwordInput.type =
                            "password";

                        togglePassword.innerHTML =
                            '<i class="fa-solid fa-eye"></i>';

                        togglePassword.setAttribute(
                            "aria-label",
                            "Show password"
                        );

                    }

                }
            );

        }


        /*
        =================================================
        EMAIL + PASSWORD LOGIN
        =================================================
        */

        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                async function (event) {

                    event.preventDefault();

                    hideMessage();


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
                        !window.auth
                    ) {

                        showMessage(
                            "Firebase Authentication is not ready."
                        );

                        console.error(
                            "window.auth is missing."
                        );

                        return;

                    }


                    setLoginLoading(true);


                    try {

                        await window.auth
                            .signInWithEmailAndPassword(
                                email,
                                password
                            );


                        showMessage(
                            "Login successful! Welcome to Chishti Library.",
                            "success"
                        );


                        /*
                        ---------------------------------
                        REDIRECT
                        ---------------------------------
                        */

                        setTimeout(
                            function () {

                                window.location.href =
                                    "./books.html";

                            },
                            700
                        );


                    } catch (error) {

                        console.error(
                            "Login Error:",
                            error
                        );


                        let message =
                            "Login failed. Please try again.";


                        switch (
                            error.code
                        ) {

                            case
                                "auth/user-not-found":

                                message =
                                    "No account found with this email.";

                                break;


                            case
                                "auth/wrong-password":

                                message =
                                    "Incorrect password.";

                                break;


                            case
                                "auth/invalid-credential":

                                message =
                                    "Email or password is incorrect.";

                                break;


                            case
                                "auth/invalid-email":

                                message =
                                    "Please enter a valid email.";

                                break;


                            case
                                "auth/user-disabled":

                                message =
                                    "This account has been disabled.";

                                break;


                            case
                                "auth/too-many-requests":

                                message =
                                    "Too many attempts. Please try again later.";

                                break;

                        }


                        showMessage(
                            message
                        );


                    } finally {

                        setLoginLoading(
                            false
                        );

                    }

                }
            );

        }


        /*
        =================================================
        GOOGLE LOGIN
        =================================================
        */

        if (googleButton) {

            googleButton.addEventListener(
                "click",
                async function () {

                    hideMessage();


                    if (!window.auth) {

                        showMessage(
                            "Firebase Authentication is not ready."
                        );

                        return;

                    }


                    googleButton.disabled =
                        true;


                    googleButton.innerHTML = `
                        <i class="fa-solid fa-spinner fa-spin"></i>
                        Connecting...
                    `;


                    try {

                        const provider =
                            new firebase.auth.GoogleAuthProvider();


                        await window.auth
                            .signInWithPopup(
                                provider
                            );


                        showMessage(
                            "Google login successful!",
                            "success"
                        );


                        setTimeout(
                            function () {

                                window.location.href =
                                    "./books.html";

                            },
                            700
                        );


                    } catch (error) {

                        console.error(
                            "Google Login Error:",
                            error
                        );


                        let message =
                            "Google login failed.";


                        if (
                            error.code ===
                            "auth/popup-closed-by-user"
                        ) {

                            message =
                                "Google login was cancelled.";

                        }


                        if (
                            error.code ===
                            "auth/popup-blocked"
                        ) {

                            message =
                                "Your browser blocked the Google login popup.";

                        }


                        showMessage(
                            message
                        );


                    } finally {

                        googleButton.disabled =
                            false;

                        googleButton.innerHTML = `
                            <i class="fa-brands fa-google"></i>
                            <span>
                                Continue with Google
                            </span>
                        `;

                    }

                }
            );

        }


        /*
        =================================================
        FORGOT PASSWORD
        =================================================
        */

        if (forgotPassword) {

            forgotPassword.addEventListener(
                "click",
                async function () {

                    hideMessage();


                    const email =
                        emailInput.value.trim();


                    if (!email) {

                        showMessage(
                            "Enter your email first, then click Forgot Password."
                        );

                        emailInput.focus();

                        return;

                    }


                    if (!window.auth) {

                        showMessage(
                            "Firebase Authentication is not ready."
                        );

                        return;

                    }


                    try {

                        await window.auth
                            .sendPasswordResetEmail(
                                email
                            );


                        showMessage(
                            "Password reset email sent. Check your inbox.",
                            "success"
                        );


                    } catch (error) {

                        console.error(
                            "Password Reset Error:",
                            error
                        );


                        let message =
                            "Could not send password reset email.";


                        if (
                            error.code ===
                            "auth/user-not-found"
                        ) {

                            message =
                                "No account found with this email.";

                        }


                        if (
                            error.code ===
                            "auth/invalid-email"
                        ) {

                            message =
                                "Please enter a valid email.";

                        }


                        showMessage(
                            message
                        );

                    }

                }
            );

        }


        /*
        =================================================
        CREATE ACCOUNT
        =================================================
        */

        if (signupButton) {

            signupButton.addEventListener(
                "click",
                function () {

                    window.location.href =
                        "./signup.html";

                }
            );

        }


        /*
        =================================================
        CONTINUE AS GUEST
        =================================================
        */

        if (continueButton) {

            continueButton.addEventListener(
                "click",
                function () {

                    window.location.href =
                        "./books.html";

                }
            );

        }


        /*
        =================================================
        IF USER IS ALREADY LOGGED IN
        =================================================
        */

        window.addEventListener(
            "firebaseAuthChanged",
            function (event) {

                const user =
                    event.detail.user;


                if (user) {

                    console.log(
                        "Already logged in:",
                        user.email || user.uid
                    );

                }

            }
        );


        /*
        =================================================
        READY
        =================================================
        */

        console.log(
            "===================================="
        );

        console.log(
            "🔐 CHISHTI LIBRARY LOGIN"
        );

        console.log(
            "✅ Login system ready"
        );

        console.log(
            "✅ Google login ready"
        );

        console.log(
            "✅ Password reset ready"
        );

        console.log(
            "===================================="
        );

    }
);
