const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();

// ✅ Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// ✅ Variables en mémoire (MVP)
const SECRET = "secret";
let users = [];
let products = [];
let sales = [];
let productId = 1;

// =========================
// ✅ AUTHENTIFICATION
// =========================

// REGISTER
app.post("/auth/register", (req, res) => {
  const { username, password } = req.body;

  const exist = users.find(u => u.username === username);
  if (exist) {
    return res.status(400).json({ error: "Utilisateur existe déjà" });
  }

  users.push({ username, password });

  res.json({ message: "Compte créé" });
});

// LOGIN
app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Identifiants invalides" });
  }

  const token = jwt.sign({ username }, SECRET, { expiresIn: "1d" });

  res.json({ token });
});

// =========================
// ✅ MIDDLEWARE AUTH
// =========================

function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header) return res.sendStatus(403);

  const token = header.split(" ")[1];

  try {
