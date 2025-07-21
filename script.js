import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, updateDoc, increment, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDBcPggJxq4yrPLoZwVwFNoA341b2BISkQ",
    authDomain: "reward-hub-4d851.firebaseapp.com",
    projectId: "reward-hub-4d851",
    storageBucket: "reward-hub-4d851.firebasestorage.app",
    messagingSenderId: "961561066999",
    appId: "1:961561066999:web:a5964e9a9ea04e46bbc2f2",
    measurementId: "G-BL5887T9J3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let currentUser = null;
let userData = {};

// --- Helper Functions ---
function showToast(message) {
    const toast = document.getElementById('toast-notification');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 2000);
}

// --- Event Listeners ---
function setupEventListeners() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = ['home-section', 'daily-section', 'spin-section', 'profile-section'];
    navButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => showSection(sections[index], btn));
    });

    document.getElementById('daily-reward-btn').addEventListener('click', claimDailyReward);
    document.getElementById('watch-ad-btn').addEventListener('click', watchAd);
    document.getElementById('withdraw-btn').addEventListener('click', sendWithdrawal);
    document.getElementById('spin-btn').addEventListener('click', handleSpin);
    document.getElementById('copy-ref-btn').addEventListener('click', copyReferralLink);
    document.getElementById('logout-btn').addEventListener('click', () => auth.signOut());
    
    document.getElementById('signup-btn').addEventListener('click', handleSignUp);
    document.getElementById('signin-btn').addEventListener('click', handleSignIn);
    document.getElementById('auth-switch-link').addEventListener('click', toggleAuthForms);
}

// --- Main Functions ---
function showSection(sectionId, element) { /* Same as before */ }

function updateUI(data) {
    const diamonds = data.diamonds || 0;
    const adsWatched = data.adsWatched || 0;
    const today = new Date().toLocaleDateString();

    // Home Section
    document.getElementById('wallet').innerText = `💎 ${diamonds}`;
    const progress = Math.min((diamonds / 70) * 100, 100);
    document.getElementById('withdrawal-progress').style.width = `${progress}%`;
    document.getElementById('progress-text').innerText = `${diamonds} / 70 Diamonds`;
    document.getElementById('withdraw-btn').disabled = diamonds < 70;

    // Daily Section
    const dailyClaimed = data.lastDailyClaim === today;
    document.getElementById('daily-reward-btn').disabled = dailyClaimed;
    document.getElementById('daily-reward-btn').innerText = dailyClaimed ? "Claimed Today" : `Claim ${getStreakBonus(data.streak || 0)}💎 Bonus`;
    document.getElementById('streak-info').innerText = `You are on a ${data.streak || 0} day streak! Keep it up.`;
    
    // Ads
    document.getElementById('ads-left').innerText = `You have watched ${adsWatched} of 5 ads today.`;
    document.getElementById('watch-ad-btn').parentElement.style.pointerEvents = (adsWatched >= 5) ? 'none' : 'auto';
    document.getElementById('watch-ad-btn').disabled = adsWatched >= 5;

    // Spin Wheel
    const spinClaimed = data.lastSpin === today;
    document.getElementById('spin-btn').disabled = spinClaimed;
    document.getElementById('spin-btn').innerText = spinClaimed ? "Already Spun Today" : "SPIN!";
}

function getStreakBonus(streak) {
    if (streak >= 7) return 15;
    if (streak >= 3) return 5;
    return 3;
}

async function claimDailyReward() {
    const today = new Date().toLocaleDateString();
    if (userData.lastDailyClaim === today) return showToast("You have already claimed this today.");

    const userRef = doc(db, "users", currentUser.uid);
    let streak = userData.streak || 0;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if(userData.lastDailyClaim === yesterday.toLocaleDateString()){
        streak++;
    } else {
        streak = 1; // Reset streak
    }

    const bonus = getStreakBonus(streak);
    await updateDoc(userRef, { 
        diamonds: increment(bonus), 
        lastDailyClaim: today,
        streak: streak
    });
    showToast(`Streak Bonus! You earned ${bonus} diamonds! 💎`);
}

async function watchAd() { /* Same as before */ }
async function sendWithdrawal() { /* Same as before */ }
function copyReferralLink() { /* Same as before */ }

// Spin Wheel Logic
const prizes = [50, 1, 10, 2, 20, 5, 15, 1]; // 8 sections
async function handleSpin() {
    const today = new Date().toLocaleDateString();
    if (userData.lastSpin === today) return showToast("You can only spin once a day.");
    
    document.getElementById('spin-btn').disabled = true;
    
    const wheel = document.getElementById('spin-wheel');
    const randomSpins = Math.floor(Math.random() * 5) + 5; // 5 to 9 full spins
    const prizeIndex = Math.floor(Math.random() * prizes.length);
    const stopAngle = (randomSpins * 360) + (prizeIndex * 45) + 22.5; // Center of the slice
    
    wheel.style.transform = `rotate(${stopAngle}deg)`;

    setTimeout(async () => {
        const prize = prizes[prizeIndex];
        showToast(`Congratulations! You won ${prize} diamonds!`);
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, {
            diamonds: increment(prize),
            lastSpin: today
        });
        document.getElementById('spin-btn').disabled = false;
    }, 4500); // Wait for animation to finish
}

// --- Authentication & Initialization ---
async function handleSignUp() { /* Same as before, but add streak: 0, lastDailyClaim: null, lastSpin: null */ }
async function handleSignIn() { /* Same as before */ }
function toggleAuthForms(e) { /* Same as before */ }

onAuthStateChanged(auth, (user) => { /* Same as before */ });
function initializeDashboard() { /* Same as before */ }

setupEventListeners();