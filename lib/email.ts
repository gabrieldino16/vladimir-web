/**
 * Envío de avisos por email con Resend.
 *
 * Variables de entorno necesarias (ver .env.example):
 *   RESEND_API_KEY  clave de la cuenta de Resend
 *   EMAIL_DESTINO   casilla del fotógrafo, donde llegan las consultas
 *   EMAIL_DESDE     remitente verificado en Resend (ej. web@sudominio.com)
 */
import { Resend } from "resend";

export type Consulta = {
  nombre: string;
  email: string;
  telefono?: string;
  tipoEvento?: string;
  fechaEvento?: string;
  mensaje?: string;
  /** true si viene de la sección del QR (para distinguir los reclamos). */
  esBeneficio?: boolean;
};

export function faltaConfigEmail(): string | null {
  if (!process.env.RESEND_API_KEY) return "Falta RESEND_API_KEY";
  if (!process.env.EMAIL_DESTINO) return "Falta EMAIL_DESTINO";
  return null;
}

function fila(etiqueta: string, valor?: string) {
  if (!valor) return "";
  return `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #eee;color:#777;white-space:nowrap">${etiqueta}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #eee;color:#111"><strong>${escapar(valor)}</strong></td>
    </tr>`;
}

/** Evita que el contenido del formulario rompa o inyecte HTML en el email. */
function escapar(texto: string) {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function enviarConsulta(consulta: Consulta) {
  const falta = faltaConfigEmail();
  if (falta) throw new Error(falta);

  const resend = new Resend(process.env.RESEND_API_KEY);
  const titulo = consulta.esBeneficio
    ? "🎁 Alguien reclamó el beneficio del 20% OFF"
    : "Nueva consulta desde la web";

  const html = `
  <div style="font-family:system-ui,Segoe UI,Arial,sans-serif;background:#f6f6f6;padding:24px">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e6e6e6">
      <div style="background:#0a0a0a;padding:22px 24px">
        <p style="margin:0;color:#c9a24a;font-size:12px;letter-spacing:3px">VLADIMIR KRAUCHUK</p>
        <h1 style="margin:8px 0 0;color:#fff;font-size:19px;font-weight:600">${titulo}</h1>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${fila("Nombre", consulta.nombre)}
        ${fila("Email", consulta.email)}
        ${fila("Teléfono", consulta.telefono)}
        ${fila("Tipo de evento", consulta.tipoEvento)}
        ${fila("Fecha del evento", consulta.fechaEvento)}
        ${fila("Mensaje", consulta.mensaje)}
      </table>
      ${
        consulta.esBeneficio
          ? `<p style="margin:0;padding:16px 24px;background:#fdf6e3;color:#8c6d2a;font-size:13px">
               Reclamo del beneficio de la tarjeta personal (20% OFF).
             </p>`
          : ""
      }
      <p style="margin:0;padding:16px 24px;color:#999;font-size:12px;border-top:1px solid #eee">
        Enviado desde el sitio web.
      </p>
    </div>
  </div>`;

  return resend.emails.send({
    from: process.env.EMAIL_DESDE || "Web <onboarding@resend.dev>",
    to: [process.env.EMAIL_DESTINO!],
    replyTo: consulta.email,
    subject: `${titulo} — ${consulta.nombre}`,
    html,
  });
}
