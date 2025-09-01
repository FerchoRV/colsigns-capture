# Troubleshooting - ColSign

## 📋 Introducción

Esta guía te ayudará a resolver problemas comunes que pueden surgir durante el desarrollo, configuración y uso del proyecto ColSign.

## 🚨 Problemas de Configuración

### Error: "Module not found"

**Síntomas:**
```
Module not found: Can't resolve '@/firebase/firebaseConfig'
Error: Cannot find module 'next-auth'
```

**Soluciones:**

1. **Reinstalar dependencias:**
```bash
# Eliminar node_modules y reinstalar
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

2. **Verificar rutas de importación:**
```typescript
// ✅ Correcto
import { auth } from '@/firebase/firebaseConfig';

// ❌ Incorrecto
import { auth } from '../../firebase/firebaseConfig';
```

3. **Verificar tsconfig.json:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*","./app/*"]
    }
  }
}
```

### Error: "Firebase not initialized"

**Síntomas:**
```
Firebase: No Firebase App '[DEFAULT]' has been created
```

**Soluciones:**

1. **Verificar variables de entorno:**
```bash
# Verificar que .env.local existe y tiene las variables correctas
cat .env.local
```

2. **Verificar configuración de Firebase:**
```typescript
// firebase/firebaseConfig.ts
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN,
  // ... otras variables
};

// Verificar que todas las variables están definidas
console.log('Firebase Config:', firebaseConfig);
```

3. **Reiniciar servidor de desarrollo:**
```bash
# Detener el servidor (Ctrl+C) y reiniciar
pnpm dev
```

### Error: "Port 3000 already in use"

**Síntomas:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Soluciones:**

1. **Usar puerto diferente:**
```bash
pnpm dev --port 3001
```

2. **Encontrar y matar el proceso:**
```bash
# En Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# En macOS/Linux
lsof -ti:3000 | xargs kill -9
```

## 🔐 Problemas de Autenticación

### Error: "Google OAuth not working"

**Síntomas:**
```
Firebase: Error (auth/popup-closed-by-user)
Firebase: Error (auth/popup-blocked)
```

**Soluciones:**

1. **Verificar configuración de OAuth:**
   - Ir a Firebase Console > Authentication > Sign-in method
   - Verificar que Google está habilitado
   - Verificar dominios autorizados

2. **Agregar dominios autorizados:**
```
localhost
127.0.0.1
your-domain.vercel.app
```

3. **Verificar configuración de la aplicación:**
```typescript
// Verificar que la configuración es correcta
const provider = new GoogleAuthProvider();
provider.addScope('email');
provider.addScope('profile');
```

### Error: "Permission denied in Firestore"

**Síntomas:**
```
FirebaseError: Missing or insufficient permissions
```

**Soluciones:**

1. **Verificar reglas de Firestore:**
```javascript
// Reglas básicas para desarrollo
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

2. **Verificar que el usuario está autenticado:**
```typescript
import { auth } from '@/firebase/firebaseConfig';

// Verificar estado de autenticación
console.log('User:', auth.currentUser);
```

3. **Verificar roles de usuario:**
```typescript
// Verificar que el usuario tiene el rol correcto
const userDoc = await getDoc(doc(db, 'users', user.uid));
console.log('User role:', userDoc.data()?.roleId);
```

## 🤖 Problemas de IA y MediaPipe

### Error: "MediaPipe not loading"

**Síntomas:**
```
ReferenceError: Pose is not defined
ReferenceError: Hands is not defined
```

**Soluciones:**

1. **Verificar carga de scripts:**
```typescript
// Asegurar que los scripts se cargan antes de usar MediaPipe
useEffect(() => {
  const loadMediaPipe = async () => {
    if (typeof window.Pose === 'undefined') {
      // Cargar scripts dinámicamente
      await loadMediaPipeScripts();
    }
  };
  
  loadMediaPipe();
}, []);
```

2. **Verificar orden de carga:**
```html
<!-- En el head del documento -->
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"></script>
```

3. **Verificar tipos de MediaPipe:**
```typescript
// types/mediapipe-globals.d.ts
declare global {
  interface Window {
    Pose: any;
    Hands: any;
    Camera: any;
    drawConnectors: any;
    drawLandmarks: any;
    POSE_CONNECTIONS: any;
    HAND_CONNECTIONS: any;
  }
}
```

### Error: "Camera not working"

**Síntomas:**
```
getUserMedia() not supported
Camera permission denied
```

**Soluciones:**

1. **Verificar permisos de cámara:**
```typescript
// Solicitar permisos explícitamente
const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 }
  }
});
```

2. **Manejar errores de permisos:**
```typescript
try {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
} catch (error) {
  if (error.name === 'NotAllowedError') {
    alert('Permiso de cámara denegado. Por favor, habilita la cámara.');
  } else if (error.name === 'NotFoundError') {
    alert('No se encontró ninguna cámara.');
  }
}
```

3. **Verificar HTTPS:**
   - La cámara requiere HTTPS en producción
   - En desarrollo local, localhost funciona sin HTTPS

### Error: "API ML not responding"

**Síntomas:**
```
Request timeout
Network error
```

**Soluciones:**

1. **Verificar URL de la API:**
```typescript
// Verificar que la URL es correcta
const API_URL = process.env.NEXT_PUBLIC_API_MODELS_URL;
console.log('API URL:', API_URL);
```

2. **Agregar timeout y retry:**
```typescript
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_MODELS_URL,
  timeout: 30000, // 30 segundos
  retry: 3,
  retryDelay: 1000
});
```

3. **Manejar errores de red:**
```typescript
try {
  const response = await api.post('/recognize', data);
  return response.data;
} catch (error) {
  if (error.code === 'ECONNABORTED') {
    console.error('Request timeout');
  } else if (error.response) {
    console.error('API Error:', error.response.data);
  } else {
    console.error('Network Error:', error.message);
  }
  throw error;
}
```

## 📊 Problemas de Base de Datos

### Error: "Firestore connection failed"

**Síntomas:**
```
FirebaseError: Failed to get document
```

**Soluciones:**

1. **Verificar conexión a internet**
2. **Verificar configuración de Firestore:**
```typescript
// Verificar que Firestore está inicializado
import { db } from '@/firebase/firebaseConfig';
console.log('Firestore instance:', db);
```

3. **Verificar reglas de Firestore:**
```javascript
// Reglas para desarrollo
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Solo para desarrollo
    }
  }
}
```

### Error: "Storage upload failed"

**Síntomas:**
```
FirebaseError: Storage/unauthorized
```

**Soluciones:**

1. **Verificar reglas de Storage:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

2. **Verificar tamaño del archivo:**
```typescript
// Verificar tamaño antes de subir
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

if (file.size > MAX_FILE_SIZE) {
  throw new Error('Archivo demasiado grande');
}
```

3. **Verificar tipo de archivo:**
```typescript
// Verificar tipo de archivo
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error('Tipo de archivo no permitido');
}
```

## 🎨 Problemas de UI

### Error: "Tailwind CSS not working"

**Síntomas:**
```
Estilos de Tailwind no se aplican
```

**Soluciones:**

1. **Verificar configuración de Tailwind:**
```javascript
// tailwind.config.ts
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

2. **Verificar importación de CSS:**
```typescript
// app/layout.tsx
import '@/app/ui/global.css';
```

3. **Reiniciar servidor de desarrollo:**
```bash
pnpm dev
```

### Error: "Component not rendering"

**Síntomas:**
```
Componente no se muestra
Error en consola
```

**Soluciones:**

1. **Verificar errores en consola:**
   - Abrir DevTools (F12)
   - Revisar pestaña Console
   - Buscar errores de JavaScript

2. **Verificar props del componente:**
```typescript
// Agregar PropTypes o TypeScript interfaces
interface ComponentProps {
  title: string;
  onClick?: () => void;
}

export function MyComponent({ title, onClick }: ComponentProps) {
  return <div onClick={onClick}>{title}</div>;
}
```

3. **Verificar estado del componente:**
```typescript
// Agregar logs para debugging
useEffect(() => {
  console.log('Component mounted');
  console.log('Props:', props);
  console.log('State:', state);
}, []);
```

## 🚀 Problemas de Despliegue

### Error: "Build failed"

**Síntomas:**
```
Build error in Vercel/Netlify
TypeScript compilation failed
```

**Soluciones:**

1. **Verificar errores de TypeScript:**
```bash
# Verificar tipos localmente
pnpm tsc --noEmit
```

2. **Verificar variables de entorno:**
   - Verificar que todas las variables están configuradas en el hosting
   - Verificar que las variables tienen el prefijo `NEXT_PUBLIC_` si son necesarias en el cliente

3. **Verificar dependencias:**
```bash
# Verificar que todas las dependencias están en package.json
pnpm install
pnpm build
```

### Error: "Environment variables not found"

**Síntomas:**
```
process.env.NEXT_PUBLIC_FIREBASE_APIKEY is undefined
```

**Soluciones:**

1. **Verificar variables en Vercel:**
   - Ir a Vercel Dashboard > Project > Settings > Environment Variables
   - Verificar que todas las variables están configuradas
   - Verificar que están asignadas al entorno correcto (Production, Preview, Development)

2. **Verificar variables en Netlify:**
   - Ir a Netlify Dashboard > Site settings > Environment variables
   - Agregar todas las variables necesarias

3. **Verificar prefijos:**
```bash
# Variables que deben estar disponibles en el cliente
NEXT_PUBLIC_FIREBASE_APIKEY=xxx
NEXT_PUBLIC_FIREBASE_AUTHDOMAIN=xxx

# Variables solo del servidor (sin NEXT_PUBLIC_)
DATABASE_URL=xxx
API_SECRET=xxx
```

## 🔍 Debugging Avanzado

### Herramientas de Debugging

1. **React Developer Tools:**
   - Instalar extensión del navegador
   - Usar para inspeccionar componentes y props

2. **Firebase Console:**
   - Verificar logs de autenticación
   - Verificar datos de Firestore
   - Verificar archivos en Storage

3. **Chrome DevTools:**
   - Network tab para verificar requests
   - Console para logs y errores
   - Application tab para verificar localStorage/sessionStorage

### Logs Útiles

```typescript
// Agregar logs para debugging
console.log('🔍 Debug Info:', {
  user: auth.currentUser,
  firebaseConfig: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_APIKEY ? 'Set' : 'Not set',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECTID
  },
  apiUrl: process.env.NEXT_PUBLIC_API_MODELS_URL
});
```

## 📞 Obtener Ayuda

### Antes de Reportar un Problema

1. **Verificar esta guía** para problemas comunes
2. **Buscar en issues** del repositorio
3. **Verificar logs** de la consola
4. **Probar en modo incógnito** para descartar problemas de caché

### Reportar un Problema

Al reportar un problema, incluye:

1. **Descripción detallada** del problema
2. **Pasos para reproducir** el error
3. **Logs de error** completos
4. **Información del entorno:**
   - Navegador y versión
   - Sistema operativo
   - Versión de Node.js
   - Versión de pnpm/npm

5. **Capturas de pantalla** si es relevante

### Recursos Adicionales

- [Next.js Troubleshooting](https://nextjs.org/docs/advanced-features/debugging)
- [Firebase Support](https://firebase.google.com/support)
- [MediaPipe Issues](https://github.com/google/mediapipe/issues)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

**Nota**: Esta guía se actualiza regularmente. Si encuentras un problema que no está cubierto aquí, considera contribuir agregando la solución.
