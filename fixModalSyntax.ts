import fs from 'fs';
let m = fs.readFileSync('src/components/CreateAgentModal.tsx', 'utf8');

let broke = "[...allowedRoles,\n        allowedEmails: allowedEmails.split(',').map(e => e.trim()).filter(Boolean), r as UserRole]";
let fixed = "[...allowedRoles, r as UserRole]";
m = m.replace(broke, fixed);
fs.writeFileSync('src/components/CreateAgentModal.tsx', m);
