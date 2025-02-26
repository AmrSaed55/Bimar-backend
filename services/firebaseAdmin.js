import admin from 'firebase-admin';
import { readFile } from 'fs/promises'; // Import fs/promises

// Read the JSON file
const serviceAccount = JSON.parse(
  await readFile(new URL('./bimar-a720b-firebase-adminsdk-fbsvc-e9dac34127.json', import.meta.url))
);

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;