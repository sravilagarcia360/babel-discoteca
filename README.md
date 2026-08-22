<div align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png" alt="React Logo" width="80"/>
  <h1>Babel Discoteca — Command Center</h1>
  <p><strong>Sistema de Gestión Financiera y Operativa en Tiempo Real</strong></p>
  
  [![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Firebase](https://img.shields.io/badge/Firebase-10.0-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
  [![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
</div>

<br/>

Babel Discoteca no es solo un punto de venta; es un ecosistema digital diseñado como un **Command Center** integrado. Diseñado bajo estrictas normas de rendimiento y usabilidad, permite gestionar el flujo completo de venta de entradas y guardarropía con sincronización instantánea y exportación de datos elegante.

---

## 🌌 Filosofía de Diseño: Dualidad de Atmósfera Oscura

El entorno visual de Babel Discoteca abraza una **estética profunda y cinematográfica**.
Inspirado en interfaces de alto contraste (al estilo de *The Batman* y sistemas operativos móviles de vanguardia), el diseño oscila estrictamente entre el negro absoluto (`#000000`) y acentos de color vibrantes (Cyan, Rojo, Verde) para enfocar la concentración del operador.

* **Apple-Style Typography:** Uso exclusivo de tipografías legibles (Inter / San Francisco) sin distracciones.
* **Componentes Glassmorphism:** Paneles flotantes translúcidos que aportan un sentido de profundidad e inmersión tecnológica.
* **Dynamic Island UX:** Notificaciones flotantes en la parte superior central de la pantalla con animaciones fluidas y elásticas, asegurando una experiencia de usuario *premium*.

## 🚀 Arquitectura del Sistema

El desarrollo sigue un modelo de **Modularidad Ordenada**. El código y los recursos están estrictamente separados en un *Index jerárquico*, asegurando que cada pieza de lógica resida en su propia unidad funcional.

```text
src/
├── components/
│   ├── ui/
│   │   ├── NeonButton.jsx       # Botones táctiles con respuestas neumórficas/neón
│   │   └── StatsGrid.jsx        # Telemetría financiera en vivo
│   └── ficha/
│       ├── FichaQRMZ.jsx        # Lógica de cobros mediante QR (Fire & Forget)
│       └── FichaHistorialMZ.jsx # Tracker de historial y modificaciones
├── config/
│   └── firebase.js              # Enlace encriptado a la Base de Datos NoSQL
├── context/
│   └── ThemeContext.jsx         # Motor de inyección de tokens CSS (Dark Mode)
├── screens/
│   ├── LoginScreen.jsx          # Autenticación cifrada
│   ├── Dashboard.jsx            # Cajas: Flujos de compra múltiple y concurrencia
│   └── RendicionDeCuentas.jsx   # Auditoría y conciliación financiera avanzada
├── index.css                    # Diccionario de variables estéticas (Design System)
├── App.jsx                      # Router híbrido y Navbar Flotante
└── main.jsx                     # Core de React y Service Worker (PWA)
```

## ⚙️ Características Técnicas y Flujo Operativo

1. **Rendimiento Offline-First (PWA):** Construido para sobrevivir a la latencia. La app puede instalarse de forma nativa en dispositivos iOS/Android.
2. **Sincronización Firestore en Tiempo Real:** Las fichas QR generan alertas acústicas automáticas. La latencia es prácticamente nula.
3. **Flujo de Trabajo "Fire and Forget":** Optimizado para entornos nocturnos de alta presión. Las devoluciones o anulaciones son rápidas y mantienen la consistencia inmutable del talonario.
4. **Layout Híbrido Dinámico:** El sistema responde a la orientación del dispositivo. En tablets y posición apaisada (*landscape*), se activa automáticamente una cuadrícula de dos columnas optimizando el área de trabajo.
5. **Auditoría Exportable (jsPDF + SheetJS):** La pestaña de *Rendición* no solo guarda borradores localmente en memoria para prevenir pérdidas ante cortes de energía, sino que compila reportes apaisados en PDF con comprobantes QR incrustados para la gerencia.

---

> "El diseño no es solo cómo se ve y cómo se siente. El diseño es cómo funciona."
> — *Steve Jobs*

**@Sr.Avila**  
*Propósito: Crear ecosistemas digitales que transformen el caos operativo en un flujo de control absoluto y elegancia estética.*
