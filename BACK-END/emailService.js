const nodemailer = require("nodemailer");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "vendidos.json");

function loadData() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ usuarios: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

async function gerarPlanilha() {
  const data = loadData();
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Vendidos");

  sheet.addRow(["Usuário", "Números"]);
  data.usuarios.forEach(u => {
    sheet.addRow([u.nome, u.numeros.join(", ")]);
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
      user: process.env.EMAIL_USER,   // seu Gmail
      pass: process.env.EMAIL_PASS    // App Password gerada
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
