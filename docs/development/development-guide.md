# Guía de Desarrollo - ColSign

## 📋 Introducción

Esta guía está diseñada para desarrolladores que trabajan en el proyecto ColSign. Cubre las mejores prácticas, convenciones de código, flujo de trabajo y herramientas necesarias para contribuir al proyecto.

## 🚀 Configuración del Entorno de Desarrollo

### Prerrequisitos
- **Node.js** 18.0.0 o superior
- **pnpm** 8.0.0 o superior (recomendado)
- **Git** para control de versiones
- **VS Code** con extensiones recomendadas

### Extensiones de VS Code Recomendadas
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "firebase.vscode-firebase-ext",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### Configuración de VS Code
Crea `.vscode/settings.json` en la raíz del proyecto:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  }
}
```

## 📁 Estructura de Archivos y Convenciones

### Organización de Componentes
```
app/ui/
├── shared/                    # Componentes reutilizables
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Modal.tsx
├── feature-specific/          # Componentes específicos de funcionalidad
│   ├── SignCapture/
│   │   ├── CameraRecorder.tsx
│   │   ├── VideoPreview.tsx
│   │   └── index.ts
│   └── Evaluation/
│       ├── AlphabetTest.tsx
│       ├── WordTest.tsx
│       └── index.ts
└── layout/                    # Componentes de layout
    ├── Header.tsx
    ├── Sidebar.tsx
    └── Footer.tsx
```

### Convenciones de Nomenclatura

#### Archivos y Carpetas
- **PascalCase** para componentes: `SignRecognizer.tsx`
- **camelCase** para utilidades: `authUtils.ts`
- **kebab-case** para páginas: `sign-capture/`
- **snake_case** para constantes: `API_ENDPOINTS.ts`

#### Componentes
```typescript
// ✅ Correcto
export default function SignRecognizer() {
  // Componente principal
}

export function SignRecognizerHeader() {
  // Subcomponente
}

// ❌ Incorrecto
export default function signRecognizer() {
  // No usar camelCase para componentes
}
```

#### Variables y Funciones
```typescript
// ✅ Correcto
const [isRecording, setIsRecording] = useState(false);
const handleSignCapture = () => { /* ... */ };
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ❌ Incorrecto
const [is_recording, set_is_recording] = useState(false);
const HandleSignCapture = () => { /* ... */ };
```

## 🎨 Estilos y CSS

### Tailwind CSS
- Usa clases de Tailwind en lugar de CSS personalizado
- Agrupa clases relacionadas en el mismo orden
- Usa componentes para estilos reutilizables

```typescript
// ✅ Correcto
<div className="flex items-center justify-center p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
  <span>Botón</span>
</div>

// ❌ Incorrecto
<div className="bg-blue-500 p-4 flex text-white rounded-lg justify-center items-center hover:bg-blue-600 transition-colors">
  <span>Botón</span>
</div>
```

### Componentes de Estilo
```typescript
// app/ui/shared/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  onClick, 
  disabled 
}: ButtonProps) {
  const baseClasses = "font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500"
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

## 🔧 TypeScript

### Configuración
El proyecto usa TypeScript con configuración estricta. Verifica `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*","./app/*"]
    }
  }
}
```

### Tipos y Interfaces
```typescript
// types/auth.ts
export interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: number;
  levelId: number;
  createdAt: Date;
  status_tyc: boolean;
}

// types/sign.ts
export interface SignData {
  id: string;
  id_user: string;
  label: string;
  type: 'Caracter' | 'Palabra' | 'Frases';
  nivel_user: number;
  videoPath: string;
  status_verified: boolean;
  createdAt: Date;
}

// types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

### Hooks Personalizados
```typescript
// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';
import { User } from '@/types/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Obtener datos adicionales de Firestore
        const userData = await getUserData(firebaseUser.uid);
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}
```

## 🔐 Autenticación y Seguridad

### Protección de Rutas
```typescript
// components/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: number[];
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles, 
  fallback = <div>Acceso denegado</div> 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user || !allowedRoles.includes(user.roleId)) {
    return fallback;
  }

  return <>{children}</>;
}
```

### Validación de Datos
```typescript
// utils/validation.ts
import { z } from 'zod';

export const signDataSchema = z.object({
  label: z.string().min(1, 'El nombre es requerido'),
  type: z.enum(['Caracter', 'Palabra', 'Frases']),
  nivel_user: z.number().min(1).max(3),
  videoPath: z.string().url('URL de video inválida')
});

export const userSchema = z.object({
  firstName: z.string().min(2, 'Nombre mínimo 2 caracteres'),
  lastName: z.string().min(2, 'Apellido mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  levelId: z.number().min(1).max(3)
});
```

## 🔥 Firebase

### Operaciones de Firestore
```typescript
// utils/firestore.ts
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

// Crear documento
export async function createDocument<T>(
  collectionName: string, 
  id: string, 
  data: T
): Promise<void> {
  try {
    await setDoc(doc(db, collectionName, id), {
      ...data,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
}

// Obtener documento
export async function getDocument<T>(
  collectionName: string, 
  id: string
): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as T;
    }
    return null;
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
}

// Consultar documentos
export async function queryDocuments<T>(
  collectionName: string,
  conditions: Array<[string, '==' | '!=' | '<' | '>', any]>,
  orderByField?: string,
  limitCount?: number
): Promise<T[]> {
  try {
    let q = collection(db, collectionName);
    
    conditions.forEach(([field, operator, value]) => {
      q = query(q, where(field, operator, value));
    });
    
    if (orderByField) {
      q = query(q, orderBy(orderByField));
    }
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
  } catch (error) {
    console.error('Error querying documents:', error);
    throw error;
  }
}
```

### Operaciones de Storage
```typescript
// utils/storage.ts
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { storage } from '@/firebase/firebaseConfig';

export async function uploadFile(
  file: File, 
  path: string
): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

export async function deleteFile(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}
```

## 🤖 Integración con IA

### MediaPipe Integration
```typescript
// utils/mediapipe.ts
export class MediaPipeManager {
  private hands: any;
  private pose: any;
  private camera: any;

  async initialize() {
    // Cargar scripts de MediaPipe
    await this.loadMediaPipeScripts();
    
    // Inicializar modelos
    this.hands = new (window as any).Hands({
      locateFile: (file: string) => 
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });
    
    this.pose = new (window as any).Pose({
      locateFile: (file: string) => 
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });
    
    // Configurar opciones
    this.hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    
    this.pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
  }

  private async loadMediaPipeScripts() {
    // Cargar scripts de MediaPipe dinámicamente
    const scripts = [
      'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js'
    ];

    for (const script of scripts) {
      await new Promise((resolve, reject) => {
        const scriptElement = document.createElement('script');
        scriptElement.src = script;
        scriptElement.onload = resolve;
        scriptElement.onerror = reject;
        document.head.appendChild(scriptElement);
      });
    }
  }
}
```

### API Integration
```typescript
// utils/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_MODELS_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export interface SignRecognitionRequest {
  keypoints: number[];
  model: 'alphabet_1' | 'words_v2';
  sequence_length: number;
}

export interface SignRecognitionResponse {
  prediction: string;
  probabilities: number[];
  confidence: number;
}

export async function recognizeSign(
  data: SignRecognitionRequest
): Promise<SignRecognitionResponse> {
  try {
    const response = await api.post('/recognize', data);
    return response.data;
  } catch (error) {
    console.error('Error recognizing sign:', error);
    throw error;
  }
}
```

## 🧪 Testing

### Configuración de Testing
```json
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    '!app/**/*.d.ts',
    '!app/**/*.stories.{js,jsx,ts,tsx}'
  ]
};
```

### Ejemplo de Test
```typescript
// __tests__/components/SignRecognizer.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import SignRecognizer from '@/app/ui/interpreter-lsc/SignRecognizer';

describe('SignRecognizer', () => {
  it('should render camera controls', () => {
    render(<SignRecognizer />);
    
    expect(screen.getByText('Iniciar Cámara')).toBeInTheDocument();
    expect(screen.getByText('Detener Cámara')).toBeInTheDocument();
  });

  it('should start camera when button is clicked', async () => {
    render(<SignRecognizer />);
    
    const startButton = screen.getByText('Iniciar Cámara');
    fireEvent.click(startButton);
    
    // Verificar que la cámara se inició
    expect(screen.getByText('Detener Cámara')).toBeInTheDocument();
  });
});
```

## 📝 Git y Flujo de Trabajo

### Convenciones de Commits
```bash
# Formato: type(scope): description

# Ejemplos:
feat(auth): add Google OAuth integration
fix(sign-capture): resolve video recording issue
docs(readme): update installation instructions
refactor(components): extract reusable Button component
test(evaluation): add unit tests for alphabet recognition
style(ui): improve button hover states
```

### Ramas
- `main`: Código de producción
- `develop`: Rama de desarrollo principal
- `feature/feature-name`: Nuevas funcionalidades
- `fix/bug-description`: Correcciones de bugs
- `hotfix/urgent-fix`: Correcciones urgentes

### Pull Request Template
```markdown
## Descripción
Breve descripción de los cambios realizados.

## Tipo de Cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Breaking change
- [ ] Documentación

## Checklist
- [ ] Código sigue las convenciones del proyecto
- [ ] Tests pasan correctamente
- [ ] Documentación actualizada
- [ ] Variables de entorno configuradas
- [ ] Revisado por otro desarrollador

## Screenshots (si aplica)
```

## 🚀 Despliegue

### Scripts de Build
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Variables de Entorno de Producción
```bash
# .env.production
NEXT_PUBLIC_FIREBASE_APIKEY=prod_api_key
NEXT_PUBLIC_FIREBASE_AUTHDOMAIN=prod-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECTID=prod-project-id
NEXT_PUBLIC_API_MODELS_URL=https://api.colsign.com/v1/models
```

## 🔍 Debugging

### Herramientas de Desarrollo
- **React Developer Tools**: Para debugging de componentes
- **Redux DevTools**: Si se implementa Redux
- **Firebase Console**: Para debugging de Firestore y Storage
- **Chrome DevTools**: Para debugging general

### Logging
```typescript
// utils/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  }
};
```

## 📚 Recursos Adicionales

### Documentación
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)

### Herramientas
- [MediaPipe Documentation](https://mediapipe.dev)
- [TensorFlow.js Documentation](https://www.tensorflow.org/js)
- [Zod Documentation](https://zod.dev)

---

**Nota**: Esta guía se actualiza regularmente. Mantente al día con las últimas versiones y mejores prácticas.
