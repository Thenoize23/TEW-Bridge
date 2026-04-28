const fs = require('fs');
const src = fs.readFileSync('C:/Users/conoi/Downloads/index.html', 'utf8');
fs.writeFileSync('index.html', src);
console.log('Copied! Size:', src.length);
