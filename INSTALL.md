# Guía de Instalación y Configuración

## Requisitos Previos

- Docker y Docker Compose instalados
- Java 17+ (para desarrollo local)
- Node.js 18+ (para desarrollo local)
- Maven 3.8+ (para desarrollo local)

## Inicio Rápido con Docker

1. **Clonar o navegar al directorio del proyecto**
   ```bash
   cd parqueaderoProyecto
   ```

2. **Dar permisos de ejecución al script de inicio (Linux/Mac)**
   ```bash
   chmod +x start.sh
   ```

3. **Ejecutar el script de inicio**
   ```bash
   ./start.sh
   ```

   O manualmente con Docker Compose:
   ```bash
   docker compose up --build
   ```

4. **Acceder a la aplicación**
   - Frontend: http://localhost:5174
   - Backend: http://localhost:8082/api
   - Credenciales: admin / admin123

## Desarrollo Local

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Estructura de la Base de Datos

El sistema crea automáticamente las siguientes tablas:

- `usuarios`: Gestión de usuarios del sistema
- `roles`: Roles disponibles (ADMIN, OPERADOR, CLIENTE)
- `vehiculos`: Registro de vehículos
- `tickets`: Tickets de entrada/salida
- `tarifas`: Configuración de tarifas por tipo de vehículo

## Configuración de Tarifas

Las tarifas por defecto son:

| Tipo Vehículo | Tarifa/Hora | Tarifa/Día | Tarifa/Minuto |
|---------------|-------------|------------|---------------|
| AUTO          | $5.00       | $40.00     | $0.15         |
| MOTO          | $3.00       | $25.00     | $0.10         |
| BICICLETA     | $2.00       | $15.00     | $0.05         |
| CAMION        | $8.00       | $60.00     | $0.20         |

## Roles y Permisos

- **ADMIN**: Acceso completo al sistema
- **OPERADOR**: Gestión de tickets y vehículos
- **CLIENTE**: Solo consultas (no implementado en v1.0)

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/registro` - Registrar usuario

### Vehículos
- `GET /api/vehiculos` - Listar vehículos
- `POST /api/vehiculos` - Registrar vehículo
- `GET /api/vehiculos/{id}` - Obtener vehículo
- `PUT /api/vehiculos/{id}` - Actualizar vehículo
- `DELETE /api/vehiculos/{id}` - Eliminar vehículo

### Tickets
- `GET /api/tickets` - Listar tickets
- `POST /api/tickets/entrada` - Registrar entrada
- `POST /api/tickets/salida/{codigo}` - Registrar salida
- `GET /api/tickets/{codigo}` - Obtener ticket
- `GET /api/tickets/activos` - Listar tickets activos
- `GET /api/tickets/calcular/{codigo}` - Calcular tarifa

## Solución de Problemas

### El backend no se conecta a la base de datos

Verificar que PostgreSQL esté corriendo:
```bash
docker-compose ps
```

### Error de CORS en el frontend

Verificar la configuración de CORS en `SecurityConfig.java`

### El frontend no puede conectarse al backend

Verificar la variable de entorno `VITE_API_URL` en el archivo `.env`

## Comandos Útiles

```bash
# Ver logs de todos los servicios
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f backend

# Reiniciar un servicio
docker compose restart backend

# Detener todos los servicios
docker compose down

# Eliminar volúmenes (base de datos)
docker compose down -v
```

## Pruebas

### Probar el API con curl

```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Listar vehículos (requiere token)
curl -X GET http://localhost:8080/api/vehiculos \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Próximos Pasos

1. Implementar reportes y estadísticas
2. Agregar notificaciones por email
3. Integrar sistema de pagos
4. Agregar dashboard con gráficos
5. Implementar búsqueda avanzada
