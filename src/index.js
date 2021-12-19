const path = require("path");
const express = require("express");
require("./db/mongoose.js");
const sessions = require("express-session");
const fileUpload = require("express-fileupload");

// Routers
const userRouter = require("./router/user-router.js");
const taskRouter = require("./router/task-router.js");

const app = express();

var port = process.env.PORT;

app.use(sessions({secret: process.env.SESSION_KEY, saveUninitialized: true, resave: true}));

const publicPathDirectory = path.join(__dirname, "../public");
app.use(express.static(publicPathDirectory));

app.set("view engine", "hbs");

app.use(fileUpload());
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Using routers with express
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
});

