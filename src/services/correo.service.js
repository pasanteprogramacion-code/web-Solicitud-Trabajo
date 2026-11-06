const { readFileSync } = require('node:fs');
const path = require('node:path');

const logo = readFileSync(path.join(__dirname, '../../public/assets/img/romero-logo.png')).toString('base64');

async function enviarCodigo(correo, codigo) {
    const texto = `Ingresá el código ${codigo} en el portal de postulaciones de Romero Panificados. Es de un solo uso y vence en 10 minutos. Si no solicitaste este acceso, podés ignorar el mensaje.`;

    const html = `
    <div lang="es" style="background:#faf8f3; padding:24px 12px; font:16px/1.6 Arial,sans-serif; color:#292923">
      <div style="max-width:480px; margin:auto; background:white; border-top:4px solid #e2af40; padding:28px">
        <img src="cid:romero" alt="Romero Panificados" width="150">
        <h1 style="font-size:23px; color:#8c2929">Verificación de correo</h1>
        <p>Ingresá este código en la página donde solicitaste el acceso al portal de postulaciones.</p>
        <p style="font-size:32px; font-weight:bold; letter-spacing:5px; text-align:center; background:#faf8f3; padding:12px">${codigo}</p>
        <p>El código es de un solo uso y vence en <strong> 10 minutos </strong>. No lo compartas.</p>
        <p style="font-size:14px; color:#59564f"> Si no solicitaste este acceso, podés ignorar este mensaje. </p>
      </div>
    </div>`;
    const respuesta = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [correo],
            subject: 'Código de acceso — Romero Panificados', html, text: texto,
            attachments: [{ filename: 'romero.png', content: logo, content_id: 'romero' }] }),
        signal: AbortSignal.timeout(12000)
    });
    if (!respuesta.ok) throw new Error('Resend HTTP ' + respuesta.status);
}

module.exports = { enviarCodigo };
