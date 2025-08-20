# Documentación del Proyecto UnClickParaAlimentar

## Índice
1. [Introducción](#introducción)
2. [Requisitos Previos](#requisitos-previos)
3. [Instalación y Levantamiento en Desarrollo](#instalación-y-levantamiento-en-desarrollo)
4. [Variables de Entorno](#variables-de-entorno)
5. [Estructura del Proyecto](#estructura-del-proyecto)
6. [Flujo de Trabajo de Desarrollo](#flujo-de-trabajo-de-desarrollo)
7. [Despliegue en Producción (Vercel)](#despliegue-en-producción-vercel)
8. [Integraciones Clave](#integraciones-clave)
9. [Buenas Prácticas y Troubleshooting](#buenas-prácticas-y-troubleshooting)
10. [Referencias](#referencias)

---

## 1. Introducción
Este repositorio contiene el frontend de la plataforma **UnClickParaAlimentar**, desarrollado con [Next.js](https://nextjs.org/). El objetivo es facilitar donaciones y gestionar pagos a través de múltiples pasarelas, integrando servicios como Supabase, Payphone y PagoPlux.

## 2. Requisitos Previos
- Node.js >= 18.x
- npm >= 9.x (o yarn/pnpm/bun)
- Cuenta en [Vercel](https://vercel.com/) (para despliegue)
- Acceso a las variables de entorno necesarias (ver sección 4)

## 3. Instalación y Levantamiento en Desarrollo
1. **Clona el repositorio:**
   ```bash
   git clone <REPO_URL>
   cd UnClickParaAlimentar
   ```
2. **Instala dependencias:**
   ```bash
   npm install
   # o
   yarn install
   # o
   pnpm install
   # o
   bun install
   ```
3. **Configura las variables de entorno:**
   - Crea un archivo `.env.local` en la raíz del proyecto y define las variables necesarias (ver sección 4).
4. **Levanta el servidor de desarrollo:**
   ```bash
   npm run dev
   # o yarn dev, pnpm dev, bun dev
   ```
5. Accede a [http://localhost:3000](http://localhost:3000) para ver la aplicación.

## 4. Variables de Entorno
El proyecto requiere varias variables de entorno para funcionar correctamente, especialmente para integraciones externas:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_supabase
SUPABASE_CONNECTION_STRING=tu_connection_string_supabase

# API y Seguridad
NEXT_PUBLIC_API_URL=tu_url_backend_api
NEXT_PUBLIC_ENCRYPTION_KEY=clave_para_encriptacion

# Payphone
NEXT_PUBLIC_PAYPHONE_TOKEN=token_payphone
NEXT_PUBLIC_PAYPHONE_CURRENCY=USD
NEXT_PUBLIC_PAYPHONE_STORE_ID=store_id_payphone

# PagoPlux
# (Agregar aquí si se requieren variables específicas para PagoPlux)
```

> **Nota:** Nunca subas tus archivos `.env*` al repositorio. Están en el `.gitignore` por seguridad.

## 5. Estructura del Proyecto
- `src/app/` — Páginas, componentes y servicios principales.
- `src/components/` — Componentes reutilizables de UI y secciones.
- `src/lib/` — Utilidades y configuración de Supabase.
- `public/` — Recursos estáticos (imágenes, animaciones, etc).
- `next.config.ts` — Configuración de Next.js y variables de entorno.
- `package.json` — Dependencias y scripts.

## 6. Flujo de Trabajo de Desarrollo
- Utiliza ramas feature/bugfix para nuevos desarrollos.
- Haz commits descriptivos y realiza PRs para revisión.
- Ejecuta `npm run lint` antes de hacer push para mantener la calidad del código.
- El código se actualiza automáticamente en desarrollo gracias a Next.js.

## 7. Despliegue en Producción (Vercel)
El proyecto está desplegado en [Vercel](https://vercel.com/), lo que permite CI/CD automático:

### Proceso de despliegue
1. **Conecta el repositorio a Vercel:**
   - Desde el dashboard de Vercel, importa el repositorio desde GitHub.
2. **Configura las variables de entorno en Vercel:**
   - Ve a *Project Settings > Environment Variables* y agrega todas las variables listadas en la sección 4.
3. **Build & Output:**
   - Vercel detecta automáticamente Next.js y ejecuta `npm run build`.
   - El output se sirve como serverless functions y estáticos.
4. **Dominio personalizado:**
   - Puedes agregar dominios personalizados desde la configuración del proyecto en Vercel.

### Consideraciones
- Los archivos `.env*` **no** se suben a Vercel; debes configurarlos manualmente en el dashboard.
- El directorio `.vercel` y la carpeta `.next` están ignorados en git.
- El build ignora errores de TypeScript y ESLint en producción (`next.config.ts`).

## 8. Integraciones Clave
### Supabase
- Se utiliza para autenticación y almacenamiento de datos.
- Configuración en `src/lib/supabase.ts`.

### Payphone
- Integración de pagos con el botón `PayphoneButton`.
- Variables de entorno requeridas: `NEXT_PUBLIC_PAYPHONE_TOKEN`, `NEXT_PUBLIC_PAYPHONE_CURRENCY`, `NEXT_PUBLIC_PAYPHONE_STORE_ID`.
- El flujo de confirmación de pago se maneja en `src/app/services/paymentService.ts` y la página de confirmación.

### PagoPlux
- Integración de pagos con el botón `PluxButton` y configuración en `src/app/configuration/ppx.data.js` y `ppx.index.js`.
- El flujo de autorización y confirmación se maneja en el servicio de pagos y componentes relacionados.

## 9. Buenas Prácticas y Troubleshooting
- **Variables de entorno:** Si algo no funciona, revisa que todas las variables estén correctamente configuradas.
- **Errores de build en Vercel:** Verifica los logs en el dashboard de Vercel.
- **Integraciones de pago:** Consulta la documentación oficial de cada pasarela si hay errores inesperados.
- **Actualizaciones:** Mantén las dependencias actualizadas y revisa los avisos de seguridad de GitHub.

## 10. Referencias
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Payphone Docs](https://payphone.com.ec/developers)
- [PagoPlux Docs](https://pagoplux.com/) 