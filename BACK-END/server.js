require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { MongoClient, ServerApiVersion } = require('mongodb');
const { enviarEmailPlanilha } = require("./emailService");

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

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// --- Configura MongoDB Atlas ---
const uri = `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@numerosrifa.x4oaojf.mongodb.net/?retryWrites=true&w=majority&appName=NumerosRifa`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let usuariosCollection; // <-- coleção global

async function initMongo() {
  await client.connect();
  const db = client.db("numerosrifa"); // nome do seu DB
  usuariosCollection = db.collection("usuarios");
  console.log("MongoDB conectado com sucesso!");
}


// --- Funções de CRUD substituindo JSON ---
async function loadData() {
  const usuarios = await usuariosCollection.find({}).toArray();
  return { usuarios };
}

async function saveData(data) {
  // Atualiza cada usuário ou insere se não existir
  for (const u of data.usuarios) {
    await usuariosCollection.updateOne(
      { nome: u.nome },
      { $set: { numeros: u.numeros } },
      { upsert: true }
    );
  }
}

// --- Endpoint público /marcados ---
app.get("/marcados", async (req, res) => {
  const data = await loadData();
  const allNumbers = data.usuarios.flatMap(u => u.numeros);
  res.json(allNumbers);
});

// --- Endpoint admin via Bearer token ---
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

app.post("/marcados", checkAuthBearer, async (req, res) => {
  const { numeros } = req.body;
  if (!Array.isArray(numeros)) return res.status(400).json({ error: "O campo 'numeros' precisa ser um array" });

  const data = await loadData();
  const adminUser = data.usuarios.find(u => u.nome === "admin") || { nome: "admin", numeros: [] };

  let adicionados = 0;
  numeros.forEach(n => {
    if (!adminUser.numeros.includes(n)) {
      adminUser.numeros.push(n);
      adicionados++;
    }
  });

  if (!data.usuarios.some(u => u.nome === "admin")) data.usuarios.push(adminUser);
  await saveData(data);

  res.json({ ok: true, total: adminUser.numeros.length, adicionados });
});

// Função para salvar dados e enviar planilha automaticamente
async function saveDataAndNotify(data) {
  await saveData(data);
  const email = process.env.EMAIL_USER;
  try {
    await enviarEmailPlanilha(email);
    console.log(`[EMAIL] Planilha enviada para ${email}`);
  } catch (err) {
    console.error(`[EMAIL] Falha ao enviar planilha:`, err);
  }
}

// --- Endpoints administrativos ---
app.post("/admin/marcados", async (req, res) => {
  if (!(req.session && req.session.isAdmin)) 
    return res.status(401).json({ error: "Não autenticado" });

  const { usuario, numeros } = req.body;
  if (!usuario || !Array.isArray(numeros)) 
    return res.status(400).json({ error: "usuario e numeros são obrigatórios" });

  const data = await loadData();
  let user = data.usuarios.find(u => u.nome === usuario);
  if (!user) {
    user = { nome: usuario, numeros: [] };
    data.usuarios.push(user);
  }

  let adicionados = 0;
  let numerosBloqueados = [];

  numeros.forEach(n => {
    // Verifica se outro usuário já possui esse número
    const numeroJaVinculado = data.usuarios.some(u => u.nome !== usuario && u.numeros.includes(n));
    if (numeroJaVinculado) {
      numerosBloqueados.push(n);
    } else if (!user.numeros.includes(n)) {
      user.numeros.push(n);
      adicionados++;
    }
  });

  await saveDataAndNotify(data);

  res.json({
    ok: true,
    total: user.numeros.length,
    adicionados,
    bloqueados: numerosBloqueados  // números que não puderam ser adicionados
  });
});


app.get("/admin/usuarios", async (req, res) => {
  const data = await loadData();
  res.json(data.usuarios.map(u => u.nome));
});

app.get("/admin/usuarios-completos", async (req, res) => {
  if (!(req.session && req.session.isAdmin)) {
    return res.status(401).json({ error: "Não autenticado" });
  }
  const data = await loadData();
  res.json(data.usuarios);
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

initMongo().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend rodando na porta ${PORT}`);
  });
}).catch(err => {
  console.error("Erro ao conectar no MongoDB:", err);
});
