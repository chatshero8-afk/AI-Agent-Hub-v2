import fs from 'fs';
let content = fs.readFileSync('src/components/CreateAgentModal.tsx', 'utf8');

const bad = `const [allowedRoles,\n        allowedEmails: allowedEmails.split(',').map(e => e.trim()).filter(Boolean), setAllowedRoles] = useState<UserRole[]>([]);`;
const good = `const [allowedRoles, setAllowedRoles] = useState<UserRole[]>([]);`;

content = content.replace(bad, good);
fs.writeFileSync('src/components/CreateAgentModal.tsx', content);

// Let me also test if the map was broken somewhere else by finding the previous broken line.
let bad2 = `if (e.target.checked) setAllowedRoles([...allowedRoles,
        allowedEmails: allowedEmails.split(',').map(e => e.trim()).filter(Boolean), r as UserRole]);`;
let good2 = `if (e.target.checked) setAllowedRoles([...allowedRoles, r as UserRole]);`;
content = content.replace(bad2, good2);
fs.writeFileSync('src/components/CreateAgentModal.tsx', content);
