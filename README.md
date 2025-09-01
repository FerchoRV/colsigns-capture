# ColSign - Sistema de Inclusión Social para Personas Sordas

## 📋 Descripción

ColSign es una plataforma web innovadora diseñada para facilitar la inclusión social de personas sordas en Colombia. El sistema utiliza tecnologías de inteligencia artificial y machine learning para el reconocimiento de lengua de señas colombiana (LSC), proporcionando herramientas de aprendizaje, evaluación y comunicación.

## ✨ Características Principales

- 🤖 **Reconocimiento de Señas en Tiempo Real**: Utiliza MediaPipe y TensorFlow.js para detectar y clasificar señas
- 📚 **Sistema de Aprendizaje**: Videos de ejemplo y ejercicios interactivos
- 📊 **Evaluación Automática**: Sistema de evaluación con feedback inmediato
- 👥 **Gestión de Usuarios**: Roles diferenciados (Admin, Usuario, Evaluador)
- 🔐 **Autenticación Segura**: Integración con Google OAuth
- 📱 **Interfaz Responsiva**: Diseño moderno y accesible
- 🎯 **Interprete LSC**: Prototipo de intérprete en tiempo real

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 15.1.7** - Framework de React con App Router
- **React 19.0.0** - Biblioteca de UI
- **TypeScript 5** - Tipado estático
- **Tailwind CSS 3.4.1** - Framework de CSS utility-first
- **Heroicons** - Iconografía moderna

### Backend y Servicios
- **Firebase 11.6.1** - Plataforma backend como servicio
  - Authentication (Google OAuth)
  - Firestore (Base de datos NoSQL)
  - Storage (Almacenamiento de archivos)
- **NextAuth 5.0.0-beta.25** - Autenticación adicional

### IA y Machine Learning
- **MediaPipe** - Detección de poses y manos en tiempo real
- **TensorFlow.js 4.22.0** - Machine Learning en el navegador
- **@tensorflow-models/handpose** - Modelo de detección de manos
- **API de Modelos LSC** - Servicio propio para clasificación de señas colombianas
  - **Repositorio**: [GitHub: models-lsc-api](https://github.com/FerchoRV/models-lsc-api)
  - **Tecnología**: Python + FastAPI + Docker
  - **Funcionalidades**: Reconocimiento de alfabeto, palabras y frases en LSC

### Utilidades
- **Axios 1.7.9** - Cliente HTTP
- **Zod 3.24.1** - Validación de esquemas
- **UUID 11.1.0** - Generación de identificadores únicos
- **pnpm** - Gestor de paquetes (recomendado)

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18.0.0 o superior
- pnpm 8.0.0 o superior (recomendado)
- Cuenta de Firebase
- Acceso a la API de modelos LSC

### Configuración Rápida

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd cap_data_sign
```

2. **Instalar dependencias**
```bash
pnpm install
```

3. **Configurar variables de entorno**
```bash
cp env.example .env.local
# Editar .env.local con tus configuraciones
```

4. **Configurar Firebase**
- Crear proyecto en Firebase Console
- Habilitar Authentication, Firestore y Storage
- Configurar reglas de seguridad (ver documentación)

5. **Configurar API de Modelos LSC**
- Configurar la variable `NEXT_PUBLIC_API_MODELS_URL`
- Para información detallada, consulta: [models-lsc-api](https://github.com/FerchoRV/models-lsc-api)

6. **Ejecutar el proyecto**
```bash
pnpm dev
```

## 📁 Estructura del Proyecto

```
cap_data_sign/
├── app/                          # App Router de Next.js
│   ├── components/               # Componentes compartidos
│   ├── profile/                  # Panel de usuario
│   ├── ui/                       # Componentes de UI
│   └── ...
├── firebase/                     # Configuración de Firebase
├── hooks/                        # Custom hooks
├── types/                        # Definiciones de tipos
└── docs/                         # Documentación completa
```

## 🔐 Sistema de Autenticación

### Roles de Usuario
- **Admin (RoleId: 1)**: Acceso completo al sistema
- **User (RoleId: 2)**: Funcionalidades básicas
- **Evaluator (RoleId: 3)**: Módulos de evaluación

### Flujo de Autenticación
1. Usuario hace clic en "Ingresar"
2. Se redirige a Google OAuth
3. Se verifica si es usuario nuevo o existente
4. Se redirige según el rol y estado del usuario

## 🤖 Funcionalidades Principales

### Reconocimiento de Señas
- **Captura en tiempo real** usando la cámara del dispositivo
- **Extracción de keypoints** con MediaPipe
- **Clasificación** mediante API de modelos LSC
- **Feedback inmediato** con resultados y confianza

### Sistema de Evaluación
- **Evaluación de Alfabeto**: Reconocimiento de letras individuales
- **Evaluación de Palabras**: Reconocimiento de palabras completas
- **Encuestas de Opinión**: Feedback de usuarios sobre el sistema

### Panel de Administración
- **Gestión de Usuarios**: Ver, editar y eliminar usuarios
- **Gestión de Contribuciones**: Moderar videos enviados por usuarios
- **Gestión de Señas**: Administrar videos de ejemplo

## 🔧 Configuración de Firebase

### Servicios Requeridos
- **Authentication**: Google OAuth habilitado
- **Firestore**: Base de datos NoSQL
- **Storage**: Almacenamiento de archivos

### Reglas de Seguridad
El proyecto incluye reglas específicas de seguridad para Firestore y Storage. Consulta la documentación completa en `docs/database/firebase-rules.md`.

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Desplegar automáticamente

### Otros Proveedores
- Netlify
- Firebase Hosting
- AWS Amplify

## 📚 Documentación

La documentación completa del proyecto está disponible en la carpeta `docs/`:

- **[Configuración Inicial](docs/setup/initial-setup.md)**
- **[Configuración de Firebase](docs/setup/firebase-setup.md)**
- **[Variables de Entorno](docs/setup/environment-variables.md)**
- **[Arquitectura del Sistema](docs/architecture/system-architecture.md)**
- **[API de Machine Learning](docs/ai/ml-api-integration.md)**
- **[Reglas de Firebase](docs/database/firebase-rules.md)**
- **[Guía de Desarrollo](docs/development/development-guide.md)**
- **[Troubleshooting](docs/maintenance/troubleshooting.md)**

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Contacto

- **Proyecto**: [ColSign Repository](https://github.com/your-username/cap_data_sign)
- **API de Modelos**: [models-lsc-api](https://github.com/FerchoRV/models-lsc-api)
- **Email**: [tu-email@example.com]

## 🙏 Agradecimientos

- Comunidad de personas sordas en Colombia
- Desarrolladores de MediaPipe y TensorFlow.js
- Equipo de Firebase por la infraestructura
- Contribuidores del proyecto

---

**Nota**: Para información técnica detallada sobre la API de modelos de lengua de señas colombianas, consulta el [repositorio oficial](https://github.com/FerchoRV/models-lsc-api).
