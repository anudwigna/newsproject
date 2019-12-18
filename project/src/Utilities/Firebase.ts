import admin from 'firebase-admin';

const serviceAccount = require("./news_project_service_account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export default admin;