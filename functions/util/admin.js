const admin = require("firebase-admin");
admin.initializeApp(); //we aint passing app coz, it knows where to load == firebaserc
const db = admin.firestore(); // changing all admin.firestore to db now

module.exports = { admin, db };
