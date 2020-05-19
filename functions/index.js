const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const app = express(); //app is our container for all routes ==== to const app = require("express")();
admin.initializeApp(); //we aint passing app coz, it knows where to load ==

const firebaseConfig = {
  apiKey: "AIzaSyD8f_UjWaMviBk5aUXEv2z7QWlTOVoR7HE",
  authDomain: "thoughtshare-1660b.firebaseapp.com",
  databaseURL: "https://thoughtshare-1660b.firebaseio.com",
  projectId: "thoughtshare-1660b",
  storageBucket: "thoughtshare-1660b.appspot.com",
  messagingSenderId: "750082543278",
  appId: "1:750082543278:web:a7986c833ca574e764273f",
  measurementId: "G-15944FPSBE",
};
const firebase = require("firebase"); //alll these require data is been installed as a package in the functions cd - npm insatall --save blah
firebase.initializeApp(firebaseConfig);
// // // Create and Deploy Your First Cloud Functions
// // // https://firebase.google.com/docs/functions/write-firebase-functions
// //
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   response.send("Hello from Firebase!");
// });

// exports.getThoughts = functions.https.onRequest((req, res) => {

// });
//this .get methods is creating routes

const db = admin.firestore(); // changing all admin.firestore to db now
app.get("/thoughts", (req, res) => {
  db.collection("thoughts")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let thoughts = [];
      data.forEach((doc) => {
        thoughts.push({
          thoughtId: doc.id,
          userHandle: doc.data().userHandle,
          body: doc.data().body,
          createdAt: doc.data().createdAt,
        }); //just doc is a reference. (.data() gives the data in that  referece)
      });
      return res.json(thoughts);
    })
    .catch((err) => console.error(err));
});

// we need not manually set if !=post as express handles that for us
//so below lineswont be needed
// if (req.method !== "POST") {
//     return res.status(400).json({ error: `Select POST method` });
//   }
app.post("/thought", (req, res) => {
  const userThoughts = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString(),
  };
  db.collection("thoughts")
    .add(userThoughts)
    .then((doc) => {
      res.json({ mesaage: `Document ${doc.id} created sucessfully` });
    })
    .catch((err) => {
      res.status(500).json({ error: `something is wrong` });
      console.error(err);
    });
});
//sign up route
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };
  // validate user - checks if user handle is unique or no

  //signimg up
  firebase
    .auth()
    .createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then((data) => {
      return res
        .status(201)
        .json({ message: `user ${data.user.uid} signed in successfully` });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
});

//one api multiple routes
exports.api = functions.region("asia-east2").https.onRequest(app); //this one on requst can work on multiple paths, this was done by express and it helps in creating a container for all routes
