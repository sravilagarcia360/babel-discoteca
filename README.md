# Babel Discoteca - Command Center

Babel Discoteca es una aplicación web interactiva diseñada para la gestión financiera y operativa en tiempo real de una discoteca. Actúa como un **Command Center** altamente responsivo y robusto, conectando la entrada de datos en punto de venta con un ecosistema de rendición de cuentas integral.

## Arquitectura del Proyecto

El sistema ha sido desarrollado bajo un enfoque modular escalable utilizando **React 19**, **Vite** y **TailwindCSS**, optimizado como una Aplicación Web Progresiva (PWA) de alto rendimiento.

```text
src/
├── components/
│   └── ui/
│       ├── NeonButton.jsx      # Botones interactivos reutilizables con efectos Neón
│       └── StatsGrid.jsx       # Cuadrícula estadística de cobros e ingresos
├── config/
│   └── firebase.js             # Configuración y seguridad de Firebase
├── context/
│   └── ThemeContext.jsx        # Proveedor global para el ecosistema Dark/Light
├── screens/
│   ├── LoginScreen.jsx         # Interfaz de autenticación y seguridad
│   ├── Dashboard.jsx           # Panel central de control, cobros y flujos híbridos
│   └── RendicionDeCuentas.jsx  # Exportación y cuadre de caja (PDF/Excel)
├── App.jsx                     # Enrutador principal e integración de UI global
└── main.jsx                    # Punto de entrada de React e inicialización PWA
```

## Características Principales

* **Aplicación Web Progresiva (PWA):** Arquitectura instalable con service workers que garantiza la experiencia fluida de una aplicación nativa.
* **Dualidad de Atmósfera (Modo Dark/Light):** Una paleta visual inmersiva que oscila entre un diseño cinematográfico oscuro ("The Batman", negro y rojo/neón) y un modo diurno "Azul Marino Profundo", garantizando legibilidad y elegancia constante.
* **Sincronización en Tiempo Real y Alertas Acústicas:** Respaldado por Firebase Firestore para una latencia casi nula entre cajas. Las nuevas órdenes por QR emiten alertas sonoras optimizadas para ecosistemas nocturnos ruidosos.
* **UX de Alta Legibilidad y Híbrida:** Diseño responsivo que reacciona a la rotación del dispositivo. En tablets y monitores (Landscape), el sistema unifica historiales y colas pendientes para lograr un control absoluto sin navegación excesiva.
* **Sistema Multi-Talonario Integrado:** Múltiples flujos de venta en paralelo, control de "estados en espera", selecciones masivas de fichas, y carga múltiple de imágenes de comprobantes.
* **Rendición de Cuentas Elegante:** Exportación precisa de estadísticas y datos hacia hojas de cálculo de formato elegante (SheetJS) y recibos en PDF (jsPDF), estructurando primero el flujo de efectivo antes que transacciones digitales.

## Tecnologías

* **Frontend:** React 19 + Vite + Vite PWA Plugin
* **Estilado:** TailwindCSS con utilidades customizadas
* **Tipografía:** Stack tipográfico de Apple (San Francisco, Inter) para jerarquía visual perfecta
* **Backend as a Service:** Firebase (Auth, Firestore con caché persistente)
* **Procesamiento de Exportaciones:** jsPDF, SheetJS
* **Iconografía UI:** Lucide React

---

> "El diseño no es solo lo que se ve y se siente. El diseño es cómo funciona."
> — *Steve Jobs*

**@Sr.Avila**  
*Propósito: Crear ecosistemas digitales que transformen el caos operativo en un flujo de control absoluto y elegancia estética.*
