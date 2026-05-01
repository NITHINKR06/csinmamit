import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const coreMembersSource = resolve(__dirname, '..', 'src', 'constants', 'coreMembers.js');
const content = readFileSync(coreMembersSource, 'utf-8');

const membersMatch = content.match(/CORE_MEMBERS\s*=\s*({[\s\S]*?});/);
if (!membersMatch) {
  console.error('Could not find CORE_MEMBERS in coreMembers.js');
  process.exit(1);
}

const CORE_MEMBERS = eval('(' + membersMatch[1] + ')');

const firestoreImport = {};
for (const [email, data] of Object.entries(CORE_MEMBERS)) {
  const safeEmail = email.replace(/[.]/g, '[dot]').replace(/[@]/g, '[at]');
  firestoreImport[safeEmail] = {
    email,
    name: data.name,
    role: data.role,
    permissions: data.permissions,
    level: data.level
  };
}

// Firestore named export format
const output = {
  __collections__: {
    coreMembers: firestoreImport
  }
};

const outputPath = resolve(__dirname, '..', 'coreMembers-import.json');
writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(`Firestore import file generated: ${outputPath}`);
console.log(`\nTo import:`);
console.log(`1. Open Firebase Console → Firestore`);
console.log(`2. Click "Start collection" → name it "coreMembers"`);
console.log(`3. For each member, create a document with ID = their email`);
console.log(`   Fields: email (string), name (string), role (string),`);
console.log(`           permissions (array), level (number)`);
console.log(`\nOr import the JSON via Firebase Console → Firestore → ⋮ → Import`);
