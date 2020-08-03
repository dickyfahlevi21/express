const express = require("express");
const axios = require("axios");
const app = express();
const port = 3002;
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
// mongoose.connect('mongodb://localhost/todolist', {
//   useNewUrlParser: true
// });
mongoose.connect("mongodb://localhost/todolist", {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  useCreateIndex: true
});

app.set("view engine", "pug");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

const todoShema = new mongoose.Schema({
  name: String,
  status: Boolean,
});

const TodoModel = mongoose.model("Todo", todoShema);

const fethcuser = async () => {
  return axios
    .get("https://jsonplaceholder.typicode.com/users")
    .then((response) => {
      return response.data;
    })
    .catch((err) => {
      console.log(err);
    });
};

const getTodo = async () => {
  return await TodoModel.find({});
};

app.get("/", (req, res) => {
  res.send("go to this link for todo component http://localhost:3002/todo");
});

app.get("/user/:userid?", async (request, response) => {
  const {
    params
  } = request;
  const userList = await fethcuser();
  let user = null;
  if (params.userid !== undefined) {
    user = await userList.find((e) => e.id === parseInt(params.userid));
    response.render("userdetail", {
      user
    });
  } else {
    response.render("user", {
      users: userList
    });
  }
});

app.get("/pug", function (req, res) {
  res.render("index", {
    title: "Hey",
    message: "Hello there!"
  });
});

app.get("/todo", async (req, res) => {
  const todolist = await getTodo()
    .then((response) => {
      console.log(response);
      res.render("todo", {
        todo: response
      });
    })
    .catch((err) => console.log(err));
});

app.post("/todo", async (req, res) => {
  const addTodo = new TodoModel({
    name: req.body.todo
  });
  await addTodo.save((err, todo) => {
    console.log("saved");
  });
  console.log(addTodo, 'test add');
  res.redirect("/todo");
});

app.post("/todo/:id", (req, res) => {
  res.json({
    id: req.params.id,
    body: req.body
  });
});

app.post("/todo/:id/delete", async (req, res) => {
  const deleteTodo = TodoModel.findById(req.params.id);
  await deleteTodo.deleteOne((err, todo) => {
    console.log("delete");
  });
  res.redirect("/todo");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});