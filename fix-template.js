const fs = require('fs');

const filePath = 'd:/ivy/src/components/InterviewStage.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix broken template literals
content = content.replace(/`\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| '`\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| 'http:\/\/localhost:3001'\}'/g, '${process.env.NEXT_PUBLIC_API_URL || \'http://localhost:3001\'}');

content = content.replace(/'`\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| 'http:\/\/localhost:3001'\}'/g, '${process.env.NEXT_PUBLIC_API_URL || \'http://localhost:3001\'}');

fs.writeFileSync(filePath, content);
console.log('Fixed template literals');