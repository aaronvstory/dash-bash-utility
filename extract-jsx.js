const fs = require('fs');

console.log('🔍 Extracting JSX from index.html...');

// Read index.html
const html = fs.readFileSync('index.html', 'utf8');

// Extract everything between <script type="text/babel"> and </script>
const babelScriptRegex = /<script type="text\/babel">([\s\S]*?)<\/script>/;
const match = html.match(babelScriptRegex);

if (!match) {
  console.warn('⚠️ No inline <script type="text/babel"> block found in index.html. Skipping extraction and using existing dash-bash-component.jsx');
  process.exit(0);
}

const jsxCode = match[1];

// Write to separate file
fs.writeFileSync('dash-bash-component.jsx', jsxCode, 'utf8');

console.log('✅ Extracted JSX to dash-bash-component.jsx');
console.log(`   Size: ${(jsxCode.length / 1024).toFixed(2)} KB (${jsxCode.length.toLocaleString()} bytes)`);
console.log(`   Lines: ${jsxCode.split('\n').length.toLocaleString()}`);
console.log('');
console.log('💡 Next step: Run "npm run compile" to generate optimized JavaScript');
