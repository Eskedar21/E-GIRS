/**
 * Script to create an Institute Data Contributor account
 * This can be run in the browser console or as a utility
 * 
 * Usage in browser console:
 * import { createUser } from '../data/users';
 * createUser({
 *   username: 'institute_contributor',
 *   email: 'institute.contributor@health.gov.et',
 *   password: 'Institute123!',
 *   officialUnitId: 2, // Ministry of Health
 *   role: 'Institute Data Contributor'
 * });
 */

// This script is for reference - the account already exists in default users
// If you need to create it programmatically, use the createUser function from data/users.js

console.log(`
Institute Contributor Account Details:
- Username: institute_contributor
- Email: institute.contributor@health.gov.et
- Password: Institute123!
- Role: Institute Data Contributor
- Unit: Ministry of Health (unitId: 2)

This account is already included in the default users.
If localStorage is empty, it will be created automatically.
If you need to recreate it, use the createUser function from the admin panel or browser console.
`);
