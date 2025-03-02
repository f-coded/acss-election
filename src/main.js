// Import Firebase Authentication
import { auth, provider, signInWithPopup } from "./firebase.js";

// Google Sign-In Function
const googleSignIn = document.getElementById("googleSignIn");

if (googleSignIn) {
  googleSignIn.addEventListener("click", () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        localStorage.setItem("userName", user.displayName);
        window.location.href = "/welcome"; // Redirect to welcome page
      })
      .catch((error) => {
        console.error("Error during sign-in:", error.message);
        showToast("Failed to sign in. Please try again.", "error");
      });
  });
}

// Toast Notification Function
function showToast(type, title, text) {
  const icons = {
      success: "fa-solid fa-check-circle",
      error: "fa-solid fa-times-circle",
      warning: "fa-solid fa-exclamation-triangle",
      info: "fa-solid fa-info-circle"
  };

  const notificationsContainer = document.querySelector(".notifications");
  if (!notificationsContainer) return;

  let toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
      <i class="${icons[type]}"></i>
      <div class="content">
          <div class="title">${title}</div>
          <span>${text}</span>
      </div>
      <i class="fa-solid fa-xmark" onclick="this.parentElement.remove()"></i>
  `;

  notificationsContainer.appendChild(toast);

  setTimeout(() => {
      toast.remove();
  }, 9000); 
}

