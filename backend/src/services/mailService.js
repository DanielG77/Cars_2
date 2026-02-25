const nodemailer = require('nodemailer');

class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'mailhog',
            port: process.env.SMTP_PORT || 1025,
            secure: false,
            requireTLS: false
        });
    }

    async sendIncidenciaStatusEmail(incidencia, status, adminEmail) {
        const statusText = status === 'accepted' ? 'ACEPTADA' : 'RECHAZADA';
        const statusColor = status === 'accepted' ? '#28a745' : '#dc3545';

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: ${statusColor}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h2>Incidencia ${statusText}</h2>
                </div>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
                    <p><strong>ID Incidencia:</strong> ${incidencia.id}</p>
                    <p><strong>Estado:</strong> ${statusText}</p>
                    <p><strong>Título:</strong> ${incidencia.titulo}</p>
                    <p><strong>Descripción:</strong> ${incidencia.descripcion || 'N/A'}</p>
                    <p><strong>Cliente ID:</strong> ${incidencia.cliente_id}</p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">Este correo fue generado automáticamente. No responda a este mensaje.</p>
                </div>
            </div>
        `;

        const textContent = `
Incidencia ${statusText}

ID Incidencia: ${incidencia.id}
Estado: ${statusText}
Título: ${incidencia.titulo}
Descripción: ${incidencia.descripcion || 'N/A'}
Cliente ID: ${incidencia.cliente_id}

---
Este correo fue generado automáticamente.
        `;

        try {
            await this.transporter.sendMail({
                from: process.env.ADMIN_EMAIL || 'admin@cartel-coches.local',
                to: adminEmail,
                subject: `Incidencia ${statusText} - ID ${incidencia.id}`,
                text: textContent,
                html: htmlContent
            });
            console.log(`✉️ Correo enviado a ${adminEmail} para incidencia ${incidencia.id}`);
            return true;
        } catch (error) {
            console.error('❌ Error enviando correo:', error);
            throw error;
        }
    }
}

module.exports = new MailService();
