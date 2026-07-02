const isLoggedIn = localStorage.getItem("greenhubLoggedIn") === "true";
const logoutButton = document.getElementById("logoutButton");

if (!isLoggedIn) {
  window.location.href = "../login.html";
}

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("greenhubLoggedIn");
    window.location.href = "../login.html";
  });
}
