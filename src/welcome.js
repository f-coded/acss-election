// Import Firebase Firestore
import { auth } from "./firebase.js";  
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// Initialize Firestore
const db = getFirestore();

// Elements
window.addEventListener("DOMContentLoaded", () => {
    const userNameInput = document.getElementById("userNameInput"); // Input field
    const nameModal = document.getElementById("nameModal");
    const confirmNameBtn = document.getElementById("confirmName");
    const welcomeContent = document.getElementById("welcomeContent");
    const welcomeUser = document.getElementById("userName");
    const voteNowBtn = document.querySelector(".btn.primary"); // Vote Now button
    const resultsBtn = document.querySelector(".btn.secondary"); // Result Button

    // Check Authentication Status
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const userEmail = user.email; // Use email as identifier

            // Check Firestore for stored username
            const userRef = doc(db, "newusers", userEmail);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const storedName = userSnap.data().username;

                if (storedName) {
                    // Show the welcome page with stored username
                    welcomeContent.style.display = "block";
                    nameModal.style.display = "none";
                    welcomeUser.textContent = storedName;
                    showToast("success", "Welcome Back!", `Hello, ${storedName}!`);
                }
            } else {
                // If no username is found in Firestore, show the popup for first-time users
                nameModal.style.display = "block";
                welcomeContent.style.display = "none";
                showToast("info", "Welcome!", "Please enter your name to continue.");
            }

            // Check if user has already voted
            const voteRef = doc(db, "newvotes", userEmail);
            const voteSnap = await getDoc(voteRef);

            if (voteSnap.exists()) {
                // User has already voted
                if (voteNowBtn) {
                    voteNowBtn.addEventListener("click", (event) => {
                        event.preventDefault(); // Prevent navigation
                        showToast("warning", "Already Voted!", "You have already voted. Wait for the results.");
                    });
                }

                // Enable results button since the user has voted
                if (resultsBtn) {
                    resultsBtn.disabled = false;
                }
            } else {
                // User has NOT voted
                if (resultsBtn) {
                    resultsBtn.disabled = true;
                    resultsBtn.addEventListener("click", (event) => {
                        event.preventDefault(); // Prevent navigation
                        showToast("warning", "Access Denied", "You need to vote first before checking results.");
                    });
                }
            }
        } else {
            showToast("error", "Authentication Required", "Redirecting to signup page...");
            setTimeout(() => {
                window.location.href = "/signup";
            }, 2000);
        }
    });

    // Save Username
    confirmNameBtn.addEventListener("click", async () => {
        const newUserName = userNameInput.value.trim();
        if (newUserName) {
            const user = auth.currentUser;
            if (user) {
                const userEmail = user.email;

                // Save to Firebase
                await setDoc(doc(db, "newusers", userEmail), { 
                    username: newUserName,
                    email: userEmail // Store email for reference
                });

                showToast("success", "Success!", "Name saved successfully!");

                // Update UI
                welcomeUser.textContent = newUserName;
                nameModal.style.display = "none";
                welcomeContent.style.display = "block";
            }
        } else {
            showToast("warning", "Missing Name", "Please enter your name to continue.");
        }
    });
});

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
