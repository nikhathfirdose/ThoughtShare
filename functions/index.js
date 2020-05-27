const functions = require("firebase-functions");

const app = require("express")();
// const app = express(); //app is our container for all routes ==== to const app = require("express")();
const FBAuth = require("./util/fbAuth");

const {
  getAllThoughts,
  postOneThought,
  getThought,
  commentOnThought,
} = require("./handlers/thoughts");
const {
  signUp,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
} = require("./handlers/users");

//.get methods is creating routes
//Thought Routes
app.get("/thoughts", getAllThoughts);
app.post("/thought", FBAuth, postOneThought);
app.get("/thought/:thoughtId", getThought);
//todo:
//delete thought
//like a thought
//unlike a thought
//comment on thought
app.post("/thought/:thoughtId/comment", FBAuth, commentOnThought);

//User routes
app.post("/signup", signUp);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);

//one api multiple routes
exports.api = functions.region("asia-east2").https.onRequest(app); //this one on requst can work on multiple paths, this was done by express and it helps in creating a container for all routes
//403- unauthorized
//201- server enter success
