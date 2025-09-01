# Estructura de Firestore - ColSign

## 📋 Descripción

Este documento detalla la estructura completa de las colecciones de Firestore utilizadas en el proyecto ColSign. Cada colección tiene un propósito específico y contiene datos estructurados que permiten el funcionamiento del sistema de reconocimiento de lengua de señas colombianas.

## 🗄️ Colecciones de Firestore

### 1. Colección: `users`

**Propósito**: Almacena la información de todos los usuarios registrados en el sistema.

**Estructura del Documento**:
```typescript
interface User {
  createdAt: Timestamp;           // Fecha de creación del usuario
  email: string;                  // Email del usuario
  firstName: string;              // Nombre del usuario
  lastName: string;               // Apellido del usuario
  levelId: number;                // Nivel de experiencia (1=Experto, 2=Intermedio, 3=Novato)
  roleId: number;                 // Rol del usuario (235463436=Admin1, 1704565=Admin2, 3=User)
  status_tyc: boolean;            // Estado de aceptación de términos y condiciones
}
```

**Ejemplo de Documento**:
```json
{
  "createdAt": "2025-06-05T22:58:24.000Z",
  "email": "dfrv2411@gmail.com",
  "firstName": "Diego Rivera",
  "lastName": "Admin",
  "levelId": 3,
  "roleId": 1,
  "status_tyc": true
}
```

**Campos Detallados**:
- **`createdAt`**: Timestamp de cuando se creó el usuario en el sistema
- **`email`**: Dirección de correo electrónico única del usuario
- **`firstName`**: Nombre del usuario
- **`lastName`**: Apellido del usuario
- **`levelId`**: Nivel de experiencia en lengua de señas
  - `1`: Experto
  - `2`: Intermedio  
  - `3`: Novato
- **`roleId`**: Rol y permisos del usuario
  - `235463436`: Primer Administrador
  - `1704565`: Segundo Administrador
  - `3`: Usuario regular
- **`status_tyc`**: Indica si el usuario ha aceptado los términos y condiciones

---

### 2. Colección: `video_example`

**Propósito**: Almacena información sobre los videos de ejemplo de señas que sirven como referencia para el aprendizaje.

**Estructura del Documento**:
```typescript
interface VideoExample {
  createdAt: Timestamp;           // Fecha de creación del video
  meaning: string;                // Significado de la seña
  name: string;                   // Nombre de la seña
  reference: string;              // URL de referencia externa
  status: string;                 // Estado del video (activo/inactivo)
  type: string;                   // Tipo de seña (Caracter, Palabra, Frases)
  videoPath: string;              // URL del video en Firebase Storage
}
```

**Ejemplo de Documento**:
```json
{
  "createdAt": "2025-06-09T22:38:55.000Z",
  "meaning": "Sexto día de la semana.",
  "name": "Sábado",
  "reference": "https://educativo.insor.gov.co/diccionario/sabado/",
  "status": "activo",
  "type": "Palabra",
  "videoPath": "https://firebasestorage.googleapis.com/v0/b/cap-data-sign.firebasestorage.app/o/video_examples%2F01-Sabado-Palabra-1.m4v?alt=media&token=ca3f2985-062e-4550-b152-53e8d8d1a587"
}
```

**Campos Detallados**:
- **`createdAt`**: Timestamp de cuando se subió el video
- **`meaning`**: Descripción del significado de la seña
- **`name`**: Nombre o palabra que representa la seña
- **`reference`**: Enlace a fuente externa de referencia (INSOR, etc.)
- **`status`**: Estado del video en el sistema
  - `"activo"`: Video disponible para uso
  - `"inactivo"`: Video deshabilitado temporalmente
- **`type`**: Categoría de la seña
  - `"Caracter"`: Letras del alfabeto
  - `"Palabra"`: Palabras individuales
  - `"Frases"`: Frases completas
- **`videoPath`**: URL completa del video almacenado en Firebase Storage

---

### 3. Colección: `user_opinion_app`

**Propósito**: Almacena las respuestas de las encuestas de opinión que los usuarios completan sobre el sistema.

**Estructura del Documento**:
```typescript
interface UserOpinion {
  q1_reconocimiento_senas: number;    // Pregunta 1: Evaluación del reconocimiento
  q2_generador_senas: number;         // Pregunta 2: Evaluación del generador
  q3_necesidad_sistema: number;       // Pregunta 3: Evaluación de la necesidad
  q4_usaria_para_comunicarse: string; // Pregunta 4: Uso para comunicación
  q5_opinion_general: string;         // Pregunta 5: Opinión general
  submittedAt: Timestamp;             // Fecha de envío de la encuesta
  userId: string;                     // ID del usuario que completó la encuesta
}
```

**Ejemplo de Documento**:
```json
{
  "q1_reconocimiento_senas": 1,
  "q2_generador_senas": 1,
  "q3_necesidad_sistema": 1,
  "q4_usaria_para_comunicarse": "No",
  "q5_opinion_general": "Prueba",
  "submittedAt": "2025-07-23T12:40:52.000Z",
  "userId": "UDygEs19sKbId8DJTRyeUbNEg802"
}
```

**Campos Detallados**:
- **`q1_reconocimiento_senas`**: Calificación del sistema de reconocimiento (1-5)
- **`q2_generador_senas`**: Calificación del generador de señas (1-5)
- **`q3_necesidad_sistema`**: Evaluación de la necesidad del sistema (1-5)
- **`q4_usaria_para_comunicarse`**: Respuesta sobre uso para comunicación
  - `"Sí"`: Usaría el sistema para comunicarse
  - `"No"`: No usaría el sistema para comunicarse
  - `"Tal vez"`: Consideraría usar el sistema
- **`q5_opinion_general`**: Comentarios generales del usuario
- **`submittedAt`**: Timestamp de cuando se envió la encuesta
- **`userId`**: ID único del usuario que completó la encuesta

---

### 4. Colección: `sign_data`

**Propósito**: Almacena las contribuciones de videos de señas enviadas por los usuarios para el dataset del proyecto.

**Estructura del Documento**:
```typescript
interface SignData {
  createdAt: Timestamp;           // Fecha de creación de la contribución
  id_sign: string;                // ID único de la seña
  id_user: string;                // ID del usuario que contribuyó
  label: string;                  // Etiqueta/nombre de la seña
  nivel_user: number;             // Nivel del usuario al momento de la contribución
  status_verified: boolean;       // Estado de verificación por administradores
  type: string;                   // Tipo de seña (Caracter, Palabra, Frases)
  videoPath: string;              // URL del video en Firebase Storage
}
```

**Ejemplo de Documento**:
```json
{
  "createdAt": "2025-06-18T19:51:06.000Z",
  "id_sign": "yDiN74yDOtFGaSHu44QH",
  "id_user": "UDygEs19sKbId8DJTRyeUbNEg802",
  "label": "Acostumbrar",
  "nivel_user": 3,
  "status_verified": false,
  "type": "Palabra",
  "videoPath": "https://firebasestorage.googleapis.com/v0/b/cap-data-sign.firebasestorage.app/o/Acostumbrar%2FAcostumbrar_b88aa8e1-75be-4f6f-b075-a076e2dbacfd.mp4?alt=media&token=f0befbdf-4433-480d-84c4-cce0a753c296"
}
```

**Campos Detallados**:
- **`createdAt`**: Timestamp de cuando se subió la contribución
- **`id_sign`**: Identificador único generado para la seña
- **`id_user`**: ID del usuario que realizó la contribución
- **`label`**: Nombre o etiqueta de la seña grabada
- **`nivel_user`**: Nivel de experiencia del usuario al momento de la grabación
  - `1`: Experto
  - `2`: Intermedio
  - `3`: Novato
- **`status_verified`**: Estado de verificación por parte de administradores
  - `true`: Verificado y aprobado
  - `false`: Pendiente de verificación
- **`type`**: Categoría de la seña contribuida
  - `"Caracter"`: Letras del alfabeto
  - `"Palabra"`: Palabras individuales
  - `"Frases"`: Frases completas
- **`videoPath`**: URL completa del video almacenado en Firebase Storage

---

### 5. Colección: `evaluates_sign`

**Propósito**: Almacena los resultados de las evaluaciones realizadas con los modelos de interpretación de lengua de señas colombianas.

**Estructura del Documento**:
```typescript
interface EvaluateSign {
  evaluatedAt: Timestamp;         // Fecha de la evaluación
  label: string;                  // Etiqueta de la seña evaluada
  model: string;                  // Modelo utilizado para la evaluación
  prediction: string;             // Predicción del modelo
  probabilities: number[];        // Array de probabilidades por clase
  recordedVideoDocId: string;     // ID del documento del video grabado
  signId: string;                 // ID de la seña de referencia
  signName: string;               // Nombre de la seña
  signType: string;               // Tipo de seña (Caracter, Palabra, Frases)
  type_extract: string;           // Tipo de extracción (hands, pose, etc.)
  url_video: string;              // URL del video de la evaluación
  userId: string;                 // ID del usuario que realizó la evaluación
  userLevelId: number;            // Nivel del usuario al momento de la evaluación
}
```

**Ejemplo de Documento**:
```json
{
  "evaluatedAt": "2025-07-24T13:46:19.000Z",
  "label": "z",
  "model": "alphabet_1",
  "prediction": "Z",
  "probabilities": [0, 0, 0, 7.407261021538147e-21, 0, 1.3496493385509092e-14, 9.661728553431765e-23, 2.7090181216982995e-21, 4.148794952775235e-28, 0.0024708255659788847, 1.0485523036716028e-19, 0, 9.03751755710106e-16, 1.830828628265668e-18, 0, 1.5481489821727937e-32, 1.7443479937191025e-15, 0, 6.025985849515667e-38, 6.379750243715177e-13, 3.956827885568437e-29, 5.56659697769207e-25, 4.549067286058195e-12, 6.008607147058487e-16, 0.000002418795247649541, 6.86337152341787e-26, 0.9975268244743347],
  "recordedVideoDocId": "oNf6uLmdVH7AxO4NK8su",
  "signId": "WoXSGUJ59Vr8btm9Iidv",
  "signName": "z",
  "signType": "Caracter",
  "type_extract": "hands",
  "url_video": "https://firebasestorage.googleapis.com/v0/b/cap-data-sign.firebasestorage.app/o/sign_data_videos%2Fz_308a1c8f-9c3c-4cc6-a24b-b10f39a948d8.mp4?alt=media&token=1128ac37-2d29-4ea0-84b1-a5d9d94241d8",
  "userId": "UDygEs19sKbId8DJTRyeUbNEg802",
  "userLevelId": 3
}
```

**Campos Detallados**:
- **`evaluatedAt`**: Timestamp de cuando se realizó la evaluación
- **`label`**: Etiqueta de la seña que se intentó reconocer
- **`model`**: Modelo de IA utilizado para la evaluación
  - `"alphabet_1"`: Modelo para reconocimiento de alfabeto
  - `"words_v2"`: Modelo para reconocimiento de palabras
- **`prediction`**: Predicción realizada por el modelo
- **`probabilities`**: Array con las probabilidades de cada clase posible
- **`recordedVideoDocId`**: ID del documento del video grabado durante la evaluación
- **`signId`**: ID de la seña de referencia utilizada
- **`signName`**: Nombre de la seña evaluada
- **`signType`**: Tipo de seña evaluada
  - `"Caracter"`: Letras del alfabeto
  - `"Palabra"`: Palabras individuales
  - `"Frases"`: Frases completas
- **`type_extract`**: Tipo de extracción de datos utilizada
  - `"hands"`: Extracción de puntos de referencia de manos
  - `"pose"`: Extracción de puntos de referencia del cuerpo
- **`url_video`**: URL del video de la evaluación almacenado
- **`userId`**: ID del usuario que realizó la evaluación
- **`userLevelId`**: Nivel de experiencia del usuario al momento de la evaluación

## 🔗 Relaciones Entre Colecciones

### Diagrama de Relaciones
```
users (1) ──── (N) sign_data
users (1) ──── (N) user_opinion_app
users (1) ──── (N) evaluates_sign
video_example (N) ──── (N) evaluates_sign
```

### Relaciones Específicas

1. **`users` ↔ `sign_data`**
   - Un usuario puede tener múltiples contribuciones
   - Campo de relación: `sign_data.id_user` → `users.uid`

2. **`users` ↔ `user_opinion_app`**
   - Un usuario puede completar múltiples encuestas
   - Campo de relación: `user_opinion_app.userId` → `users.uid`

3. **`users` ↔ `evaluates_sign`**
   - Un usuario puede realizar múltiples evaluaciones
   - Campo de relación: `evaluates_sign.userId` → `users.uid`

4. **`video_example` ↔ `evaluates_sign`**
   - Un video de ejemplo puede ser usado en múltiples evaluaciones
   - Campo de relación: `evaluates_sign.signId` → `video_example.id`

## 📊 Consultas Comunes

### Obtener Usuario por Email
```typescript
const userQuery = query(
  collection(db, 'users'),
  where('email', '==', 'user@example.com')
);
```

### Obtener Contribuciones de un Usuario
```typescript
const userContributionsQuery = query(
  collection(db, 'sign_data'),
  where('id_user', '==', userId)
);
```

### Obtener Videos de Ejemplo Activos
```typescript
const activeVideosQuery = query(
  collection(db, 'video_example'),
  where('status', '==', 'activo')
);
```

### Obtener Evaluaciones por Modelo
```typescript
const modelEvaluationsQuery = query(
  collection(db, 'evaluates_sign'),
  where('model', '==', 'alphabet_1')
);
```

### Obtener Encuestas de un Usuario
```typescript
const userOpinionsQuery = query(
  collection(db, 'user_opinion_app'),
  where('userId', '==', userId)
);
```

## 🔐 Consideraciones de Seguridad

### Reglas de Acceso
- **`users`**: Usuarios solo pueden leer/escribir sus propios datos
- **`sign_data`**: Usuarios solo pueden acceder a sus propias contribuciones
- **`video_example`**: Lectura pública, escritura solo para admins
- **`user_opinion_app`**: Usuarios pueden crear, solo admins pueden leer
- **`evaluates_sign`**: Usuarios pueden crear y leer sus propias evaluaciones

### Validación de Datos
- Todos los campos requeridos deben estar presentes
- Los tipos de datos deben coincidir con las definiciones
- Las URLs deben ser válidas
- Los IDs de usuario deben existir en la colección `users`

## 📈 Optimización de Consultas

### Índices Recomendados
```javascript
// users collection
- email (ascending)
- roleId (ascending)
- levelId (ascending)

// sign_data collection
- id_user (ascending)
- type (ascending)
- status_verified (ascending)
- createdAt (descending)

// video_example collection
- status (ascending)
- type (ascending)
- createdAt (descending)

// evaluates_sign collection
- userId (ascending)
- model (ascending)
- evaluatedAt (descending)

// user_opinion_app collection
- userId (ascending)
- submittedAt (descending)
```

### Paginación
```typescript
// Ejemplo de paginación para sign_data
const signDataQuery = query(
  collection(db, 'sign_data'),
  orderBy('createdAt', 'desc'),
  limit(10),
  startAfter(lastDocument)
);
```

## 🔄 Operaciones CRUD

### Crear Usuario
```typescript
const createUser = async (userData: User) => {
  const userRef = doc(collection(db, 'users'), userData.uid);
  await setDoc(userRef, {
    ...userData,
    createdAt: serverTimestamp()
  });
};
```

### Actualizar Usuario
```typescript
const updateUser = async (userId: string, updates: Partial<User>) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, updates);
};
```

### Eliminar Contribución
```typescript
const deleteSignData = async (signId: string) => {
  const signRef = doc(db, 'sign_data', signId);
  await deleteDoc(signRef);
};
```

### Obtener con Filtros
```typescript
const getVerifiedContributions = async () => {
  const q = query(
    collection(db, 'sign_data'),
    where('status_verified', '==', true),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

---

**Nota**: Esta estructura de datos está optimizada para el funcionamiento del sistema ColSign y debe mantenerse consistente para garantizar el correcto funcionamiento de todas las funcionalidades.
