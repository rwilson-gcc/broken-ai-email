
const emails=[{t:"001 – Meeting Invite",b:`From: alice@college.ac.uk
Subject: Meeting
Hi team.`},{t:"002 – PayPal Security",b:`From: security@paypa1.com
Urgent verify account
http://accounts-paypal.com.login.evil.tld/verify`},{t:"003 – PayPal Receipt",b:`From: noreply@paypal.com.evil.co
Your receipt`},{t:"004 – Newsletter",b:`From: updates@news.trustedvendor.com
Newsletter`},{t:"005 – IT Password Reset",b:`From: it-support@college.ac.uk
Password reset`},{t:"006 – Shipping Invoice",b:`From: billing@shipfast.co
Invoice overdue`}];
const correct=["ham","phish","phish","ham","ham","ham"];
let idx=0;
function show(){document.getElementById('email-title').textContent=emails[idx].t;document.getElementById('email-body').textContent=emails[idx].b;}
show();
function parseConfig(txt){let allow=[],regex=null,thr=9;txt.split(/
/).forEach(l=>{l=l.trim();if(l.startsWith('- '))allow.push(l.replace('- ',''));if(l.startsWith('regex_allow')){let m=l.match(/"(.+?)"/);if(m)regex=new RegExp(m[1]);}if(l.startsWith('threshold'))thr=parseInt(l.split(':')[1]);});return {allow,regex,thr};}
function classify(e,c){let sender=e.b.match(/From: (.*)/i);let dom=sender?sender[1].toLowerCase().split('@')[1]:"";let score=0;let body=e.b.toLowerCase();if(body.includes('verify')||body.includes('urgent')||body.includes('invoice'))score+=4;if(dom.includes('evil'))score+=6;if(c.allow.includes(dom))score=0;if(c.regex&&c.regex.test(dom)&&dom==="paypal.com")score=0;return score>=c.thr?"phish":"ham";}
document.getElementById('run').onclick=()=>{let cfg=parseConfig(document.getElementById('config').value);let out="";let wrong=0;emails.forEach((e,i)=>{let p=classify(e,cfg);out+=`${e.t}: ${p} ${p===correct[i]?"✔":"❌"}<br>`;if(p!==correct[i])wrong++;});document.getElementById('out').innerHTML=out;if(wrong===0)document.getElementById('flag').classList.remove('hidden');};
document.getElementById('config').value=`threshold: 9
allowlist:
  - college.ac.uk
  - news.trustedvendor.com
  - paypa1.com
regex_allow: "paypal\.com$"`;
