import { getFirestore, collection, getDocs } from "firebase/firestore";
import { initializeApp } from "firebase/app";


const firebaseConfig = {
    apiKey: "AIzaSyC0aP9-G9w-SsVeBIyOxxZEqMIqtHkTg9I",
    authDomain: "acss-election.firebaseapp.com",
    projectId: "acss-election",
    storageBucket: "acss-election.firebasestorage.app",
    messagingSenderId: "409244734597",
    appId: "1:409244734597:web:aae0c4bcb3043cc64545ec"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", async () => {
    await fetchUsers();
    await fetchVotes();
});

async function fetchUsers() {
    const usersTable = document.getElementById("user-list");
    const totalUsersElem = document.getElementById("totalUsers");
    let totalVoted = 0;

    try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        let userRows = "";
        let count = 1;

        usersSnapshot.forEach((doc) => {
            const user = doc.data();
            if (user.voted) totalVoted++;
            userRows += `
                <tr class="border-b">
                    <td class="p-2">${count++}</td>
                    <td class="p-2">${user.email}</td>
                    <td class="p-2">${user.username || 'N/A'}</td>
                    <td class="p-2 text-green-500 font-bold">Voted</td>
                </tr>
            `;
        });

        usersTable.innerHTML = `
            <div class="bg-white p-4 rounded-lg shadow overflow-x-auto">
                <h2 class="text-lg font-bold mb-2">User lists</h2>
                <table class="w-full text-left text-sm">
                    <thead>
                        <tr class="border-b">
                            <th class="p-2">#</th>
                            <th class="p-2">Email</th>
                            <th class="p-2">Username</th>
                            <th class="p-2">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${userRows}
                    </tbody>
                </table>
            </div>
        `;
        totalUsersElem.innerText = usersSnapshot.size;
        document.getElementById("totalVoted").innerText = totalVoted;
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}











// async function fetchVotes() {
//     const totalVotesElem = document.getElementById("totalVotes");
//     const totalCandidatesElem = document.getElementById("totalCandidates");
//     let votesData = [];
//     let candidates = new Set();

//     try {
//         const querySnapshot = await getDocs(collection(db, "votes"));
//         querySnapshot.forEach(doc => {
//             const vote = doc.data();
//             votesData.push(vote);
//             candidates.add(vote.candidate);
//         });
//         totalVotesElem.innerText = votesData.length;
//         totalCandidatesElem.innerText = candidates.size;
//     } catch (error) {
//         console.error("Error fetching votaes:", error);
//     }
// }

// const positionSelect = document.getElementById("position");
// const canvas = document.getElementById("voteChart");
// const ctx = canvas.getContext("2d");
// let voteChart = null;  // Store chart instance

async function updateChart(position) {
    try {
        const votesSnapshot = await getDocs(collection(db, "votes"));
        let voteCounts = {};
        let candidates = new Set();

        votesSnapshot.forEach(doc => {
            const vote = doc.data();
            if (vote.position === position) {
                if (!voteCounts[vote.candidate]) {
                    voteCounts[vote.candidate] = 0;
                }
                voteCounts[vote.candidate]++;
                candidates.add(vote.candidate);
            }
        });

        const labels = Array.from(candidates);
        const data = labels.map(candidate => voteCounts[candidate] || 0);

        console.log("Chart Data:", { labels, data });

        

        voteChart = new Chart(ctx, {
            type: "pie",
            data: {
                labels,
                datasets: [{
                    label: "Votes",
                    data,
                    backgroundColor: ["#3b82f6", "#60a5fa", "#f87171", "#34d399", "#facc15", "#a855f7"]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

    } catch (error) {
        console.error("Error updating chart:", error);
    }
}

// Load chart when position changes
positionSelect.addEventListener("change", () => updateChart(positionSelect.value));

// Initialize with first position
document.addEventListener("DOMContentLoaded", () => {
    if (positionSelect.value) {
        updateChart(positionSelect.value);
    }
});

