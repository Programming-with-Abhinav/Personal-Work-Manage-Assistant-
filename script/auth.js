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
  // mode can be 'login', 'register', 'verify', 'reset'
  
  // Update nav buttons
  if (mode === "login" || mode === "register") {
    if (navBar) navBar.style.display = "flex";
    loginBtn.classList.toggle("active", mode === "login");
    registerBtn.classList.toggle("active", mode === "register");
  } else {
    if (navBar) navBar.style.display = "none";
  }

  // Toggle forms
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
registerForm?.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const pincode = document.getElementById("pincode").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!name || !email || !password || !pincode) {
    alert("Please fill all required fields (including Pincode).");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];
  const exists = users.find(user => user.email.toLowerCase() === email.toLowerCase());

  if (exists) {
    alert("Email already exists");
    return;
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    phone,
    pincode,
    password,
    avatar: "", // Keeping avatar field for backward compatibility
    createdAt: new Date().toLocaleString()
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify(newUser));

  window.location.href = "home.html";
});

// --- LOGIN LOGIC ---
loginForm?.addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

  if (!user) {
    alert("Invalid Login");
    return;
  }

  localStorage.setItem("currentUser", JSON.stringify(user));
  window.location.href = "home.html";
});

// --- VERIFY FORGOT PASSWORD LOGIC ---
verifyForm?.addEventListener("submit", function (e) {
  e.preventDefault();
  
  const email = document.getElementById("verifyEmail").value.trim();
  const pincode = document.getElementById("verifyPincode").value.trim();
  
  if (!email || !pincode) {
    alert("Please enter both Email and Pincode.");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && String(u.pincode) === pincode);
  
  if (!user) {
    alert("Verification failed. Incorrect email or pincode.");
    return;
  }
  
  // Match found! Proceed to reset form
  resetEmail = email.toLowerCase();
  showForm("reset");
});

// --- RESET PASSWORD LOGIC ---
resetPasswordForm?.addEventListener("submit", function (e) {
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
  
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const userIndex = users.findIndex(u => u.email.toLowerCase() === resetEmail);
  
  if (userIndex === -1) {
    alert("Error: User not found.");
    return;
  }
  
  // Update password
  users[userIndex].password = newPassword;
  localStorage.setItem("users", JSON.stringify(users));
  
  alert("Password updated successfully! Please login with your new password.");
  
  // Clear reset form fields
  document.getElementById("newPassword").value = "";
  document.getElementById("confirmNewPassword").value = "";
  document.getElementById("verifyEmail").value = "";
  document.getElementById("verifyPincode").value = "";
  
  showForm("login");
});