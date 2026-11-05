<div align="center">

  <img src="public/Logo_MiGusto_Experience.png" alt="Mi Gusto Experience Logo" width="340" />

  # 🎫 Golden Tickets · Mi Gusto Experience

  *Sistema exclusivo de validación de cupones, registro de ganadores y gestión de beneficios mensuales.*

  <br />

  [![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-%233ECF8E.svg?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

</div>

---

## 🌟 Sobre la Experiencia Golden Tickets

**Mi Gusto Golden Tickets** es una campaña promocional exclusiva de **Mi Gusto**. Dentro de los packs de 6 y 12 empanadas se distribuirán, de forma aleatoria, tickets especiales con un ID único y un código QR que redirige a esta plataforma.

Cada ticket premia al ganador con un **pack de 12 empanadas gratis al mes** durante el período de vigencia de su membresía:

<div align="center">

| Categoría | Beneficio Exclusivo | Duración |
| :---: | :--- | :---: |
| 🥇 **Ticket Gold** | **1 Pack de 12 empanadas gratis** por mes | **12 Meses** |
| 🥈 **Ticket Silver** | **1 Pack de 12 empanadas gratis** por mes | **6 Meses** |
| 🥉 **Ticket Bronze** | **1 Pack de 12 empanadas gratis** por mes | **3 Meses** |

</div>

---

## 🚀 Funcionalidades Principales

### 📱 `/` – Landing Base & Canje de Cupón
Diseñada para que los clientes interactúen, validen su código y activen su beneficio.
- **Selección de Nivel**: Elección entre membresías **Gold**, **Silver** y **Bronze**.
- **Validación en Tiempo Real**: Verificación del código `MGXXXXXXXX` contra la base de datos centralizada en Supabase.
- **Registro Seguro**: Asociación de datos personales (Nombre, Email, Teléfono, DNI) al ticket activado.
- **Información Transparente**: Secciones informativas con guía paso a paso, mapa interactivo de la sucursal y FAQ.

<br />

<div align="center">
  <img src="public/MGticketsDemo.gif" alt="Demo Landing y Canje" width="100%" />
</div>

<br />

### 🛡️ `/validacion` – Panel de Control y Validador por DNI
Herramienta interna optimizada para el uso del personal en sucursal.
- **Búsqueda por DNI**: Identificación rápida del titular y verificación del ticket asociado.
- **Control de Vencimiento**: Cálculo de vigencia y comprobación de canjes ya realizados en el mes en curso.
- **Registro Instantáneo**: Confirmación y guardado de canje mensual con un solo clic.

<br />

<div align="center">
  <img src="public/ValidacionDemo.png" alt="Demo Validador por DNI" width="100%" />
</div>

---

## 📸 Galería de Imágenes

<div align="center">

  <!-- Línea 1: 2x2 (Primera Fila) -->
  <p align="center">
    <img src="public/screenshots/Screenshot_1.png" width="49%" alt="Hero Principal - Mi Gusto Experience" />
    <img src="public/screenshots/Screenshot_2.png" width="49%" alt="Selección de Categorías de Tickets" />
  </p>

  <!-- Línea 2: 2x2 (Segunda Fila) -->
  <p align="center">
    <img src="public/screenshots/Screenshot_3.png" width="49%" alt="Detalle del Ticket Gold y Formulario de ID" />
    <img src="public/screenshots/Screenshot_4.png" width="49%" alt="Pasos de la Experiencia y Mapa de Sucursal" />
  </p>

  <!-- Línea 3: Una sola imagen -->
  <p align="center">
    <img src="public/screenshots/Screenshot_5.png" width="99%" alt="Sección de Preguntas Frecuentes (FAQ)" />
  </p>

</div>

---

## ⚙️ Instalación y Configuración Local

Sigue estos pasos para clonar y ejecutar el entorno de desarrollo en tu máquina local:

### 1. Prerrequisitos
- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- Gestor de paquetes: `npm`, `pnpm` o `yarn`
- Cuenta o instancia activa en [Supabase](https://supabase.com/)

### 2. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/GoldenTickets.git
cd GoldenTickets
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto basándote en tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-publica-anonima-supabase
```

> [!NOTE]
> Puedes inicializar la base de datos ejecutando los scripts SQL incluidos en el directorio `supabase/migrations/` directamente en el editor SQL de tu panel de Supabase.

### 5. Iniciar el servidor de desarrollo
```bash
npm run dev
```
La aplicación iniciará por defecto en `http://localhost:5173`.

### 🛠️ Scripts Disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local con recarga rápida (HMR). |
| `npm run build` | Compila y optimiza el proyecto para producción en la carpeta `dist`. |
| `npm run preview` | Previsualiza localmente el build compilado para producción. |
| `npm run typecheck` | Ejecuta la verificación estática de tipos con TypeScript sin emitir archivos. |
| `npm run lint` | Ejecuta ESLint para analizar errores y mantener consistencia de código. |

---

## 🔒 Licencia & Propiedad Intelectual

Todo el desarrollo, diseño y contenido se encuentran bajo los derechos exclusivos de **Mi Gusto** © 2026.  
*Queda prohibida su reproducción total o parcial sin autorización previa de la empresa.*


