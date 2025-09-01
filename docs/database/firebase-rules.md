# Reglas de Firebase - ColSign

## 📋 Descripción

Este documento detalla las reglas de seguridad implementadas en Firebase Firestore y Storage para el proyecto ColSign. Estas reglas garantizan que los usuarios solo puedan acceder a los datos que les corresponden y que los administradores tengan los permisos necesarios para gestionar el sistema.

## 🔐 Roles de Usuario

### Administradores
- **RoleId 235463436**: Primer administrador
- **RoleId 1704565**: Segundo administrador

### Usuarios Regulares
- **RoleId 3**: Usuario estándar con acceso limitado

## 🗄️ Reglas de Firestore

### Configuración General
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas específicas por colección
  }
}
```

### Colección: `users`

**Propósito**: Almacena información de usuarios del sistema.

**Reglas**:
```javascript
match /users/{userId} {
  // Permitir lectura y escritura si el usuario es el propietario del documento
  // o si el usuario autenticado tiene el roleId de administrador en Firestore
  allow read, write: if request.auth != null && (
    request.auth.uid == userId || 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roleId == 1 ||
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roleId == 2
  );
}
```

**Permisos**:
- ✅ Usuarios pueden leer y escribir sus propios datos
- ✅ Administradores pueden acceder a todos los usuarios
- ❌ Usuarios no pueden acceder a datos de otros usuarios

### Colección: `video_example`

**Propósito**: Videos de ejemplo para el aprendizaje de señas.

**Reglas**:
```javascript
match /video_example/{document=**} {
  // Permite la lectura a cualquier usuario (autenticado o no)
  allow read: if true;

  // Mantén la escritura restringida solo para usuarios autenticados
  // y aquellos con los roleId específicos.
  allow write: if request.auth != null && (
    request.auth.uid == userId ||
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roleId == 1 ||
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roleId == 2
  );
}
```

**Permisos**:
- ✅ Lectura pública (cualquier usuario puede ver los videos)
- ✅ Solo propietarios y administradores pueden escribir
- ❌ Usuarios regulares no pueden modificar videos de ejemplo

### Colección: `sign_data`

**Propósito**: Contribuciones de señas de los usuarios.

**Reglas**:
```javascript
match /sign_data/{document=**} {
  allow read, write: if request.auth != null && (
    request.auth.uid == userId || 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roleId == 1 ||
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roleId == 2
  );
}
```

**Permisos**:
- ✅ Usuarios pueden gestionar sus propias contribuciones
- ✅ Administradores pueden acceder a todas las contribuciones
- ❌ Usuarios no pueden acceder a contribuciones de otros

### Colección: `user_opinion_app`

**Propósito**: Encuestas de opinión de los usuarios sobre el sistema.

**Reglas**:
```javascript
match /user_opinion_app/{docId} {
  allow create: if request.auth != null;

  allow read: if request.auth != null && (
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roleId == 1 ||
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roleId == 2
  );
}
```

**Permisos**:
- ✅ Cualquier usuario autenticado puede crear opiniones
- ✅ Solo administradores pueden leer todas las opiniones
- ❌ Usuarios no pueden leer opiniones de otros

### Colección: `evaluates_sign`

**Propósito**: Evaluaciones de reconocimiento de señas.

**Reglas**:
```javascript
match /evaluates_sign/{evaluationId} {
  // Un usuario autenticado puede crear (escribir) una nueva evaluación para sí mismo.
  // Se asume que 'userId' es un campo dentro del documento 'evaluates_sign'.
  allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
  
  // Un usuario solo puede leer sus propias evaluaciones.
  allow read: if request.auth != null && resource.data.userId == request.auth.uid;

  // Solo los administradores (roleId 235463436 o 1704565) pueden actualizar o eliminar cualquier evaluación.
  allow update, delete: if request.auth != null && (
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roleId == 1 ||
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roleId == 2
  );
}
```

**Permisos**:
- ✅ Usuarios pueden crear evaluaciones para sí mismos
- ✅ Usuarios pueden leer sus propias evaluaciones
- ✅ Solo administradores pueden actualizar o eliminar evaluaciones
- ❌ Usuarios no pueden acceder a evaluaciones de otros

## 📁 Reglas de Storage

### Configuración General
```javascript
rules_version = '2';

// Craft rules based on data in your Firestore database
// allow write: if firestore.get(
//    /databases/(default)/documents/users/$(request.auth.uid)).data.isAdmin;
service firebase.storage {
  match /b/{bucket}/o {
    // Reglas específicas por carpeta
  }
}
```

### Carpeta: `video_examples`

**Propósito**: Videos de ejemplo almacenados en Firebase Storage.

**Reglas**:
```javascript
match /video_examples/{allPaths=**} {
  allow read: if true; // Permite que cualquiera lea los archivos
  allow write: if request.auth != null; // Mantén la escritura solo para usuarios autenticados si es necesario
}
```

**Permisos**:
- ✅ Lectura pública (cualquier usuario puede acceder)
- ✅ Solo usuarios autenticados pueden escribir
- ❌ Usuarios no autenticados no pueden subir archivos

### Otras Carpetas

**Propósito**: Archivos de usuarios y otros contenidos.

**Reglas**:
```javascript
match /{folder}/{allPaths=**} {
  allow read, write: if request.auth != null;
}
```

**Permisos**:
- ✅ Acceso completo para usuarios autenticados
- ❌ Sin acceso para usuarios no autenticados

## 🔧 Implementación

### Aplicar Reglas de Firestore

1. Ve a Firebase Console > Firestore Database
2. Haz clic en la pestaña "Rules"
3. Reemplaza las reglas existentes con las reglas de arriba
4. Haz clic en "Publish"

### Aplicar Reglas de Storage

1. Ve a Firebase Console > Storage
2. Haz clic en la pestaña "Rules"
3. Reemplaza las reglas existentes con las reglas de arriba
4. Haz clic en "Publish"

## 🧪 Testing de Reglas

### Verificar Reglas de Firestore

```javascript
// En la consola del navegador
import { db } from '@/firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

// Test: Usuario intentando acceder a sus propios datos
const userDoc = await getDoc(doc(db, 'users', 'user-id'));
console.log('User data:', userDoc.data());

// Test: Usuario intentando acceder a datos de otro usuario
const otherUserDoc = await getDoc(doc(db, 'users', 'other-user-id'));
console.log('Other user data:', otherUserDoc.data());
```

### Verificar Reglas de Storage

```javascript
// En la consola del navegador
import { storage } from '@/firebase/firebaseConfig';
import { ref, getDownloadURL } from 'firebase/storage';

// Test: Acceder a video de ejemplo
const videoRef = ref(storage, 'video_examples/example.mp4');
const url = await getDownloadURL(videoRef);
console.log('Video URL:', url);
```

## 🚨 Problemas Comunes

### Error: "Missing or insufficient permissions"

**Causa**: El usuario no tiene los permisos necesarios para la operación.

**Solución**:
1. Verificar que el usuario esté autenticado
2. Verificar que el usuario tenga el roleId correcto
3. Verificar que esté intentando acceder a sus propios datos

### Error: "Permission denied on resource"

**Causa**: Las reglas están bloqueando el acceso.

**Solución**:
1. Verificar que las reglas estén publicadas correctamente
2. Verificar que el roleId del usuario esté en la base de datos
3. Verificar que el usuario esté intentando acceder a datos permitidos

### Error: "Firestore rules are not working"

**Causa**: Las reglas no se han aplicado correctamente.

**Solución**:
1. Verificar que las reglas se hayan publicado
2. Esperar unos minutos para que las reglas se propaguen
3. Verificar la sintaxis de las reglas

## 📝 Notas de Seguridad

### Buenas Prácticas

1. **Principio de menor privilegio**: Los usuarios solo tienen acceso a lo que necesitan
2. **Validación de datos**: Las reglas validan que los usuarios accedan a sus propios datos
3. **Auditoría**: Los administradores pueden acceder a todos los datos para auditoría
4. **Escalabilidad**: Las reglas están diseñadas para escalar con el crecimiento del sistema

### Consideraciones

1. **Performance**: Las reglas se ejecutan en cada operación, mantenerlas simples
2. **Mantenimiento**: Actualizar las reglas cuando se agreguen nuevas funcionalidades
3. **Testing**: Probar las reglas regularmente para asegurar que funcionen correctamente
4. **Documentación**: Mantener este documento actualizado con cambios en las reglas

## 🔗 Enlaces Útiles

- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage Security Rules](https://firebase.google.com/docs/storage/security)
- [Firebase Security Rules Testing](https://firebase.google.com/docs/rules/unit-tests)

---

**Nota**: Estas reglas están específicamente diseñadas para el proyecto ColSign. Modificar estas reglas puede afectar la seguridad del sistema.
