/**
 * Amica - Authentication and Recovery Controller
 * Connects frontend forms to the backend Express server endpoints
 */

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const navBar = document.getElementById("navBar");

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const verifyForm = document.getElementById("verifyForm");
  const resetPasswordForm = document.getElementById("resetPasswordForm");

  const forgotPasswordLink = document.getElementById("forgotPasswordLink");
  const goToRegister = document.getElementById("goToRegister");
  const goToLogin = document.getElementById("goToLogin");
  const backToLoginFromVerify = document.getElementById("backToLoginFromVerify");
  const cancelReset = document.getElementById("cancelReset");

  const showLoginPassword = document.getElementById("showLoginPassword");
  const showRegisterPassword = document.getElementById("showRegisterPassword");
  const showResetPassword = document.getElementById("showResetPassword");

  let resetEmail = ""; // To store the email for resetting password

  function showForm(mode) {
    // Toggle nav bar visibility
    if (mode === "login" || mode === "register") {
      if (navBar) navBar.style.display = "flex";
      loginBtn.classList.toggle("active", mode === "login");
      registerBtn.classList.toggle("active", mode === "register");
    } else {
      if (navBar) navBar.style.display = "none";
    }

    // Toggle forms visibility
    loginForm.classList.toggle("hidden", mode !== "login");
    registerForm.classList.toggle("hidden", mode !== "register");
    if (verifyForm) verifyForm.classList.toggle("hidden", mode !== "verify");
    if (resetPasswordForm) resetPasswordForm.classList.toggle("hidden", mode !== "reset");
  }

  loginBtn.addEventListener("click", () => showForm("login"));
  registerBtn.addEventListener("click", () => showForm("register"));
  goToRegister?.addEventListener("click", () => showForm("register"));
  goToLogin?.addEventListener("click", () => showForm("login"));
  forgotPasswordLink?.addEventListener("click", () => showForm("verify"));
  backToLoginFromVerify?.addEventListener("click", () => showForm("login"));
  cancelReset?.addEventListener("click", () => showForm("login"));

  showLoginPassword?.addEventListener("change", () => {
    const passwordField = document.getElementById("loginPassword");
    if (passwordField) passwordField.type = showLoginPassword.checked ? "text" : "password";
  });

  showRegisterPassword?.addEventListener("change", () => {
    const passwordField = document.getElementById("password");
    const confirmField = document.getElementById("confirmPassword");
    if (passwordField) passwordField.type = showRegisterPassword.checked ? "text" : "password";
    if (confirmField) confirmField.type = showRegisterPassword.checked ? "text" : "password";
  });

  showResetPassword?.addEventListener("change", () => {
    const passwordField = document.getElementById("newPassword");
    const confirmField = document.getElementById("confirmNewPassword");
    if (passwordField) passwordField.type = showResetPassword.checked ? "text" : "password";
    if (confirmField) confirmField.type = showResetPassword.checked ? "text" : "password";
  });

  // Initialize to login form
  showForm("login");

  // --- REGISTRATION LOGIC ---
  registerForm?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const pincode = document.getElementById("pincode").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!username || !email || !password || !pincode) {
      alert("Please fill all required fields (including Recovery Pincode).");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, phone, pincode })
      });
      
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Registration failed");
        return;
      }

      // Log the registered user in immediately by setting currentUser session
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      
      const loginData = await loginRes.json();
      if (loginRes.ok) {
        localStorage.setItem("currentUser", JSON.stringify(loginData.user));
        window.location.href = "home.html";
      } else {
        alert("Registration succeeded, please log in manually.");
        showForm("login");
      }
    } catch (err) {
      console.error(err);
      alert("Network error occurred during registration.");
    }
  });

  // --- LOGIN LOGIC ---
  loginForm?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Invalid Credentials");
        return;
      }

      localStorage.setItem("currentUser", JSON.stringify(data.user));
      window.location.href = "home.html";
    } catch (err) {
      console.error(err);
      alert("Network error occurred during login.");
    }
  });

  // --- VERIFY FORGOT PASSWORD LOGIC ---
  verifyForm?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("verifyEmail").value.trim();
    const pincode = document.getElementById("verifyPincode").value.trim();

    if (!email || !pincode) {
      alert("Please enter both Email and Pincode.");
      return;
    }

    try {
      const res = await fetch("/api/auth/verify-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pincode })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Verification failed");
        return;
      }

      // Match found! Proceed to reset form
      resetEmail = email;
      showForm("reset");
    } catch (err) {
      console.error(err);
      alert("Network error during identity verification.");
    }
  });

  // --- RESET PASSWORD LOGIC ---
  resetPasswordForm?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const newPassword = document.getElementById("newPassword").value;
    const confirmNewPassword = document.getElementById("confirmNewPassword").value;

    if (!newPassword || newPassword.length < 4) {
      alert("Password must be at least 4 characters.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      alert("New passwords do not match.");
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, newPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Password reset failed");
        return;
      }

      alert("Password updated successfully! Please login with your new password.");

      // Clear reset form fields
      document.getElementById("newPassword").value = "";
      document.getElementById("confirmNewPassword").value = "";
      document.getElementById("verifyEmail").value = "";
      document.getElementById("verifyPincode").value = "";

      showForm("login");
    } catch (err) {
      console.error(err);
      alert("Network error while resetting password.");
    }
  });
});
