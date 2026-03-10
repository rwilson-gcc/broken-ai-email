(() => {
  'use strict';

  // -------------------------
  // Data (6 simple emails)
  // -------------------------
  const emails = [
    { t: "001 - Meeting Invite", b:
`From: alice@college.ac.uk
Subject: Team meeting Wednesday 10:00

Hi team,
Quick stand-up in Room 2.12 on Wednesday at 10:00.` },

    { t: "002 - PayPal Security", b:
`From: security@paypa1.com
Subject: Urgent: verify your account now

Click here: http://accounts-paypal.com.login.evil.tld/verify` },

    { t: "003 - PayPal Receipt", b:
`From: noreply@paypal.com.evil.co
Subject: Your receipt

If this wasn't you, reset your password.` },

    { t: "004 - Newsletter", b:
`From: updates@news.trustedvendor.com
Subject: Newsletter March

This month: campus events, workshops, and more.` },

    { t: "005 - IT Password Reset", b:
`From: it-support@college.ac.uk
Subject: Password reset notice

You requested a password reset in the self-service portal.` },

    { t: "006 - Shipping Invoice", b:
`From: billing@shipfast.co
Subject: Invoice overdue: action required

Your invoice is overdue.` }
  ];

  // Ground truth labels
  const correct = ["ham", "phish", "phish", "ham", "ham", "ham"];

  // -------------------------
  // DOM elements
  // -------------------------
  const titleEl = document.getElementById('email-title');
  const bodyEl  = document.getElementById('email-body');
  const cfgEl   = document.getElementById('config');
  const runBtn  = document.getElementById('run');
  const outEl   = document.getElementById('out');
  const flagEl  = document.getElementById('flag');

  // Guard: if any element missing, fail loudly
  if (!titleEl || !bodyEl || !cfgEl || !runBtn || !outEl || !flagEl) {
    console.error("Missing one or more required elements: #email-title, #email-body, #config, #run, #out, #flag");
    return;
  }

  // Show example email (001)
  titleEl.textContent = emails[0].t;
  bodyEl.textContent  = emails[0].b;

  // Seed BROKEN config shown to students
  cfgEl.value =
`threshold: 9
allowlist:
  - college.ac.uk
  - news.trustedvendor.com
  - paypa1.com
regex_allow: "paypal\\.com$"`;

  // -------------------------
  // Config parser (tolerant)
  // -------------------------
  function parseConfig(text) {
    const result = { allow: [], regex: null, thr: 9 };

    // threshold
    const mThr = text.match(/threshold:\s*(\d+)/i);
    if (mThr) result.thr = parseInt(mThr[1], 10);

    // allowlist: capture block until either regex_allow OR end of string
    const mAllow = text.match(/allowlist:\s*([\s\S]*?)(?:\n\s*regex_allow:|$)/i);
    if (mAllow) {
      mAllow[1].split(/\n/).forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('- ')) {
          result.allow.push(trimmed.replace('- ', '').trim().toLowerCase());
        }
      });
    }

    // regex_allow: "...."
    const mRegex = text.match(/regex_allow:\s*"([^"]+)"/i);
    if (mRegex) {
      try { result.regex = new RegExp(mRegex[1]); }
      catch { result.regex = null; }
    }

    return result;
  }

  // -------------------------
  // Classifier (simple rules)
  // -------------------------
  function classify(email, config) {
    const from = email.b.match(/From:\s*(.*)/i);
    const sender = from ? from[1].trim().toLowerCase() : "";
    const domain = sender.includes('@') ? sender.split('@')[1] : "";

    let score = 0;
    const bodyLower = email.b.toLowerCase();

    // suspicious phrases
    if (bodyLower.includes("verify") || bodyLower.includes("urgent") || bodyLower.includes("invoice")) {
      score += 4;
    }
    // evil domain hint
    if (domain.includes("evil")) score += 6;

    // allowlist override
    if (config.allow.includes(domain)) score = 0;

    // regex allow override - only zero if EXACT paypal.com is allowed
    if (config.regex && config.regex.test(domain) && domain === "paypal.com") {
      score = 0;
    }

    return (score >= config.thr) ? "phish" : "ham";
  }

  // -------------------------
  // Run button
  // -------------------------
  runBtn.addEventListener('click', () => {
    const cfg = parseConfig(cfgEl.value);
    let wrong = 0;
    let html = "<b>AI Output:</b><br><br>";

    emails.forEach((e, i) => {
      const pred = classify(e, cfg);
      const ok = (pred === correct[i]);
      html += `${e.t}: <b>${pred}</b> ${ok ? "&#9989;" : "&#10060;"}<br>`;
      if (!ok) wrong++;
    });

    outEl.innerHTML = html;
    if (wrong === 0) {
      flagEl.classList.remove('hidden');
    } else {
      flagEl.classList.add('hidden');
    }
  });

})();
