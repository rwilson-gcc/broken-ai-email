// --- EMAIL DATA -------------------------------------------------------------

const emails = [
{
title: "001 – Meeting Invite",
body: `From: alice@college.ac.uk
To: you@college.ac.uk
Subject: Team meeting Wednesday 10:00

Hi team,
Quick stand-up in Room 2.12 on Wednesday at 10:00.`
},
{
title: "002 – PayPal Security",
body: `From: security@paypa1.com
Subject: Urgent: verify your account now

Click here: http://accounts-paypal.com.login.evil.tld/verify`
},
{
title: "003 – PayPal Receipt",
body: `From: noreply@paypal.com.evil.co
Subject: Your receipt

If this wasn't you, reset your password.`
},
{
title: "004 – Newsletter",
body: `From: updates@news.trustedvendor.com
Newsletter March`
},
{
title: "005 – IT Password Reset",
body: `From: it-support@college.ac.uk
Password reset notice`
},
{
title: "006 – Shipping Invoice",
body: `From: billing@shipfast.co
Invoice overdue`
},
];

// Ground truth classification
const correctLabels = ["ham", "phish", "phish", "ham", "ham", "ham"];

// --- ELEMENTS --------------------------------------------------------------

const emailTitle = document.getElementById("email-title");
const emailBody = document.getElementById("email-body");
const progressFill = document.getElementById("progress-fill");
const configEditor = document.getElementById("config-editor");
const runBtn = document.getElementById("run-btn");
const resultBox = document.getElementById("result-box");
const meterFill = document.getElementById("meter-fill");
const flagBox = document.getElementById("flag");

// --- INITIAL CONFIG --------------------------------------------------------

const brokenConfig = `
threshold: 9
allowlist:
  - college.ac.uk
  - news.trustedvendor.com
  - paypa1.com
regex_allow: ".*paypal\\.com"
`;

configEditor.value = brokenConfig;

// --- RENDER EMAIL ----------------------------------------------------------

let index = 0;
function renderEmail() {
    const e = emails[index];
    emailTitle.textContent = e.title;
    emailBody.textContent = e.body;
    progressFill.style.width = `${((index+1)/emails.length)*100}%`;
}
renderEmail();

// --- CLASSIFIER ------------------------------------------------------------

function classifyEmail(email, config) {
    const from = email.body.match(/From:\s*(.*)/i);
    const sender = from ? from[1].toLowerCase() : "";

    // Extract config values (simple parsing)
    const threshold = config.includes("threshold: 6") ? 6 : 9;
    const allowlistBad = config.includes("paypa1.com");
    const regexFixed = config.includes("^paypal");

    // Start score
    let score = 0;

    // Suspicious words
    if (email.body.toLowerCase().includes("verify") ||
        email.body.toLowerCase().includes("urgent") ||
        email.body.toLowerCase().includes("invoice")) {
        score += 4;
    }

    // SPF/Domain scammy
    if (sender.includes("evil")) score += 6;

    // Allowlist overrides score (this is the bug!)
    if (allowlistBad && sender.includes("paypa1.com")) {
        score = 0;
    }

    if (!regexFixed && sender.includes("paypal.com.evil")) {
        score = 0;
    }

    return score >= threshold ? "phish" : "ham";
}

// --- RUN AI ---------------------------------------------------------------

runBtn.addEventListener("click", () => {
    resultBox.innerHTML = "";
    flagBox.classList.add("hidden");

    const config = configEditor.value;
    let wrong = 0;

    // Animate AI confidence meter
    meterFill.style.width = "20%";
    meterFill.style.background = "#ff9800";

    setTimeout(() => {
        meterFill.style.width = "80%";
        meterFill.style.background = "#4caf50";
    }, 600);

    setTimeout(() => {
        let output = "<b>AI Output:</b><br><br>";

        emails.forEach((email, i) => {
            const pred = classifyEmail(email, config);
            const correct = correctLabels[i];

            if (pred !== correct) wrong++;

            output += `${email.title}: <b>${pred}</b> `;
            output += pred === correct ? "✅<br>" : "❌<br>";
        });

        resultBox.innerHTML = output;

        if (wrong === 0) {
            flagBox.classList.remove("hidden");
        }

    }, 800);
});
