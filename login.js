const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

const validUsername = "zacharias";
const validPassword = "greenhub";

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim().toLowerCase();
  const password = document.getElementById("password").value.trim();

  if (username === validUsername && password === validPassword) {
    localStorage.setItem("greenhubLoggedIn", "true");
    window.location.href = "greenhub/index.html";
  } else {
    loginMessage.textContent = "Incorrect username or password.";
  }
});
