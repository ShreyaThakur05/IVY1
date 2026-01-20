const fs = require('fs');

const filePath = 'd:/ivy/src/components/InterviewStage.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix all broken template literals patterns
content = content.replace(/fetch\(\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| 'http:\/\/localhost:3001'\}\}/g, 'fetch(`${process.env.NEXT_PUBLIC_API_URL || \'http://localhost:3001\'}');

fs.writeFileSync(filePath, content);
console.log('Fixed all template literals');