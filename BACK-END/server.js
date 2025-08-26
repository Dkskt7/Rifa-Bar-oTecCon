require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const session = require("express-session");

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;

app.use(cors({
  origin: FRONTEND_ORIGIN,   // important: allow exact origin so cookies funcionem
  credentials: true
}));
app.use(express.json());

// sessions (para não expor token no frontend)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // em produção, true quando usar HTTPS
    sameSite: 'lax'
  }
}));

const filePath = path.join(__dirname, "vendidos.json");
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const PORT = process.env.PORT || 3000;

function loadMarcados() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ numeros: [] }, null, 2));
  }
  const data = fs.readFileSync(filePath, "utf-8");
  return new Set(JSON.parse(data).numeros || []);
}

let marcados = loadMarcados();

// GET → público
app.get("/marcados", (req, res) => {
  marcados = loadMarcados();
  res.json([...marcados]);
});

// Mantive sua rota original que exige Bearer (opcional)
function checkAuthBearer(req, res, next) {
  const auth = req.headers["authorization"];
  if (!auth) return res.status(401).json({ error: "Auth header requerido" });

  const parts = auth.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ error: "Formato inválido" });
  }

  const token = parts[1];
  if (token !== ADMIN_TOKEN) {
    return res.status(403).json({ error: "Token inválido" });
  }

  next();
}

app.post("/marcados", checkAuthBearer, (req, res) => {
  const { numeros } = req.body;
  if (!Array.isArray(numeros)) {
    return res.status(400).json({ error: "O campo 'numeros' precisa ser um array" });
  }

  let adicionados = 0;
  numeros.forEach(num => {
    if (!marcados.has(num)) {
      marcados.add(num);
      adicionados++;
    }
  });

  fs.writeFileSync(filePath, JSON.stringify({ numeros: [...marcados] }, null, 2));

  res.json({
    ok: true,
    total: marcados.size,
    adicionados: adicionados
  });
});

// --- Login que cria sessão (não envia token ao cliente)
app.post("/login", (req, res) => {
  const { user, password } = req.body;

  if (!user || !password) {
    return res.status(400).json({ ok: false, error: "user e password são obrigatórios" });
  }

  if (user === "admin" && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;          // <-- sessão criada no servidor
    return res.json({ ok: true });
  } else {
    return res.status(401).json({ ok: false, error: "Credenciais inválidas" });
  }
});

// Rota para checar se está logado (Frontend usa para guard)
app.get("/admin/me", (req, res) => {
  res.json({ ok: !!(req.session && req.session.isAdmin) });
});

// Rota administrativa que usa sessão (NUNCA expõe ADMIN_TOKEN)
app.post("/admin/marcados", (req, res) => {
  if (!(req.session && req.session.isAdmin)) {
    return res.status(401).json({ error: "Não autenticado" });
  }

  const { numeros } = req.body;
  if (!Array.isArray(numeros)) {
    return res.status(400).json({ error: "O campo 'numeros' precisa ser um array" });
  }

  let adicionados = 0;
  numeros.forEach(num => {
    if (!marcados.has(num)) {
      marcados.add(num);
      adicionados++;
    }
  });

  fs.writeFileSync(filePath, JSON.stringify({ numeros: [...marcados] }, null, 2));

  res.json({
    ok: true,
    total: marcados.size,
    adicionados
  });
});

// logout
app.get("/admin/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: "Erro ao deslogar" });
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

app.listen(PORT, () => console.log(`Backend rodando em http://localhost:${PORT}`));
