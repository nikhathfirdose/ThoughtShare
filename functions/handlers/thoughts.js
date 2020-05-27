const { db } = require("../util/admin");
exports.getAllThoughts = (req, res) => {
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
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

//post one thought
exports.postOneThought = (req, res) => {
  if (req.body.body.trim() === "") {
    return res.status(400).json({ body: "Body must not be empty" });
  }

  const userThoughts = {
    body: req.body.body,
    userHandle: req.user.handle, //changed coz middle ware is authenticated now, so user.handle takes in from our own collection
    createdAt: new Date().toISOString(),
  };
  db.collection("thoughts")
    .add(userThoughts)
    .then((doc) => {
      res.json({ message: `Document ${doc.id} created sucessfully` });
    })
    .catch((err) => {
      res.status(500).json({ error: `something is wrong` });
      console.error(err);
    });
};

exports.getThought = (req, res) => {
  let thoughtData = {};
  db.doc(`/thoughts/${req.params.thoughtId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: `Thought not found` });
      }
      thoughtData = doc.data();
      thoughtData.thoughtId = doc.id;
      return db
        .collection("comments")
        .orderBy("createdAt", "desc")
        .where("thoughtId", "==", req.params.thoughtId)
        .get();
    })
    .then((data) => {
      thoughtData.comments = [];
      data.forEach((doc) => {
        thoughtData.comments.push(doc.data());
      });
      return res.json(thoughtData);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
