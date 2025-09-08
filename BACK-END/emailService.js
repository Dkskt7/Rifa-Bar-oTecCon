const nodemailer = require("nodemailer");
const ExcelJS = require("exceljs");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

// Configura MongoDB Atlas
const uri = `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@numerosrifa.x4oaojf.mongodb.net/?retryWrites=true&w=majority&appName=NumerosRifa`;
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

async function loadData() {
  try {
    await client.connect();
    const db = client.db("NumerosRifa"); // nome do DB que você criou
    const usuariosCollection = db.collection("usuarios"); // nome da coleção
    const usuarios = await usuariosCollection.find({}).toArray();
    return { usuarios };
  } finally {
    await client.close();
  }
}

async function gerarPlanilha() {
  const data = await loadData();
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Vendidos");

  sheet.addRow(["Usuário", "Números"]);
  data.usuarios.forEach(u => {
    sheet.addRow([u.nome, (u.numeros || []).join(", ")]);
  });

  return await workbook.xlsx.writeBuffer();
}

async function enviarEmailPlanilha(destinatario) {
  const planilhaBuffer = await gerarPlanilha();

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"Relatório Vendidos" <${process.env.EMAIL_USER}>`,
    to: destinatario,
    subject: "📊 Relatório de Vendidos",
    text: "Segue em anexo a planilha com os números vendidos.",
    attachments: [
      {
        filename: "vendidos.xlsx",
        content: planilhaBuffer,
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      }
    ]
  });

  console.log("📧 Email enviado para " + destinatario);
}

module.exports = { enviarEmailPlanilha };
