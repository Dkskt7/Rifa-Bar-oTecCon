require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const session = require("express-session");
const { Console } = require("console");

const PORT = process.env.PORT || 8080;
const app = express();
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;
app.set("trust proxy", 1);
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true
}));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  proxy: true,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  }
}));

const filePath = path.join(__dirname, "vendidos.json");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Lê JSON do banco, cria estrutura se não existir
function loadData() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ usuarios: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

// Salva JSON no disco
function saveData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// --- Endpoint público /marcados (mantido, sem alteração) ---
app.get("/marcados", (req, res) => {
  const data = loadData();
  const allNumbers = data.usuarios.flatMap(u => u.numeros);
  res.json(allNumbers);
});

// --- Endpoint admin via Bearer token (mantido) ---
function checkAuthBearer(req, res, next) {
  const auth = req.headers["authorization"];
  if (!auth) return res.status(401).json({ error: "Auth header requerido" });
  const parts = auth.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ error: "Formato inválido" });
  }
  const token = parts[1];
  if (token !== process.env.ADMIN_TOKEN) return res.status(403).json({ error: "Token inválido" });
  next();
}

app.post("/marcados", checkAuthBearer, (req, res) => {
  const { numeros } = req.body;
  if (!Array.isArray(numeros)) return res.status(400).json({ error: "O campo 'numeros' precisa ser um array" });

  const data = loadData();
  const adminUser = data.usuarios.find(u => u.nome === "admin") || { nome: "admin", numeros: [] };

  let adicionados = 0;
  numeros.forEach(n => {
    if (!adminUser.numeros.includes(n)) {
      adminUser.numeros.push(n);
      adicionados++;
    }
  });

  if (!data.usuarios.some(u => u.nome === "admin")) data.usuarios.push(adminUser);
  saveData(data);
  console.log(`[ACESSO] ${new Date().toISOString()} - GET /marcados - IP: ${req.ip}`);
  res.json({ ok: true, total: adminUser.numeros.length, adicionados });
});

// --- Login/admin session ---
app.post("/login", (req, res) => {
  const { user, password } = req.body;
  if (user === "admin" && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.json({ ok: true });
  } else {
    return res.status(401).json({ ok: false, error: "Credenciais inválidas" });
  }
});

app.get("/admin/me", (req, res) => {
  res.json({ ok: !!(req.session && req.session.isAdmin) });
});

app.get("/admin/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: "Erro ao deslogar" });
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});
app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

// --- Rota administrativa POST /admin/marcados para qualquer usuário ---
app.post("/admin/marcados", (req, res) => {
  if (!(req.session && req.session.isAdmin)) return res.status(401).json({ error: "Não autenticado" });

  const { usuario, numeros } = req.body;
  if (!usuario || !Array.isArray(numeros)) return res.status(400).json({ error: "usuario e numeros são obrigatórios" });

  const data = loadData();
  let user = data.usuarios.find(u => u.nome === usuario);
  if (!user) {
    user = { nome: usuario, numeros: [] };
    data.usuarios.push(user);
  }

  let adicionados = 0;
  numeros.forEach(n => {
    if (!user.numeros.includes(n)) {
      user.numeros.push(n);
      adicionados++;
    }
  });

  saveData(data);
  res.json({ ok: true, total: user.numeros.length, adicionados });
});

// GET lista de usuários (combo box frontend)
app.get("/admin/usuarios", (req, res) => {
  const data = loadData();
  res.json(data.usuarios.map(u => u.nome));
});
// GET lista completa de usuários com seus números
app.get("/admin/usuarios-completos", (req, res) => {
  if (!(req.session && req.session.isAdmin)) {
    return res.status(401).json({ error: "Não autenticado" });
  }
  const data = loadData();
  res.json(data.usuarios);
});


app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
