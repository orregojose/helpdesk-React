<<<<<<< HEAD
# helpdesk-React
=======
# Help Desk - Trilogit

Sistema de gestión de tickets de soporte técnico desarrollado para Trilogit.

## Características

- Gestión de tickets de soporte
- Sistema de usuarios con roles (administrador, soporte, normal)
- Panel de administración
- Estadísticas de tickets
- Comentarios en tickets
- Interfaz responsive

## Tecnologías

- Frontend: React.js
- Backend: Node.js con Express
- Base de datos: MySQL
- Autenticación: JWT
- UI: Bootstrap

## Requisitos

- Node.js 14.x o superior
- MySQL 5.7 o superior

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/srp-helpdesk.git
cd srp-helpdesk
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
- Crear archivo `.env` basado en `.env.example`
- Configurar las credenciales de la base de datos

4. Iniciar el servidor de desarrollo:
```bash
# Iniciar backend
node server.js

# Iniciar frontend (en otra terminal)
npm start
```

## Estructura del Proyecto

```
srp-helpdesk/
├── src/               # Código fuente del frontend
├── public/           # Archivos públicos
├── server.js         # Servidor backend
└── package.json      # Dependencias y scripts
```

## Despliegue

### Frontend
- Generar build de producción: `npm run build`
- Subir contenido de la carpeta `build` al hosting

### Backend
- Configurar variables de entorno en el servidor
- Instalar dependencias: `npm install --production`
- Iniciar servidor: `node server.js`

## Licencia

Este proyecto es privado y propietario. Todos los derechos reservados. 
>>>>>>> c95ba3e (Versión inicial del sistema de Help Desk)
