const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "secret";
let users = [];
let products = [];
let id = 1;

// AUTH
app.post("/auth/register", (req, res) => {
  const { username, password } = req.body;
  users.push({ username, password });
  res.json({ message: "User created" });
});

app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ username }, SECRET);
  res.json({ token });
});

// Middleware
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.sendStatus(403);

  const token = header.split(" ")[1];

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.sendStatus(403);
  }
}

// PRODUCTS
app.get("/products", auth, (req, res) => {
  res.json(products);
});

app.post("/products", auth, (req, res) => {
  const product = { id: id++, ...req.body };
  products.push(product);
  res.json(product);
});

// SALES
app.post("/sales", auth, (req, res) => {
  const { productId, qty } = req.body;
  const product = products.find(p => p.id == productId);

  if (!product || product.stock < qty) {
    return res.status(400).json({ error: "Stock insuffisant" });
  }

  product.stock -= qty;
  const amount = qty * product.price;

  res.json({ amount });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
