const firebaseConfig = {
  apiKey: "AIzaSyCfABAhrpZs4_DRUDcFD2-12S6UBcTH8TQ",
  authDomain: "ffrewardhub.firebaseapp.com",
  projectId: "ffrewardhub",
  storageBucket: "ffrewardhub.firebasestorage.app",
  messagingSenderId: "785720442176",
  appId: "1:785720442176:web:667a54d10a7a1185b74ea5",
  measurementId: "G-W469VH5ZXQ"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

const loginDiv = document.getElementById("loginDiv");
const signupDiv = document.getElementById("signupDiv");
const authSection = document.getElementById("authSection");
const dashboard = document.getElementById("dashboard");
const totalBalance = document.getElementById("totalBalance");
const adsWatched = document.getElementById("adsWatched");
const refLink = document.getElementById("refLink");

let currentUser = null;

function showSignup() {
  loginDiv.classList.add("hidden");
  signupDiv.classList.remove("hidden");
}
function showLogin() {
  signupDiv.classList.add("hidden");
  loginDiv.classList.remove("hidden");
}

function signupUser() {
  const email = document.getElementById("signupEmail").value;
  const pass = document.getElementById("signupPassword").value;
  const name = document.getElementById("signupName").value;
  const game = document.getElementById("signupGame").value;

  auth.createUserWithEmailAndPassword(email, pass)
    .then((cred) => {
      db.ref("users/" + cred.user.uid).set({
        name: name,
        game: game,
        email: email,
        diamonds: 0,
        adsWatched: 0,
        lastCheckIn: ""
      });
      showDashboard(cred.user);
    })
    .catch(e => alert(e.message));
}

function loginUser() {
  const email = document.getElementById("loginEmail").value;
  const pass = document.getElementById("loginPassword").value;

  auth.signInWithEmailAndPassword(email, pass)
    .then((cred) => {
      showDashboard(cred.user);
    })
    .catch(e => alert(e.message));
}

function showDashboard(user) {
  currentUser = user;
  authSection.classList.add("hidden");
  dashboard.classList.remove("hidden");
  refLink.value = window.location.origin + "?ref=" + user.uid;
  db.ref("users/" + user.uid).on("value", snap => {
    const data = snap.val();
    if (data) {
      totalBalance.innerText = "Total Balance: " + data.diamonds + " Diamonds";
      adsWatched.innerText = "Ads Watched: " + data.adsWatched + "/10";
    }
  });
}

function claimDailyCheckIn() {
  const today = new Date().toISOString().split('T')[0];
  db.ref("users/" + currentUser.uid).once("value", snap => {
    const data = snap.val();
    if (data.lastCheckIn !== today) {
      const newDiamonds = data.diamonds + 3;
      db.ref("users/" + currentUser.uid).update({
        diamonds: newDiamonds,
        lastCheckIn: today
      });
      alert("3 Diamonds Claimed!");
    } else {
      alert("Already claimed today!");
    }
  });
}

function watchAd() {
  db.ref("users/" + currentUser.uid).once("value", snap => {
    const data = snap.val();
    if (data.adsWatched < 10) {
      window.open('https://www.profitableratecpm.com/v8p9te1b9c?key=521e9c2f1809cf28556f8c14261f81a7', '_blank');
      const newAds = data.adsWatched + 1;
      const newDiamonds = data.diamonds + 1;
      db.ref("users/" + currentUser.uid).update({
        adsWatched: newAds,
        diamonds: newDiamonds
      });
      alert("1 Diamond earned!");
    } else {
      alert("Max 10 ads per day!");
    }
  });
}

function copyReferral() {
  navigator.clipboard.writeText(refLink.value);
  alert("Referral link copied!");
}

function withdraw() {
  const uid = document.getElementById("withdrawUID").value;
  db.ref("users/" + currentUser.uid).once("value", snap => {
    const data = snap.val();
    if (data.diamonds >= 70) {
      alert("Withdraw requested for UID: " + uid);
    } else {
      alert("You need at least 70 Diamonds to withdraw.");
    }
  });
}```