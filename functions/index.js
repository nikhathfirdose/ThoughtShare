const functions = require("firebase-functions");
const admin = require("firebase-admin");
const app = require("express")();
// const app = express(); //app is our container for all routes ==== to const app = require("express")();
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
const firebase = require("firebase"); //all these require data is been installed as a package in the functions cd - npm insatall --save blah
firebase.initializeApp(firebaseConfig);

//.get methods is creating routes

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
        }); //just doc is a reference. (.data() gives the data in that referece)
      });
      return res.json(thoughts);
    })
    .catch((err) => console.error(err));
});
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
//helper methods to validate if fields are empty or incorrect
const isEmail = (email) => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) {
    return true;
  } else {
    return false;
  }
};
const isEmpty = (string) => {
  if (string.trim() === "") {
    return true;
  } else {
    return false;
  }
};
//sign up route
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };
  let errors = {};
  if (isEmpty(newUser.email)) {
    errors.email = "Must not be empty";
  } else if (!isEmail(newUser.email)) {
    errors.email = "Must be a valid email address";
  }
  if (isEmpty(newUser.password)) {
    errors.password = "Must not be empty";
  }
  if (newUser.password !== newUser.confirmPassword) {
    errors.confirmPassword = "Passwords must match";
  }
  if (isEmpty(newUser.handle)) {
    errors.handle = "Must not be empty";
  }
  // validate user - checks if user handle is unique or no - this is done by checking the "users collection of db. we check if it has that handle or new user has come from below code"
  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  let token, userId;
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ handle: "This handle is already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId,
      };
      db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      console.error;
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "Email already in use" });
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
});

//one api multiple routes
exports.api = functions.region("asia-east2").https.onRequest(app); //this one on requst can work on multiple paths, this was done by express and it helps in creating a container for all routes
