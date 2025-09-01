# Configuración de Firebase - ColSign

## 📋 Descripción

Firebase es el backend principal de ColSign, proporcionando autenticación, base de datos (Firestore), almacenamiento de archivos y reglas de seguridad. Esta guía te ayudará a configurar todos los servicios necesarios.

## 🚀 Configuración Paso a Paso

### 1. Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Crear un proyecto"
3. Ingresa el nombre del proyecto (ej: "colsign-app")
4. Habilita Google Analytics (opcional)
5. Selecciona tu cuenta de Google Analytics
6. Haz clic en "Crear proyecto"

### 2. Configurar Autenticación

#### Habilitar Google OAuth
1. En Firebase Console, ve a **Authentication**
2. Haz clic en "Get started"
3. Ve a la pestaña **Sign-in method**
4. Habilita **Google** como proveedor
5. Configura:
   - **Project support email**: Tu email
   - **Web SDK configuration**: Configura el dominio autorizado
6. Guarda la configuración

#### Configurar Dominios Autorizados
1. En Authentication > Settings > Authorized domains
2. Agrega:
   - `localhost` (para desarrollo)
   - `your-domain.vercel.app` (para producción)
   - `your-domain.com` (si tienes dominio personalizado)

### 3. Configurar Firestore Database

#### Crear Base de Datos
1. Ve a **Firestore Database**
2. Haz clic en "Create database"
3. Selecciona **Start in test mode** (cambiarás las reglas después)
4. Selecciona la ubicación más cercana a tus usuarios
5. Haz clic en "Done"

#### Configurar Reglas de Seguridad
Reemplaza las reglas por defecto con las siguientes reglas específicas del proyecto ColSign:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Permitir lectura y escritura si el usuario es el propietario del documento
      // o si el usuario autenticado tiene el roleId de administrador en Firestore
      allow read, write: if request.auth != null && (
        request.auth.uid == userId || 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roleId == 235463436 ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roleId == 1704565
      );
    }
    
    match /video_example/{document=**} {
      // Permite la lectura a cualquier usuario (autenticado o no)
      allow read: if true;

      // Mantén la escritura restringida solo para usuarios autenticados
      // y aquellos con los roleId específicos.
      allow write: if request.auth != null && (
        request.auth.uid == userId ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roleId == 235463436 ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roleId == 1704565
      );
    }
    
    match /sign_data/{document=**} {
      allow read, write: if request.auth != null && (
        request.auth.uid == userId || 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roleId == 235463436 ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roleId == 1704565
      );
    }
    
    match /user_opinion_app/{docId} {
      allow create: if request.auth != null;

      allow read: if request.auth != null && (
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roleId == 235463436 ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roleId == 1704565
      );
    }
    
    match /evaluates_sign/{evaluationId} {
      // Un usuario autenticado puede crear (escribir) una nueva evaluación para sí mismo.
      // Se asume que 'userId' es un campo dentro del documento 'evaluates_sign'.
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      
      // Un usuario solo puede leer sus propias evaluaciones.
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;

      // Solo los administradores (roleId 235463436 o 1704565) pueden actualizar o eliminar cualquier evaluación.
      allow update, delete: if request.auth != null && (
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roleId == 235463436 ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roleId == 1704565
      );
    }
  }
}
```

#### Explicación de las Reglas de Firestore

**Colección `users`:**
- Los usuarios pueden leer y escribir sus propios datos
- Los administradores (roleId: 235463436 o 1704565) pueden acceder a todos los usuarios

**Colección `video_example`:**
- Lectura pública (cualquier usuario puede ver los videos de ejemplo)
- Escritura restringida a propietarios y administradores

**Colección `sign_data`:**
- Acceso completo para propietarios y administradores
- Usuarios solo pueden gestionar sus propias contribuciones

**Colección `user_opinion_app`:**
- Cualquier usuario autenticado puede crear opiniones
- Solo administradores pueden leer todas las opiniones

**Colección `evaluates_sign`:**
- Usuarios pueden crear evaluaciones para sí mismos
- Usuarios solo pueden leer sus propias evaluaciones
- Solo administradores pueden actualizar o eliminar evaluaciones

### 4. Configurar Storage

#### Habilitar Storage
1. Ve a **Storage**
2. Haz clic en "Get started"
3. Selecciona **Start in test mode**
4. Selecciona la ubicación (debe ser la misma que Firestore)
5. Haz clic en "Done"

#### Configurar Reglas de Storage
Reemplaza las reglas por defecto con las siguientes reglas específicas del proyecto:

```javascript
rules_version = '2';

// Craft rules based on data in your Firestore database
// allow write: if firestore.get(
//    /databases/(default)/documents/users/$(request.auth.uid)).data.isAdmin;
service firebase.storage {
  match /b/{bucket}/o {
    match /video_examples/{allPaths=**} {
      allow read: if true; // Permite que cualquiera lea los archivos
      allow write: if request.auth != null; // Mantén la escritura solo para usuarios autenticados si es necesario
    }
    match /{folder}/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Explicación de las Reglas de Storage

**Carpeta `video_examples`:**
- Lectura pública (cualquier usuario puede acceder a los videos de ejemplo)
- Escritura restringida a usuarios autenticados

**Otras carpetas:**
- Acceso completo (lectura y escritura) para usuarios autenticados
- Protección general para todos los demás archivos

### 5. Obtener Configuración del Proyecto

#### Configuración Web
1. En Firebase Console, ve a **Project Settings** (ícono de engranaje)
2. En la pestaña **General**, desplázate hacia abajo
3. En **Your apps**, haz clic en el ícono web (</>)
4. Registra la app con un nombre (ej: "ColSign Web")
5. Copia la configuración que aparece

#### Variables de Entorno
Crea o actualiza tu archivo `.env.local` con los valores de la configuración:

```env
NEXT_PUBLIC_FIREBASE_APIKEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTHDOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECTID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGEBUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APPID=tu_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENTID=tu_measurement_id
```

### 6. Configurar Índices de Firestore

Para optimizar las consultas, crea los siguientes índices compuestos:

#### Índice para sign_data
- **Collection**: `sign_data`
- **Fields**:
  - `id_user` (Ascending)
  - `label` (Ascending)
  - `createdAt` (Descending)

#### Índice para video_example
- **Collection**: `video_example`
- **Fields**:
  - `type` (Ascending)
  - `status` (Ascending)
  - `name` (Ascending)

#### Índice para evaluates_sign
- **Collection**: `evaluates_sign`
- **Fields**:
  - `userId` (Ascending)
  - `evaluatedAt` (Descending)

### 7. Configurar Usuario Administrador

#### Crear Usuario Admin
1. Registra un usuario normal en la aplicación
2. En Firebase Console, ve a **Firestore Database**
3. Busca el documento del usuario en la colección `users`
4. Actualiza el campo `roleId` a uno de los valores de administrador:
   - `235463436` (Admin 1)
   - `1704565` (Admin 2)

```javascript
// Ejemplo de documento de usuario admin
{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@example.com",
  "roleId": 235463436, // o 1704565
  "levelId": 1,
  "createdAt": Timestamp,
  "status_tyc": true
}
```

## 🔧 Configuración Avanzada

### Configurar Analytics (Opcional)
1. En Firebase Console, ve a **Analytics**
2. Sigue las instrucciones para configurar Google Analytics
3. Actualiza `firebaseConfig.ts` para incluir analytics

### Configurar Performance Monitoring (Opcional)
1. Ve a **Performance**
2. Habilita Performance Monitoring
3. Configura las métricas que quieres monitorear

### Configurar Crashlytics (Opcional)
1. Ve a **Crashlytics**
2. Sigue las instrucciones para configurar el monitoreo de errores

## 🧪 Verificación de la Configuración

### 1. Verificar Autenticación
```javascript
// En la consola del navegador
import { auth } from '@/firebase/firebaseConfig';
console.log('Firebase Auth:', auth);
```

### 2. Verificar Firestore
```javascript
// En la consola del navegador
import { db } from '@/firebase/firebaseConfig';
console.log('Firestore DB:', db);
```

### 3. Verificar Storage
```javascript
// En la consola del navegador
import { storage } from '@/firebase/firebaseConfig';
console.log('Firebase Storage:', storage);
```

### 4. Probar Funcionalidades
1. Registra un usuario nuevo
2. Sube un archivo de video
3. Crea un documento en Firestore
4. Verifica que las reglas de seguridad funcionen

## 🚨 Problemas Comunes

### Error: "Firebase App named '[DEFAULT]' already exists"
- Asegúrate de que Firebase solo se inicialice una vez
- Verifica que no haya múltiples importaciones de `firebaseConfig`

### Error: "Permission denied"
- Verifica que las reglas de Firestore estén configuradas correctamente
- Asegúrate de que el usuario esté autenticado
- Verifica que el usuario tenga los permisos necesarios

### Error: "Storage bucket not found"
- Verifica que el `storageBucket` en las variables de entorno sea correcto
- Asegúrate de que Storage esté habilitado en Firebase Console

### Error: "Invalid API key"
- Verifica que la API key en las variables de entorno sea correcta
- Asegúrate de que las restricciones de la API key permitan tu dominio

## 📝 Próximos Pasos

Una vez que Firebase esté configurado:

1. **Probar Autenticación**: Verifica que el login funcione correctamente
2. **Configurar Datos Iniciales**: Crea algunos videos de ejemplo
3. **Probar Funcionalidades**: Verifica que todas las operaciones CRUD funcionen
4. **Configurar Monitoreo**: Habilita Analytics y Performance Monitoring

## 🔗 Enlaces Útiles

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Storage Rules](https://firebase.google.com/docs/storage/security)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

---

**Nota**: Recuerda cambiar las reglas de Firestore y Storage de "test mode" a "production mode" antes de desplegar en producción.
