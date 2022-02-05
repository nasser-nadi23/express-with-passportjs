const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");

require("dotenv").config();

const initializePassport = require("./passport-config");
initializePassport(
  passport,
  (email) => users.find((user) => user.email === email),
  (id) => users.find((user) => user.id === id)
);

app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

const users = [];

app.get("/", checkAuthenticated, (req, res) => {
  res.render("index.ejs", { name: req.user.email });
});

// Signup users
app.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({
      id: Math.floor(Math.random() * 1000),
      email,
      password: hashedPassword,
    });
    res.redirect("/signin");
  } catch (error) {
    res.redirect("/signup");
  }
  console.log(users);
});

// sign in user
app.post(
  "/signin",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/signin",
    failureFlash: true,
  })
);

app.get("/signin", (req, res) => {
  res.render("signin.ejs");
});

app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

// Protect our routes -> middleware
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/signin");
}

app.listen(3000, () => {
  console.log(`The server is running on port 3000...`);
});
