const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'pages');

fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.jsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('http://localhost:3001')) {
      content = content.replace(/http:\/\/localhost:3001/g, '');
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
});
console.log('All files updated to use relative API paths.');
