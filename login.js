"use strict";

/*
|--------------------------------------------------------------------------
| CHISHTI LIBRARY LOGIN SYSTEM
|--------------------------------------------------------------------------
| Requires firebase.js to initialize:
| firebase
| firebase.auth()
| firebase.firestore()
|--------------------------------------------------------------------------
*/


document.addEventListener("DOMContentLoaded", function () {

    const loginForm =
        document.getElementById("loginForm");

    const emailInput =
        document.getElementById("email");

    const passwordInput =
        document.getElementById("password");

    const loginButton =
        document.getElementById("loginButton");

    const googleButton =
        document.getElementById("googleButton");

    const logoutButton =
        document.getElementById("logoutButton");

    const continueButton =
        document.getElementById("continueButton");

    const showPassword =
        document.getElementById("showPassword");

    const loginError =
        document.getElementById("loginError");

    const successMessage =
        document.getElementById("successMessage");

    const loginBox =
        document.getElementById("loginBox");

    const loggedInBox =
        document.getElementById("loggedInBox");

    const currentUserEmail =
        document.getElementById("currentUserEmail");

    const year =
        document.getElementById("year");


    if (year) {

        year.textContent =
            new Date().getFullYear();

    }


    /*
    |--------------------------------------------------------------------------
    | CHECK FIREBASE
    |--------------------------------------------------------------------------
    */

    if (
        typeof firebase === "undefined" ||
        !firebase.apps ||
        !firebase.apps.length
    ) {

        showError(
            "Firebase load nahi hua. firebase.js check karo."
        );

        return;

    }


    let auth;

    let db;


    try {

        auth =
            firebase.auth();

        db =
            firebase.firestore();

    } catch (error) {

        console.error(
            "Firebase error:",
            error
        );

        showError(
            "Firebase initialize nahi hua."
        );

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | ERROR MESSAGE
    |--------------------------------------------------------------------------
    */

    function showError(message) {

        if (!loginError) return;

        loginError.textContent =
            message;

        loginError.style.display =
            "block";

    }


    function hideError() {

        if (!loginError) return;

        loginError.textContent =
            "";

        loginError.style.display =
            "none";

    }


    /*
    |--------------------------------------------------------------------------
    | SUCCESS
    |--------------------------------------------------------------------------
    */

    function showSuccess(message) {

        if (!successMessage) return;

        const span =
            successMessage.querySelector("span");

        if (span) {

            span.textContent =
                message;

        }

        successMessage.style.display =
            "flex";

    }


    /*
    |--------------------------------------------------------------------------
    | LOADING
    |--------------------------------------------------------------------------
    */

    function setLoading(loading) {

        if (loginButton) {

            loginButton.disabled =
                loading;

            loginButton.innerHTML =
                loading

                    ? '<i class="fas fa-spinner fa-spin"></i> Logging in...'

                    : '<i class="fas fa-right-to-bracket"></i> <span>Login</span>';

        }


        if (googleButton) {

            googleButton.disabled =
                loading;

        }

    }


    /*
    |--------------------------------------------------------------------------
    | CREATE / UPDATE USER PROFILE
    |--------------------------------------------------------------------------
    */

    async function saveUserProfile(user) {

        if (!user || !db) {
            return;
        }


        const userRef =
            db
                .collection("users")
                .doc(user.uid);


        const data = {

            uid: user.uid,

            email:
                user.email || "",

            displayName:
                user.displayName ||
                "",

            photoURL:
                user.photoURL ||
                "",

            lastLogin:
                firebase.firestore.FieldValue.serverTimestamp()

        };


        try {

            const snapshot =
                await userRef.get();


            if (!snapshot.exists) {

                data.createdAt =
                    firebase.firestore.FieldValue
                        .serverTimestamp();

                data.likes =
                    0;

                data.comments =
                    0;

                data.shares =
                    0;

                data.views =
                    0;

            }


            await userRef.set(
                data,
                {
                    merge: true
                }
            );


        } catch (error) {

            /*
             * Profile save failure should not
             * prevent successful login.
             */

            console.warn(
                "User profile save error:",
                error
            );

        }

    }


    /*
    |--------------------------------------------------------------------------
    | SHOW LOGGED-IN USER
    |--------------------------------------------------------------------------
    */

    function showLoggedInUser(user) {

        if (!user) {
            return;
        }


        if (loginBox) {

            loginBox.style.display =
                "none";

        }


        if (loggedInBox) {

            loggedInBox.style.display =
                "block";

        }


        if (currentUserEmail) {

            currentUserEmail.textContent =
                user.email ||
                user.displayName ||
                "Logged in user";

        }

    }


    /*
    |--------------------------------------------------------------------------
    | SHOW LOGIN FORM
    |--------------------------------------------------------------------------
    */

    function showLoginForm() {

        if (loginBox) {

            loginBox.style.display =
                "block";

        }


        if (loggedInBox) {

            loggedInBox.style.display =
                "none";

        }

    }


    /*
    |--------------------------------------------------------------------------
    | EMAIL LOGIN
    |--------------------------------------------------------------------------
    */

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                hideError();

                const email =
                    emailInput
                        ? emailInput.value.trim()
                        : "";

                const password =
                    passwordInput
                        ? passwordInput.value
                        : "";


                if (!email || !password) {

                    showError(
                        "Email aur password dono enter karo."
                    );

                    return;

                }


                setLoading(true);


                try {

                    const result =
                        await auth.signInWithEmailAndPassword(
                            email,
                            password
                        );


                    await saveUserProfile(
                        result.user
                    );


                    showSuccess(
                        "Login successful!"
                    );


                    setTimeout(
                        function () {

                            window.location.href =
                                "./index.html";

                        },
                        800
                    );


                } catch (error) {

                    console.error(
                        "Email login error:",
                        error
                    );


                    let message =
                        "Login failed. Email ya password check karo.";


                    switch (error.code) {

                        case "auth/invalid-email":

                            message =
                                "Email address valid nahi hai.";

                            break;


                        case "auth/user-not-found":

                            message =
                                "Is email ka account nahi mila.";

                            break;


                        case "auth/wrong-password":

                            message =
                                "Password incorrect hai.";

                            break;


                        case "auth/invalid-credential":

                            message =
                                "Email ya password incorrect hai.";

                            break;


                        case "auth/user-disabled":

                            message =
                                "Ye account disabled hai.";

                            break;


                        case "auth/too-many-requests":

                            message =
                                "Bohat zyada login attempts. Thori dair baad try karo.";

                            break;

                    }


                    showError(message);

                } finally {

                    setLoading(false);

                }

            }
        );

    }


    /*
    |--------------------------------------------------------------------------
    | GOOGLE LOGIN
    |--------------------------------------------------------------------------
    */

    if (googleButton) {

        googleButton.addEventListener(
            "click",
            async function () {

                hideError();

                setLoading(true);


                try {

                    const provider =
                        new firebase.auth.GoogleAuthProvider();


                    provider.setCustomParameters({

                        prompt: "select_account"

                    });


                    const result =
                        await auth.signInWithPopup(
                            provider
                        );


                    await saveUserProfile(
                        result.user
                    );


                    showSuccess(
                        "Google login successful!"
                    );


                    setTimeout(
                        function () {

                            window.location.href =
                                "./index.html";

                        },
                        800
                    );


                } catch (error) {

                    console.error(
                        "Google login error:",
                        error
                    );


                    if (
                        error.code ===
                        "auth/popup-closed-by-user"
                    ) {

                        showError(
                            "Google login cancel kar diya gaya."
                        );

                    } else {

                        showError(
                            "Google login failed."
                        );

                    }

                } finally {

                    setLoading(false);

                }

            }
        );

    }


    /*
    |--------------------------------------------------------------------------
    | LOGOUT
    |--------------------------------------------------------------------------
    */

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            async function () {

                try {

                    await auth.signOut();

                    showLoginForm();

                    hideError();

                    if (emailInput) {

                        emailInput.value =
                            "";

                    }

                    if (passwordInput) {

                        passwordInput.value =
                            "";

                    }


                } catch (error) {

                    console.error(
                        "Logout error:",
                        error
                    );

                    showError(
                        "Logout nahi ho saka."
                    );

                }

            }
        );

    }


    /*
    |--------------------------------------------------------------------------
    | CONTINUE TO LIBRARY
    |--------------------------------------------------------------------------
    */

    if (continueButton) {

        continueButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "./index.html";

            }
        );

    }


    /*
    |--------------------------------------------------------------------------
    | PASSWORD VISIBILITY
    |--------------------------------------------------------------------------
    */

    if (showPassword && passwordInput) {

        showPassword.addEventListener(
            "click",
            function () {

                const hidden =
                    passwordInput.type ===
                    "password";


                passwordInput.type =
                    hidden
                        ? "text"
                        : "password";


                this.innerHTML =
                    hidden

                        ? '<i class="fas fa-eye-slash"></i>'

                        : '<i class="fas fa-eye"></i>';

            }
        );

    }


    /*
    |--------------------------------------------------------------------------
    | AUTH STATE
    |--------------------------------------------------------------------------
    */

    auth.onAuthStateChanged(
        async function (user) {

            console.log(
                "Auth state:",
                user
                    ? user.email
                    : "Guest"
            );


            if (user) {

                await saveUserProfile(
                    user
                );


                /*
                 * Agar already logged in hai,
                 * login form ki jagah user box show hoga.
                 */

                showLoggedInUser(
                    user
                );

            } else {

                showLoginForm();

            }

        }
    );


});
