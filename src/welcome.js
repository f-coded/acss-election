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
    

    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            showToast("error", "Authentication Required", "Redirecting to signup page...");
            setTimeout(() => {
                window.location.href = "/signup";
            }, 2000);
            return;
        }
    
        const userEmail = user.email;
        const userRef = doc(db, "users", userEmail);
        const userSnap = await getDoc(userRef);
    
        console.log("User exists:", userSnap.exists());
        console.log("User data:", userSnap.data());
    
        if (!userSnap.exists() || !userSnap.data().username) {
            console.log("No username found, showing modal...");
            nameModal.style.display = "block";
            welcomeContent.style.display = "none";
            showToast("info", "Welcome!", "Please enter your name to continue.");
        } else {
            const storedName = userSnap.data().username;
            console.log("Stored Name:", storedName);
            welcomeContent.style.display = "block";
            nameModal.style.display = "none";
            welcomeUser.textContent = storedName;
            showToast("success", "Welcome Back!", `Hello, ${storedName}!`);
        }
      

        if (voteNowBtn) {
            voteNowBtn.style.display = "none";  
        }

            // Check if user has already voted
            if (voteNowBtn) {
                const voteRef = doc(db, "votes", userEmail);
                const voteSnap = await getDoc(voteRef);

                if (voteSnap.exists()) {
                    voteNowBtn.addEventListener("click", (event) => {
                        event.preventDefault(); // Prevent navigation
                        showToast("warning", "Already Voted!", "You have already voted. Wait for the results.");
                    });
                   
                    
                }
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
                await setDoc(doc(db, "users", userEmail), { 
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
    }, 5000); 
}
