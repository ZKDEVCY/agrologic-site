const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");

const validUsername = "admin";
const validPassword = "greenhub123";

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (username === validUsername && password === validPassword) {
    sessionStorage.setItem("greenhubLoggedIn", "true");
    window.location.href = "greenhub/index.html";
  } else {
    errorMessage.textContent = "Incorrect username or password.";
  }
});
