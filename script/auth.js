const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const forgotPasswordLink = document.getElementById("forgotPasswordLink");
const goToRegister = document.getElementById("goToRegister");
const goToLogin = document.getElementById("goToLogin");

const showLoginPassword = document.getElementById("showLoginPassword");
const showRegisterPassword = document.getElementById("showRegisterPassword");
const profileImageInput = document.getElementById("profileImage");
const avatarPreview = document.getElementById("avatarPreview");
const removeAvatarBtn = document.getElementById("removeAvatarBtn");

function showForm(mode) {
  const isLogin = mode === "login";

  loginBtn.classList.toggle("active", isLogin);
  registerBtn.classList.toggle("active", !isLogin);

  loginForm.classList.toggle("hidden", !isLogin);
  registerForm.classList.toggle("hidden", isLogin);
}

loginBtn.addEventListener("click", () => {
  setHeaderPosition();
  showForm("login");
});

registerBtn.addEventListener("click", () => {
  setHeaderPosition();
  showForm("register");
});

goToRegister?.addEventListener("click", () => {
  setHeaderPosition();
  showForm("register");
});

goToLogin?.addEventListener("click", () => {
  setHeaderPosition();
  showForm("login");
});

showLoginPassword?.addEventListener("change", () => {
  const passwordField = document.getElementById("loginPassword");
  passwordField.type = showLoginPassword.checked ? "text" : "password";
});

showRegisterPassword?.addEventListener("change", () => {
  const passwordField = document.getElementById("password");
  const confirmField = document.getElementById("confirmPassword");
  passwordField.type = showRegisterPassword.checked ? "text" : "password";
  confirmField.type = showRegisterPassword.checked ? "text" : "password";
});

forgotPasswordLink?.addEventListener("click", (e) => {
  e.preventDefault();

  const email = prompt("Enter your email address:");
  if (!email) return;

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(
    (u) => u.email.trim().toLowerCase() === email.trim().toLowerCase()
  );

  if (!user) {
    alert("No account found with this email.");
    return;
  }

  const newPassword = prompt("Enter your new password:");
  if (!newPassword || newPassword.length < 4) {
    alert("Password must be at least 4 characters.");
    return;
  }

  user.password = newPassword;
  localStorage.setItem("users", JSON.stringify(users));
  alert("Password updated successfully. Please login with your new password.");
  showForm("login");
});

showForm("login");

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function setAvatarPreview(file) {
  if (!file) {
    avatarPreview.src = "assets/ID-photo.png";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    avatarPreview.src = reader.result;
  };
  reader.readAsDataURL(file);
}

profileImageInput?.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  setAvatarPreview(file);
});

removeAvatarBtn?.addEventListener("click", () => {
  profileImageInput.value = "";
  avatarPreview.src = "assets/ID-photo.png";
});

registerForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!name || !email || !password) {
    alert("Please fill all required fields.");
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

  let avatar = "";
  if (profileImageInput?.files?.length) {
    try {
      avatar = await fileToDataUrl(profileImageInput.files[0]);
    } catch (error) {
      alert("Could not read the selected image.");
      return;
    }
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    phone,
    password,
    avatar,
    createdAt: new Date().toLocaleString()
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify(newUser));

  window.location.href = "home.html";
});

loginForm.addEventListener("submit", function (e) {
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

function setHeaderPosition() {
  const header = document.querySelector("header");
  if (header) {
    header.style.position = "absolute";
    header.style.top = "18px";
    header.style.left = "30px";
  }
}