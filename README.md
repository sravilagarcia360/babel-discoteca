# Babel Discoteca - Command Center

Babel Discoteca es una aplicación web interactiva diseñada para la gestión financiera y operativa en tiempo real de una discoteca. Actúa como un **Command Center** altamente responsivo y robusto, conectando la entrada de datos en el punto de venta con un ecosistema de rendición de cuentas integral.

## Arquitectura del Proyecto

El sistema ha sido desarrollado bajo un enfoque modular escalable utilizando **React 19**, **Vite** y **TailwindCSS**, optimizado como una Aplicación Web Progresiva (PWA) de alto rendimiento.

```text
src/
├── components/
│   ├── ui/
│   │   ├── NeonButton.jsx      # Botones interactivos reutilizables con efectos
│   │   └── StatsGrid.jsx       # Cuadrícula estadística de cobros e ingresos
│   └── ficha/
│       ├── FichaQRMZ.jsx       # Componente extraído de tarjeta QR
│       └── FichaHistorialMZ.jsx # Componente extraído de historial
├── config/
│   └── firebase.js             # Configuración y seguridad de Firebase
├── context/
│   └── ThemeContext.jsx        # Proveedor global para el ecosistema Dark/Light
├── screens/
│   ├── LoginScreen.jsx         # Interfaz de autenticación y seguridad
│   ├── Dashboard.jsx           # Panel central de control, cobros y flujos híbridos
│   └── RendicionDeCuentas.jsx  # Gestión avanzada y cuadre de caja manual
├── index.css                   # Sistema de diseño, tokens CSS y variables de tema
├── App.jsx                     # Enrutador principal e integración de UI global
└── main.jsx                    # Punto de entrada de React e inicialización PWA
```

## Características Principales

* **Aplicación Web Progresiva (PWA):** Arquitectura instalable con service workers que garantiza la experiencia fluida de una aplicación nativa.
* **Dualidad de Atmósfera y Estética Apple:** Una paleta visual inmersiva de negro absoluto (`#000000`) y acentos de color vibrantes, con tipografía Inter, esquinas redondeadas y notificaciones tipo "Dynamic Island".
* **Sincronización en Tiempo Real y Alertas Acústicas:** Respaldado por Firebase Firestore para una latencia casi nula. Las nuevas órdenes por QR emiten alertas sonoras.
* **Layout Híbrido Optimizado:** Diseño responsivo para modo retrato (vertical) y apaisado (landscape) con vistas a dos columnas desde 640px, permitiendo usar tablets o móviles cómodamente sin sacrificar contexto visual.
* **Sistema Multi-Talonario Integrado:** Múltiples flujos de venta, control de "estados en espera", selección masiva de fichas, y un flujo UX "Fire and Forget".
* **Rendición de Cuentas Elegante:** Exportación rediseñada de PDFs en formato apaisado con 4 tarjetas de resumen visuales, subtotales separados por método de pago, y comprobantes QR incrustados.

## Tecnologías

* **Frontend:** React 19 + Vite + Vite PWA Plugin
* **Estilado:** TailwindCSS + Variables Nativas CSS (`var(--color-bg)`)
* **Tipografía:** Inter (Google Fonts) y tipografías nativas de Apple (San Francisco)
* **Backend as a Service:** Firebase (Auth, Firestore con caché persistente)
* **Procesamiento de Exportaciones:** jsPDF, SheetJS
* **Iconografía UI:** Lucide React

---

> "Cualquier tonto puede escribir código que un ordenador entienda. Los buenos programadores escriben código que los humanos puedan entender."
> — *Martin Fowler*

**@Sr.Avila**  
*Propósito: Crear ecosistemas digitales que transformen el caos operativo en un flujo de control absoluto y elegancia estética.*
