# Configuración Inicial - ColSign

## 📋 Prerrequisitos

Antes de comenzar con la configuración del proyecto ColSign, asegúrate de tener instalado:

### Software Requerido
- **Node.js** 18.0.0 o superior
- **pnpm** 8.0.0 o superior (recomendado) o **npm** 9.0.0 o superior
- **Git** para control de versiones
- **Editor de código** (VS Code recomendado)

### Verificar Instalaciones
```bash
# Verificar Node.js
node --version
# Debe mostrar v18.0.0 o superior

# Verificar pnpm
pnpm --version
# Debe mostrar 8.0.0 o superior

# Verificar Git
git --version
```

## 🚀 Configuración Paso a Paso

### 1. Clonar el Repositorio

```bash
# Clonar el repositorio
git clone <repository-url>
cd cap_data_sign

# Verificar que estás en la rama correcta
git branch
```

### 2. Instalar Dependencias

```bash
# Usando pnpm (recomendado)
pnpm install

# O usando npm
npm install
```

**Nota**: El proyecto usa `pnpm` como gestor de paquetes principal. Si usas npm, asegúrate de eliminar `pnpm-lock.yaml` antes de instalar.

### 3. Configurar Variables de Entorno

Crear el archivo `.env.local` en la raíz del proyecto:

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
NEXT_PUBLIC_APP_ROLE_1=1  # Admin
NEXT_PUBLIC_APP_ROLE_2=2  # User
NEXT_PUBLIC_APP_ROLE_3=3  # Evaluator

# API Configuration
NEXT_PUBLIC_API_MODELS_URL=your_api_url_here
```

### 4. Configurar Firebase

Sigue la guía detallada en [Configuración de Firebase](./firebase-setup.md) para configurar todos los servicios necesarios.

### 5. Ejecutar el Proyecto

```bash
# Modo desarrollo
pnpm dev

# El proyecto estará disponible en http://localhost:3000
```

## 🔧 Configuración Adicional

### Configuración de TypeScript

El proyecto ya incluye configuración de TypeScript optimizada. Verifica que `tsconfig.json` esté configurado correctamente:

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

### Configuración de ESLint

El proyecto incluye ESLint configurado. Para verificar la configuración:

```bash
# Ejecutar linting
pnpm lint

# Corregir errores automáticamente
pnpm lint --fix
```

### Configuración de Tailwind CSS

Tailwind CSS está configurado con el archivo `tailwind.config.ts`. La configuración incluye:

- Rutas de contenido para el App Router
- Variables CSS personalizadas
- Colores del tema

## 🧪 Verificación de la Instalación

### 1. Verificar que el Proyecto Funciona

1. Ejecuta `pnpm dev`
2. Abre http://localhost:3000
3. Deberías ver la página principal de ColSign

### 2. Verificar Autenticación

1. Haz clic en "Ingresar"
2. Intenta iniciar sesión con Google
3. Verifica que redirija correctamente

### 3. Verificar Funcionalidades Básicas

1. Navega por las diferentes secciones
2. Verifica que las rutas protegidas funcionen
3. Comprueba que los componentes se rendericen correctamente

## 🚨 Problemas Comunes

### Error: "Module not found"
```bash
# Solución: Reinstalar dependencias
rm -rf node_modules
pnpm install
```

### Error: "Firebase not initialized"
- Verifica que las variables de entorno estén configuradas correctamente
- Asegúrate de que el archivo `.env.local` esté en la raíz del proyecto

### Error: "Port 3000 already in use"
```bash
# Usar un puerto diferente
pnpm dev --port 3001
```

### Error: "TypeScript compilation failed"
```bash
# Verificar tipos
pnpm tsc --noEmit

# Limpiar caché de Next.js
rm -rf .next
pnpm dev
```

## 📝 Próximos Pasos

Una vez que la configuración inicial esté completa:

1. **Configurar Firebase**: Sigue la guía en [Configuración de Firebase](./firebase-setup.md)
2. **Entender la Arquitectura**: Lee [Arquitectura del Sistema](../architecture/system-architecture.md)
3. **Revisar el Código**: Familiarízate con la [Estructura de Componentes](../development/component-structure.md)
4. **Configurar APIs**: Si necesitas APIs externas, revisa [API de Machine Learning](../ai/ml-api-integration.md)

## 🔗 Enlaces Útiles

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Firebase](https://firebase.google.com/docs)
- [Documentación de TypeScript](https://www.typescriptlang.org/docs)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)

---

**Nota**: Si encuentras problemas durante la configuración, consulta la sección [Troubleshooting](../maintenance/troubleshooting.md) o abre un issue en el repositorio.
