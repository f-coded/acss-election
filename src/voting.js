import { auth } from "./firebase.js";  
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

// Initialize Firestore
const db = getFirestore();

document.addEventListener("DOMContentLoaded", () => {
    const userNameInput = document.getElementById("userNameInput"); 
    const nameModal = document.getElementById("nameModal");
    const confirmNameBtn = document.getElementById("confirmName");
    const welcomeContent = document.getElementById("welcomeContent");
    const welcomeUser = document.getElementById("userName");
    const submitVotesBtn = document.getElementById("submitVotes");

    // Check Authentication Status
    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = "/signup";
            return;
        }

        const userEmail = user.email;
        const userRef = doc(db, "users", userEmail); // Reference the user's document
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().username) {
            welcomeUser.textContent = userSnap.data().username;
            welcomeContent.style.display = "block";
            nameModal.style.display = "none";
        } else {
            nameModal.style.display = "block";
            welcomeContent.style.display = "none";
        }

        // Check if user has already voted
        const voteRef = doc(db, "votes", userEmail); // "votes" should be its own collection
        const voteSnap = await getDoc(voteRef);

        if (voteSnap.exists()) {
            showToast("error", "Already Voted!", "You have already submitted your vote.");
            window.location.href = "/welcome";
        }
    });


    // Save Username
    confirmNameBtn.addEventListener("click", async () => {
        const newUserName = userNameInput.value.trim();
        if (!newUserName) {
            showToast("warning", "Missing Name", "Please enter your name to continue.");
            return;
        }

        const user = auth.currentUser;
        if (user) {
            const userEmail = user.email;
            try {
                await setDoc(doc(db, "users", userEmail), { 
                    username: newUserName,
                    email: userEmail
                });

                // Update UI
                welcomeUser.textContent = newUserName;
                nameModal.style.display = "none";
                welcomeContent.style.display = "block";
                showToast("success", "Success!", "Your name has been saved.");
            } catch (error) {
                console.error("Error saving name:", error);
                showToast("error", "Error", "Failed to save name. Please try again.");
            }
        }
    });

    // Handle Vote Submission
    submitVotesBtn.addEventListener("click", submitVotes);
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
    }, 10000); 
}

// Function to handle vote submission
async function submitVotes() {
    const user = auth.currentUser;
    if (!user) {
        showToast("error", "Unauthorized", "You must be logged in to vote.");
        return;
    }

    const userEmail = user.email;
    const userRef = doc(db, "users", userEmail);
    const userSnap = await getDoc(userRef);
    const userName = userSnap.exists() ? userSnap.data().username : "Unknown";

    const ballots = document.querySelectorAll(".ballot-container");
    const selectedVotes = {};
    let unfilledPositions = [];

    ballots.forEach((ballot) => {
        const position = ballot.id;
        const selectedCandidate = ballot.querySelector("input[type='radio']:checked");

        if (selectedCandidate) {
            const candidateLabel = selectedCandidate.nextElementSibling;
            const candidateName = candidateLabel.querySelector("strong").innerText.trim();
            selectedVotes[position] = candidateName;
        } else {
            unfilledPositions.push(position);
        }
    });

    if (Object.keys(selectedVotes).length === 0) {
        showToast("warning", "Incomplete", "Please select candidates for all positions.");
        return;
    }

    if (unfilledPositions.length > 0) {
        showToast("info", "You must select a candidate for:", ` ${unfilledPositions.join(', ')}`);
        return;
    }

    try {
        await setDoc(doc(db, "votes", userEmail), {
            email: userEmail,
            username: userName,
            votes: selectedVotes,
            timestamp: serverTimestamp()
        });

        showToast("success", "Vote Submitted!", "Your vote has been successfully submitted.");
        setTimeout(() => {
            window.location.href = '/welcome';
        }, 2000);
    } catch (error) {
        console.error("Error submitting vote:", error);
        showToast("error", "Submission Failed", "Failed to submit vote. Please try again.");
    }
}
