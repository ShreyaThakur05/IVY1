const fs = require('fs');
const path = 'd:/ivy/src/components/InterviewStage.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/'\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| 'http:\/\/localhost:3001'\}/g, '`${process.env.NEXT_PUBLIC_API_URL || \'http://localhost:3001\'}`');

fs.writeFileSync(path, content);
console.log('Fixed template literals');