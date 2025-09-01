# API de Machine Learning - ColSign

## 📋 Descripción

ColSign utiliza una API propia de modelos de lengua de señas colombianas para el reconocimiento y clasificación de señas. Esta API está desarrollada específicamente para el proyecto y proporciona servicios de machine learning para el procesamiento de datos de keypoints extraídos de videos de señas.

## 🔗 Información de la API

### Repositorio Oficial
Para información detallada sobre la API de modelos de lengua de señas colombianas, visita el repositorio oficial:

**[GitHub: models-lsc-api](https://github.com/FerchoRV/models-lsc-api)**

### Características de la API
- **Lenguaje**: Python
- **Framework**: FastAPI
- **Contenedorización**: Docker
- **Modelos**: Específicos para lengua de señas colombianas
- **Funcionalidades**: Reconocimiento de alfabeto, palabras y frases

## 🔧 Configuración

### Variable de Entorno
La API se configura a través de la variable de entorno:

```env
NEXT_PUBLIC_API_MODELS_URL=https://your-api-domain.com
```

### Ejemplo de Configuración
```env
# Desarrollo
NEXT_PUBLIC_API_MODELS_URL=http://localhost:8000

# Producción
NEXT_PUBLIC_API_MODELS_URL=https://api.colsign.com
```

## 🤖 Integración en el Proyecto

### Endpoints Utilizados

#### 1. Reconocimiento de Alfabeto
```typescript
// Endpoint: POST /recognize/alphabet
interface AlphabetRecognitionRequest {
  keypoints: number[];
  sequence_length: number;
}

interface AlphabetRecognitionResponse {
  prediction: string;
  probabilities: number[];
  confidence: number;
}
```

#### 2. Reconocimiento de Palabras
```typescript
// Endpoint: POST /recognize/words
interface WordRecognitionRequest {
  keypoints: number[];
  sequence_length: number;
}

interface WordRecognitionResponse {
  prediction: string;
  probabilities: number[];
  confidence: number;
}
```

### Implementación en el Código

#### Cliente HTTP
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

export async function recognizeAlphabet(keypoints: number[]): Promise<AlphabetRecognitionResponse> {
  try {
    const response = await api.post('/recognize/alphabet', {
      keypoints,
      sequence_length: keypoints.length
    });
    return response.data;
  } catch (error) {
    console.error('Error recognizing alphabet:', error);
    throw error;
  }
}

export async function recognizeWords(keypoints: number[]): Promise<WordRecognitionResponse> {
  try {
    const response = await api.post('/recognize/words', {
      keypoints,
      sequence_length: keypoints.length
    });
    return response.data;
  } catch (error) {
    console.error('Error recognizing words:', error);
    throw error;
  }
}
```

#### Uso en Componentes
```typescript
// app/ui/interpreter-lsc/SignRecognizer.tsx
import { recognizeAlphabet, recognizeWords } from '@/utils/api';

// En el componente de reconocimiento
const handleKeypoints = async (keypoints: number[]) => {
  try {
    let result;
    
    if (currentMode === 'alphabet') {
      result = await recognizeAlphabet(keypoints);
    } else if (currentMode === 'words') {
      result = await recognizeWords(keypoints);
    }
    
    setPrediction(result.prediction);
    setConfidence(result.confidence);
  } catch (error) {
    console.error('Recognition error:', error);
    setError('Error en el reconocimiento');
  }
};
```

## 📊 Flujo de Datos

### 1. Captura de Video
```
Cámara → MediaPipe → Keypoints → Preprocesamiento
```

### 2. Envío a la API
```
Keypoints → API ML → Modelo → Predicción → Respuesta
```

### 3. Procesamiento de Respuesta
```
Respuesta → UI Update → Almacenamiento en Firestore
```

## 🧪 Testing de la API

### Verificar Conexión
```typescript
// Test de conectividad
const testConnection = async () => {
  try {
    const response = await api.get('/health');
    console.log('API Status:', response.data);
    return true;
  } catch (error) {
    console.error('API Connection Error:', error);
    return false;
  }
};
```

### Test de Reconocimiento
```typescript
// Test con datos de ejemplo
const testRecognition = async () => {
  const testKeypoints = [/* array de keypoints de prueba */];
  
  try {
    const result = await recognizeAlphabet(testKeypoints);
    console.log('Test Result:', result);
  } catch (error) {
    console.error('Test Error:', error);
  }
};
```

## 🚨 Manejo de Errores

### Errores Comunes
```typescript
// Manejo de errores de red
const handleApiError = (error: any) => {
  if (error.code === 'ECONNABORTED') {
    return 'Timeout: La API no respondió en el tiempo esperado';
  }
  
  if (error.response) {
    switch (error.response.status) {
      case 400:
        return 'Error: Datos de entrada inválidos';
      case 500:
        return 'Error: Problema interno del servidor';
      default:
        return `Error: ${error.response.status}`;
    }
  }
  
  return 'Error: Problema de conexión';
};
```

### Fallback Strategy
```typescript
// Estrategia de respaldo cuando la API no está disponible
const recognizeWithFallback = async (keypoints: number[]) => {
  try {
    return await recognizeAlphabet(keypoints);
  } catch (error) {
    console.warn('API unavailable, using fallback');
    return {
      prediction: 'N/A',
      confidence: 0,
      fallback: true
    };
  }
};
```

## 🔧 Configuración Avanzada

### Timeout y Retry
```typescript
// Configuración avanzada de la API
const apiConfig = {
  timeout: 30000, // 30 segundos
  retry: 3,
  retryDelay: 1000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'ColSign-WebApp/1.0'
  }
};
```

### Caché de Respuestas
```typescript
// Implementación de caché simple
const responseCache = new Map();

const recognizeWithCache = async (keypoints: number[], mode: string) => {
  const cacheKey = `${mode}_${JSON.stringify(keypoints)}`;
  
  if (responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey);
  }
  
  const result = await (mode === 'alphabet' ? 
    recognizeAlphabet(keypoints) : 
    recognizeWords(keypoints));
  
  responseCache.set(cacheKey, result);
  return result;
};
```

## 📈 Monitoreo y Logs

### Logging de Requests
```typescript
// Interceptor para logging
api.interceptors.request.use((config) => {
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`API Error: ${error.response?.status} ${error.config?.url}`);
    return Promise.reject(error);
  }
);
```

### Métricas de Performance
```typescript
// Medición de tiempo de respuesta
const measureApiPerformance = async (apiCall: () => Promise<any>) => {
  const startTime = performance.now();
  
  try {
    const result = await apiCall();
    const endTime = performance.now();
    
    console.log(`API Performance: ${endTime - startTime}ms`);
    return result;
  } catch (error) {
    const endTime = performance.now();
    console.error(`API Error after ${endTime - startTime}ms:`, error);
    throw error;
  }
};
```

## 🔗 Enlaces Útiles

- **[Repositorio de la API](https://github.com/FerchoRV/models-lsc-api)** - Código fuente y documentación detallada
- [FastAPI Documentation](https://fastapi.tiangolo.com/) - Framework de la API
- [Axios Documentation](https://axios-http.com/) - Cliente HTTP
- [MediaPipe Documentation](https://mediapipe.dev/) - Extracción de keypoints

## 📝 Notas Importantes

### Seguridad
- La API debe estar protegida con autenticación en producción
- Usar HTTPS para todas las comunicaciones
- Validar los datos de entrada antes de enviarlos

### Performance
- Implementar caché para respuestas frecuentes
- Usar compresión para reducir el tamaño de las requests
- Monitorear el tiempo de respuesta de la API

### Mantenimiento
- Mantener actualizada la documentación de la API
- Implementar versionado de la API
- Realizar backups de los modelos de ML

---

**Nota**: Para información técnica detallada sobre la implementación de la API, arquitectura de modelos y configuración del servidor, consulta el [repositorio oficial de la API](https://github.com/FerchoRV/models-lsc-api).
