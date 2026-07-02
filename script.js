const chatButton = document.querySelector(".chat-button");
const chatPopup = document.getElementById("chatPopup");

if (chatButton && chatPopup) {
  chatButton.addEventListener("click", () => {
    chatPopup.classList.toggle("visible");
  });
}
