# Documentación Completa - ColSign

## 📚 Índice de Documentación

Esta carpeta contiene la documentación completa del proyecto ColSign, organizada por secciones para facilitar la navegación y comprensión del sistema.

### 🚀 Guías de Inicio Rápido
- [Configuración Inicial](./setup/initial-setup.md) - Configuración básica del proyecto
- [Configuración de Firebase](./setup/firebase-setup.md) - Configuración completa de Firebase
- [Variables de Entorno](./setup/environment-variables.md) - Explicación de todas las variables

### 🏗️ Arquitectura y Desarrollo
- [Arquitectura del Sistema](./architecture/system-architecture.md) - Visión general de la arquitectura
- [Guía de Desarrollo](./development/development-guide.md) - Guías para desarrolladores
- [Convenciones de Código](./development/coding-conventions.md) - Estándares de código
- [Estructura de Componentes](./development/component-structure.md) - Organización de componentes

### 🔐 Autenticación y Seguridad
- [Sistema de Autenticación](./auth/authentication-system.md) - Flujo completo de autenticación
- [Gestión de Roles](./auth/role-management.md) - Sistema de roles y permisos
- [Protección de Rutas](./auth/route-protection.md) - Implementación de ProtectedRoute

### 🤖 IA y Machine Learning
- [Integración con MediaPipe](./ai/mediapipe-integration.md) - Configuración y uso de MediaPipe
- [TensorFlow.js Setup](./ai/tensorflow-setup.md) - Configuración de TensorFlow.js
- [Reconocimiento de Señas](./ai/sign-recognition.md) - Sistema de reconocimiento
- [API de Machine Learning](./ai/ml-api-integration.md) - Integración con API de modelos LSC
  - **🔗 Repositorio de la API**: [GitHub: models-lsc-api](https://github.com/FerchoRV/models-lsc-api)

### 📊 Funcionalidades del Sistema
- [Captura de Señas](./features/sign-capture.md) - Sistema de grabación y envío
- [Sistema de Evaluación](./features/evaluation-system.md) - Módulos de evaluación
- [Panel de Administración](./features/admin-panel.md) - Funcionalidades administrativas
- [Interprete LSC](./features/interpreter-lsc.md) - Prototipo de intérprete

### 🗄️ Base de Datos
- [Estructura de Firestore](./database/firestore-structure.md) - Colecciones y documentos
- [Reglas de Seguridad](./database/firebase-rules.md) - Reglas de Firestore y Storage
- [Operaciones CRUD](./database/crud-operations.md) - Operaciones de base de datos

### 🚀 Despliegue y Producción
- [Despliegue en Vercel](./deployment/vercel-deployment.md) - Guía de despliegue
- [Configuración de Producción](./deployment/production-config.md) - Configuración para producción
- [Monitoreo y Logs](./deployment/monitoring.md) - Monitoreo del sistema

### 🔧 Mantenimiento
- [Troubleshooting](./maintenance/troubleshooting.md) - Solución de problemas comunes
- [Actualizaciones](./maintenance/updates.md) - Guía de actualizaciones
- [Backup y Recuperación](./maintenance/backup-recovery.md) - Estrategias de backup

### 📋 Referencias
- [API Documentation](./api/api-documentation.md) - Documentación de APIs
- [Glosario de Términos](./reference/glossary.md) - Definiciones importantes
- [FAQ](./reference/faq.md) - Preguntas frecuentes

---

## 🎯 Objetivo de esta Documentación

Esta documentación está diseñada para:

1. **Desarrolladores nuevos** que necesiten entender rápidamente el proyecto
2. **Contribuidores** que quieran agregar nuevas funcionalidades
3. **Administradores** que necesiten mantener y desplegar el sistema
4. **Usuarios técnicos** que requieran información específica sobre componentes

## 📝 Cómo Usar esta Documentación

### Para Desarrolladores Nuevos
1. Comienza con [Configuración Inicial](./setup/initial-setup.md)
2. Lee [Arquitectura del Sistema](./architecture/system-architecture.md)
3. Revisa [Guía de Desarrollo](./development/development-guide.md)

### Para Contribuidores
1. Familiarízate con [Convenciones de Código](./development/coding-conventions.md)
2. Entiende la [Estructura de Componentes](./development/component-structure.md)
3. Revisa las [Funcionalidades del Sistema](./features/)

### Para Administradores
1. Configura [Firebase](./setup/firebase-setup.md)
2. Revisa [Despliegue en Vercel](./deployment/vercel-deployment.md)
3. Entiende el [Panel de Administración](./features/admin-panel.md)

## 🔄 Mantenimiento de la Documentación

Esta documentación se actualiza regularmente. Para contribuir:

1. Mantén la documentación actualizada con los cambios del código
2. Usa ejemplos claros y concisos
3. Incluye capturas de pantalla cuando sea necesario
4. Verifica que todos los enlaces funcionen correctamente

## 📞 Soporte

Si encuentras errores en la documentación o necesitas aclaraciones:

1. Revisa la sección [Troubleshooting](./maintenance/troubleshooting.md)
2. Consulta las [FAQ](./reference/faq.md)
3. Abre un issue en el repositorio del proyecto

## 🔗 Enlaces Externos Importantes

### API de Modelos de Lengua de Señas Colombianas
- **[Repositorio Oficial](https://github.com/FerchoRV/models-lsc-api)** - Código fuente y documentación detallada de la API
- **Tecnología**: Python + FastAPI + Docker
- **Funcionalidades**: Reconocimiento de alfabeto, palabras y frases en LSC

### Documentación de Tecnologías
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [MediaPipe Documentation](https://mediapipe.dev)
- [TensorFlow.js Documentation](https://www.tensorflow.org/js)

---

**Última actualización**: Diciembre 2024
**Versión de la documentación**: 1.0.0
