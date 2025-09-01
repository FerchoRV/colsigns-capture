# Variables de Entorno - ColSign

## 📋 Descripción

Este documento describe todas las variables de entorno utilizadas en el proyecto ColSign. Estas variables deben configurarse en el archivo `.env.local` para el desarrollo local y en las variables de entorno del proveedor de hosting para producción.

## 🔧 Configuración del Archivo

### Ubicación del Archivo
Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# En la raíz del proyecto
touch .env.local
```

### Estructura del Archivo
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_APIKEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTHDOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECTID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGEBUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID=your_sender_id
NEXT_PUBLIC_FIREBASE_APPID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENTID=your_measurement_id

# Application Roles
NEXT_PUBLIC_APP_ROLE_1=235463436
NEXT_PUBLIC_APP_ROLE_2=1704565
NEXT_PUBLIC_APP_ROLE_3=3

# API Configuration
NEXT_PUBLIC_API_MODELS_URL=your_api_url_here
```

## 🔐 Variables de Firebase

### NEXT_PUBLIC_FIREBASE_APIKEY
- **Descripción**: Clave de API de Firebase para autenticación y autorización
- **Tipo**: String
- **Ejemplo**: `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Obtener**: Firebase Console > Project Settings > General > Web API Key

### NEXT_PUBLIC_FIREBASE_AUTHDOMAIN
- **Descripción**: Dominio de autenticación de Firebase
- **Tipo**: String
- **Ejemplo**: `your-project.firebaseapp.com`
- **Obtener**: Firebase Console > Project Settings > General > Project ID

### NEXT_PUBLIC_FIREBASE_PROJECTID
- **Descripción**: ID único del proyecto de Firebase
- **Tipo**: String
- **Ejemplo**: `colsign-app-12345`
- **Obtener**: Firebase Console > Project Settings > General > Project ID

### NEXT_PUBLIC_FIREBASE_STORAGEBUCKET
- **Descripción**: Bucket de almacenamiento de Firebase
- **Tipo**: String
- **Ejemplo**: `your-project.appspot.com`
- **Obtener**: Firebase Console > Project Settings > General > Storage bucket

### NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID
- **Descripción**: ID del remitente para Firebase Cloud Messaging
- **Tipo**: String
- **Ejemplo**: `123456789012`
- **Obtener**: Firebase Console > Project Settings > General > Cloud Messaging

### NEXT_PUBLIC_FIREBASE_APPID
- **Descripción**: ID único de la aplicación de Firebase
- **Tipo**: String
- **Ejemplo**: `1:123456789012:web:abcdef1234567890`
- **Obtener**: Firebase Console > Project Settings > General > App ID

### NEXT_PUBLIC_FIREBASE_MEASUREMENTID
- **Descripción**: ID de medición para Google Analytics (opcional)
- **Tipo**: String
- **Ejemplo**: `G-XXXXXXXXXX`
- **Obtener**: Firebase Console > Project Settings > General > Measurement ID

## 👥 Variables de Roles de Usuario

### NEXT_PUBLIC_APP_ROLE_1
- **Descripción**: ID del primer rol de administrador
- **Tipo**: Number
- **Valor**: `235463436`
- **Permisos**: Acceso completo al sistema, gestión de usuarios, moderación de contenido, acceso a todas las colecciones de Firestore

### NEXT_PUBLIC_APP_ROLE_2
- **Descripción**: ID del segundo rol de administrador
- **Tipo**: Number
- **Valor**: `1704565`
- **Permisos**: Acceso completo al sistema, gestión de usuarios, moderación de contenido, acceso a todas las colecciones de Firestore

### NEXT_PUBLIC_APP_ROLE_3
- **Descripción**: ID del rol de usuario regular
- **Tipo**: Number
- **Valor**: `3`
- **Permisos**: Acceso a funcionalidades básicas, envío de señas, evaluación, acceso limitado a sus propios datos

## 🤖 Variables de API

### NEXT_PUBLIC_API_MODELS_URL
- **Descripción**: URL base de la API de machine learning para reconocimiento de señas
- **Tipo**: String
- **Ejemplo**: `https://api.colsign.com/v1/models`
- **Uso**: Envío de datos de keypoints para clasificación de señas

## 🔒 Variables de Seguridad (Futuras)

### Variables Potenciales para Implementar

```env
# JWT Secret (para NextAuth)
NEXTAUTH_SECRET=your_jwt_secret_here
NEXTAUTH_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com

# Database Connection (si se migra a otra DB)
DATABASE_URL=your_database_url

# Email Service (para notificaciones)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## 🌍 Configuración por Entorno

### Desarrollo Local (.env.local)
```env
# Firebase Configuration (Development)
NEXT_PUBLIC_FIREBASE_APIKEY=dev_api_key
NEXT_PUBLIC_FIREBASE_AUTHDOMAIN=dev-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECTID=dev-project-id
NEXT_PUBLIC_FIREBASE_STORAGEBUCKET=dev-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID=123456789012
NEXT_PUBLIC_FIREBASE_APPID=1:123456789012:web:dev1234567890
NEXT_PUBLIC_FIREBASE_MEASUREMENTID=G-DEVXXXXXXXX

# Application Roles
NEXT_PUBLIC_APP_ROLE_1=235463436
NEXT_PUBLIC_APP_ROLE_2=1704565
NEXT_PUBLIC_APP_ROLE_3=3

# API Configuration (Development)
NEXT_PUBLIC_API_MODELS_URL=https://dev-api.colsign.com/v1/models
```

### Producción (Variables de Entorno del Hosting)
```env
# Firebase Configuration (Production)
NEXT_PUBLIC_FIREBASE_APIKEY=prod_api_key
NEXT_PUBLIC_FIREBASE_AUTHDOMAIN=prod-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECTID=prod-project-id
NEXT_PUBLIC_FIREBASE_STORAGEBUCKET=prod-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID=123456789012
NEXT_PUBLIC_FIREBASE_APPID=1:123456789012:web:prod1234567890
NEXT_PUBLIC_FIREBASE_MEASUREMENTID=G-PRODXXXXXXXX

# Application Roles
NEXT_PUBLIC_APP_ROLE_1=235463436
NEXT_PUBLIC_APP_ROLE_2=1704565
NEXT_PUBLIC_APP_ROLE_3=3

# API Configuration (Production)
NEXT_PUBLIC_API_MODELS_URL=https://api.colsign.com/v1/models
```

## 🔧 Configuración en Diferentes Plataformas

### Vercel
1. Ve a tu proyecto en Vercel Dashboard
2. Ve a Settings > Environment Variables
3. Agrega cada variable con su valor correspondiente
4. Selecciona los entornos (Production, Preview, Development)

### Netlify
1. Ve a tu sitio en Netlify Dashboard
2. Ve a Site settings > Environment variables
3. Agrega cada variable con su valor correspondiente

### Firebase Hosting
1. Usa Firebase CLI para configurar variables
2. O configura en la consola de Firebase

## 🚨 Validación de Variables

### Script de Validación
Crea un script para validar que todas las variables estén configuradas:

```javascript
// scripts/validate-env.js
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_APIKEY',
  'NEXT_PUBLIC_FIREBASE_AUTHDOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECTID',
  'NEXT_PUBLIC_FIREBASE_STORAGEBUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID',
  'NEXT_PUBLIC_FIREBASE_APPID',
  'NEXT_PUBLIC_APP_ROLE_1',
  'NEXT_PUBLIC_APP_ROLE_2',
  'NEXT_PUBLIC_APP_ROLE_3',
  'NEXT_PUBLIC_API_MODELS_URL'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variables de entorno faltantes:', missingVars);
  process.exit(1);
}

console.log('✅ Todas las variables de entorno están configuradas');
```

### Agregar al package.json
```json
{
  "scripts": {
    "validate-env": "node scripts/validate-env.js",
    "predev": "npm run validate-env",
    "prebuild": "npm run validate-env"
  }
}
```

## 🔍 Debugging de Variables

### Verificar Variables en el Cliente
```javascript
// En cualquier componente
console.log('Firebase Config:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECTID
});
```

### Verificar Variables en el Servidor
```javascript
// En API routes o Server Components
console.log('Server Environment:', {
  apiUrl: process.env.NEXT_PUBLIC_API_MODELS_URL,
  role1: process.env.NEXT_PUBLIC_APP_ROLE_1,
  role2: process.env.NEXT_PUBLIC_APP_ROLE_2
});
```

## 📝 Notas Importantes

### Variables NEXT_PUBLIC_
- Solo las variables que comienzan con `NEXT_PUBLIC_` están disponibles en el cliente
- Las variables sin este prefijo solo están disponibles en el servidor
- Nunca expongas secretos del servidor con el prefijo `NEXT_PUBLIC_`

### Seguridad
- Nunca commits el archivo `.env.local` al repositorio
- Usa diferentes valores para desarrollo y producción
- Rota las claves de API regularmente
- Usa restricciones de dominio en las claves de Firebase

### Performance
- Las variables de entorno se inyectan en tiempo de compilación
- Cambios en las variables requieren un rebuild de la aplicación
- Usa variables de entorno para configuraciones que cambien entre entornos

## 🔗 Enlaces Útiles

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Firebase Configuration](https://firebase.google.com/docs/web/setup#config-object)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Nota**: Mantén este archivo actualizado cuando agregues nuevas variables de entorno al proyecto.
