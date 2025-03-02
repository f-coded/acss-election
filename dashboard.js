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
        const votesSnapshot = await getDocs(collection(db, "votes"));
        const votedUsers = new Set();
        votesSnapshot.forEach(doc => votedUsers.add(doc.id));

        let userRows = "";
        let count = 1;

        usersSnapshot.forEach((doc) => {
            const user = doc.data();
            const hasVoted = votedUsers.has(doc.id)
                ? `<span class="text-green-500 font-bold">Voted</span>`
                : `<span class="text-red-500 font-bold">Not Voted</span>`;
            if (votedUsers.has(doc.id)) totalVoted++;
            userRows += `
                <tr class="border-b">
                    <td class="p-2">${count++}</td>
                    <td class="p-2">${user.username || 'N/A'}</td>
                    <td class="p-2">${user.email}</td>
                    <td class="p-2">${hasVoted}</td>
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
                             <th class="p-2">Username</th>
                             <th class="p-2">Email</th>
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
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}

async function fetchVotes() {
    const totalVotesElem = document.getElementById("totalVotes");
    const totalCandidatesElem = document.getElementById("numCandidates");
    let totalVotes = 0;

    try {
        const votesSnapshot = await getDocs(collection(db, "votes"));
        totalVotes = votesSnapshot.size;

        totalVotesElem.innerText = totalVotes;
        totalCandidatesElem.innerText = 12; // Fixed number of candidates
    } catch (error) {
        console.error("Error fetching votes:", error);
    }
}
