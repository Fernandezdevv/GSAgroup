const express = require('express');
const cors = require('cors');
const mercadopago = require('mercadopago');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configurações
app.use(cors());
app.use(express.json());

// 1. CONFIGURAÇÃO DO MERCADO PAGO
mercadopago.configure({
    access_token: process.env.MP_ACCESS_TOKEN // Seu Token de Produção do Mercado Pago
});

// 2. CONFIGURAÇÃO DO E-MAIL (Quem envia a planilha)
const transporter = nodemailer.createTransport({
    service: 'gmail', // Ou outro serviço SMTP (Hostgator, AWS, etc)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Use "Senha de App" se for Gmail
    }
});

// ROTA 1: CRIAR PAGAMENTO (O Site chama aqui)
app.post('/api/criar-pagamento', async (req, res) => {
    const { email, nome } = req.body;

    let preference = {
        items: [
            {
                title: 'Planilha Precificação Pro - GSA Group',
                unit_price: 67.00, // Preço do produto
                quantity: 1,
                currency_id: 'BRL'
            }
        ],
        payer: {
            email: email,
            name: nome
        },
        back_urls: {
            success: "https://seusite.com.br/sucesso.html",
            failure: "https://seusite.com.br/erro.html",
            pending: "https://seusite.com.br/pendente.html"
        },
        auto_return: "approved",
        // O Webhook que avisa quando pagou
        notification_url: "https://sua-api.com/api/webhook" 
    };

    try {
        const response = await mercadopago.preferences.create(preference);
        // Retorna o link de pagamento para o site abrir
        res.json({ init_point: response.body.init_point });
    } catch (error) {
        console.log(error);
        res.status(500).send('Erro ao criar pagamento');
    }
});

// ROTA 2: WEBHOOK (O Mercado Pago chama aqui quando aprovado)
app.post('/api/webhook', async (req, res) => {
    const topic = req.query.topic || req.query.type;
    const id = req.query.id || req.query['data.id'];

    try {
        if (topic === 'payment') {
            const payment = await mercadopago.payment.get(id);
            const status = payment.body.status;
            const emailCliente = payment.body.payer.email;

            if (status === 'approved') {
                console.log(`Pagamento aprovado para: ${emailCliente}`);
                
                // DISPARAR E-MAIL COM A PLANILHA
                await enviarPlanilha(emailCliente);
            }
        }
        res.status(200).send();
    } catch (error) {
        console.error(error);
        res.status(500).send();
    }
});

// FUNÇÃO DE ENVIO DE E-MAIL
async function enviarPlanilha(destinatario) {
    const mailOptions = {
        from: '"GSA Group" <seuemail@gmail.com>',
        to: destinatario,
        subject: 'Sua Planilha Chegou! 🚀 - GSA Group',
        html: `
            <h1>Parabéns pela compra!</h1>
            <p>Aqui está a sua Planilha Precificação Pro.</p>
            <p>Baixe o anexo e comece a lucrar.</p>
            <p>Att, Equipe GSA Group.</p>
        `,
        attachments: [
            {
                filename: 'Precificacao_Pro_v1.xlsx',
                path: './arquivos/Precificacao_Pro_v1.xlsx' // Caminho do arquivo no servidor
            }
        ]
    };

    await transporter.sendMail(mailOptions);
    console.log('E-mail enviado com sucesso!');
}

app.listen(port, () => {
    console.log(`Servidor GSA rodando na porta ${port}`);
});