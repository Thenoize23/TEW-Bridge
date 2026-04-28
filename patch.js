const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
let c = 0;
function rep(o, n) { if (html.includes(o)) { html = html.replace(o, n); c++; console.log('✓', c); } else { console.log('⚠ skip:', o.slice(0,50)); } }

// Fix WebSocket URL
rep("ws = new WebSocket('ws://' + location.hostname + ':8766');", "const wsUrl = location.hostname === 'localhost' || location.hostname.match(/^192\\./) ? 'ws://' + location.hostname + ':8766' : 'wss://tew-bridge.onrender.com'; ws = new WebSocket(wsUrl);");

// Fix steps bug
rep("setTimeout(() => {\n    switchInnerTab('steps');\n    renderSteps();\n  }, 50);", "requestAnimationFrame(() => { requestAnimationFrame(() => { switchInnerTab('steps'); renderSteps(); }); });");

// Other Notes tab
rep('>Notes</button>', '>Other Notes</button>');

// Language buttons
if (!html.includes('lang-en')) {
  rep("</label>\n        </div>\n      </div>\n\n      <p class=\"sec-label\">VST Connection</p>", "</label>\n        </div>\n        <div class=\"set-row\">\n          <span class=\"set-lbl\">Language</span>\n          <div style=\"display:flex;gap:6px\"><button id=\"lang-en\" onclick=\"setLanguage('en')\" style=\"border:none;border-radius:8px;padding:6px 12px;font-family:var(--sans);font-size:12px;font-weight:600;cursor:pointer;background:var(--accent);color:#fff\">EN</button><button id=\"lang-es\" onclick=\"setLanguage('es')\" style=\"border:none;border-radius:8px;padding:6px 12px;font-family:var(--sans);font-size:12px;font-weight:600;cursor:pointer;background:var(--panel3);color:var(--text2)\">ES</button></div>\n        </div>\n      </div>\n\n      <p class=\"sec-label\">VST Connection</p>");
}

if (!html.includes('function setLanguage')) {
  html = html.replace('function getProjectPct', "let currentLang=localStorage.getItem('tew_lang')||'en';\nfunction setLanguage(lang){currentLang=lang;localStorage.setItem('tew_lang',lang);const e=document.getElementById('lang-en'),s=document.getElementById('lang-es');if(e){e.style.background=lang==='en'?'var(--accent)':'var(--panel3)';e.style.color=lang==='en'?'#fff':'var(--text2)';}if(s){s.style.background=lang==='es'?'var(--accent)':'var(--panel3)';s.style.color=lang==='es'?'#fff':'var(--text2)';}}\n\nfunction getProjectPct");
  c++; console.log('✓', c, 'lang');
}

fs.writeFileSync('index.html', html);
console.log('Done!', c, 'patches. Now: git add index.html && git commit -m "patches" && git push');
