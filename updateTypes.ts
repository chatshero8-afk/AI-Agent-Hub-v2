import fs from 'fs';
let content = fs.readFileSync('src/types.ts', 'utf8');

const tOld = `export type UserRole = 'admin' | 'senior_staff' | 'junior_staff' | 'intern' | 'pending';`;
const tNew = `export type UserRole = 'admin' | 'Senior IT' | 'Junior IT' | 'Intern IT' | 'Intern Graphic' | 'Private' | 'pending';`;
content = content.replace(tOld, tNew);

const aOld = `visibility?: 'public' | 'private';
  allowedRoles?: UserRole[];`;
const aNew = `visibility?: 'public' | 'private';
  allowedRoles?: UserRole[];
  allowedEmails?: string[];`;
content = content.replace(aOld, aNew);

fs.writeFileSync('src/types.ts', content);
