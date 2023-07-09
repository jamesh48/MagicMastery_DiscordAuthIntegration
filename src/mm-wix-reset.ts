import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import * as fs from 'fs';

import { fetchAllMagicMasteryACMPContacts } from './utilities';

// Run this Locally and copy paste the ./mmAuthMembers.json file into the wix code -- wix forbids access to badges from remote
(async () => {
  const verifiedMMContacts = await fetchAllMagicMasteryACMPContacts();
  fs.writeFileSync(
    './mmAuthMembers.json',
    JSON.stringify(verifiedMMContacts.map(({ email }) => email)),
    'utf-8'
  );
})();
