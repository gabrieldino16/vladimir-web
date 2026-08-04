<h1 align="center">Vladimir Krauchuk · Fotografía y Video</h1>

<p align="center">
  <b>Sitio web para un estudio de fotografía y video de eventos.</b><br>
  Galerías alimentadas desde SmugMug, sección de beneficios por QR y panel privado
  para generar presupuestos en PDF.
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white">
  <img alt="Tailwind" src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white">
  <img alt="Vercel" src="https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white">
</p>

---

## Sobre el proyecto

Sitio institucional para un fotógrafo de eventos (15 años, casamientos y eventos
empresariales). Además de mostrar el portfolio, resuelve dos necesidades
concretas del negocio:

1. **Campaña de tarjetas con QR.** Las tarjetas personales incluyen un código QR
   que lleva a una página exclusiva donde el cliente reclama un descuento. La
   solicitud llega por email al fotógrafo.
2. **Presupuestos rápidos.** Un panel privado donde el fotógrafo carga los datos
   del cliente, elige un pack (o arma uno a medida) y descarga un PDF con la
   identidad del estudio, listo para enviar.

## Características

- **Galerías dinámicas** — Las fotos se leen desde los álbumes públicos de
  SmugMug mediante su API, con revalidación periódica: cuando el fotógrafo sube
  material nuevo, aparece en la web sin necesidad de volver a publicarla.
- **Visor de fotos** — Ampliación a pantalla completa, navegación con teclado y
  bloqueo del scroll de fondo.
- **Sección de beneficio con acceso restringido** — Ruta no enlazada y excluida
  de los buscadores, pensada para que solo llegue quien escanea el QR.
- **Formularios con aviso por email** — Validación en el servidor, protección
  anti-spam mediante campo trampa y envío a través de Resend.
- **Panel privado** — Autenticación por usuario y contraseña con cookie firmada
  (HMAC), sin base de datos.
- **Generador de presupuestos en PDF** — Se arma en el navegador con jsPDF,
  respetando la identidad visual de la marca.
- **Precios reservados** — El catálogo incluye los valores de cada pack, pero
  nunca se exponen en las páginas públicas: se usan solo en el panel y el PDF.
- **Identidad propia** — Paleta y tipografías tomadas de la papelería del
  estudio. El isologo está construido en SVG, por lo que escala sin pérdida.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router, Server Components) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS 4 |
| Fotos | API de SmugMug |
| Emails | Resend |
| PDF | jsPDF |
| Deploy | Vercel |

## Estructura

```
app/
  page.tsx                    Portada
  galerias/[categoria]/       Galerías por tipo de evento
  packs/                      Servicios (sin precios)
  sobre-mi/  contacto/
  beneficio-vk/               Página del QR (ruta reservada, sin indexar)
  panel/                      Panel privado
  api/consulta/               Recepción de formularios
  api/panel/login/            Inicio y cierre de sesión
components/                   Interfaz reutilizable
lib/
  site.ts                     Datos de contacto y configuración
  packs.ts                    Catálogo de servicios y precios
  smugmug.ts                  Lectura de álbumes
  email.ts                    Envío de avisos
  auth.ts                     Sesión del panel
  pdf.ts                      Armado del presupuesto
```

## Puesta en marcha

```bash
npm install
cp .env.example .env.local     # completar las claves
npm run dev
```

La aplicación queda disponible en `http://localhost:3000`.

Las variables de entorno están documentadas en [`.env.example`](.env.example):
credenciales de SmugMug, de Resend y del panel. El sitio funciona sin ellas —
las galerías muestran un estado de "muy pronto" — lo que permite trabajar en el
diseño antes de conectar los servicios externos.

## Licencia

Proyecto desarrollado para un cliente. El código es de uso privado; las
fotografías y la identidad visual pertenecen a su autor.
