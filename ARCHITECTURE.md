# Documentación Técnica - Sistema de Parqueadero

## Arquitectura del Sistema

### Visión General

El sistema implementa una arquitectura **monolítica modular en capas** con clara separación de responsabilidades:

```
┌─────────────────────────────────────────────┐
│            Frontend (React)                 │
│  - Components (UI)                          │
│  - Services (API Client)                    │
│  - Context (Estado Global)                  │
└─────────────────┬───────────────────────────┘
                  │ HTTP/REST + JWT
┌─────────────────▼───────────────────────────┐
│         Backend (Spring Boot)               │
│  ┌─────────────────────────────────────┐    │
│  │   Controller Layer                  │    │
│  │   - Endpoints REST                  │    │
│  │   - Validación de entrada          │    │
│  └──────────────┬──────────────────────┘    │
│  ┌──────────────▼──────────────────────┐    │
│  │   Service Layer                     │    │
│  │   - Lógica de negocio              │    │
│  │   - Aplicación de patrones         │    │
│  └──────────────┬──────────────────────┘    │
│  ┌──────────────▼──────────────────────┐    │
│  │   Repository Layer                  │    │
│  │   - Abstracción de persistencia    │    │
│  └──────────────┬──────────────────────┘    │
│  ┌──────────────▼──────────────────────┐    │
│  │   Model Layer                       │    │
│  │   - Entidades JPA                  │    │
│  └─────────────────────────────────────┘    │
└─────────────────┬───────────────────────────┘
                  │ JDBC
┌─────────────────▼───────────────────────────┐
│       PostgreSQL Database                   │
└─────────────────────────────────────────────┘
```

## Patrones de Diseño Implementados

### 1. Strategy Pattern (Cálculo de Tarifas)

**Ubicación**: `com.parqueadero.pattern.strategy`

**Propósito**: Encapsular diferentes algoritmos de cálculo de tarifas.

**Implementación**:
```java
public interface TarifaStrategy {
    BigDecimal calcularTarifa(LocalDateTime entrada, LocalDateTime salida, Tarifa tarifa);
    String getDetalleCalculo(LocalDateTime entrada, LocalDateTime salida, Tarifa tarifa);
}
```

**Estrategia Concreta**: `TarifaPorHoraStrategy`
- Calcula por días completos
- Luego por horas completas
- Finalmente por minutos adicionales

**Ventajas**:
- Fácil agregar nuevas estrategias (por ejemplo, tarifa plana, descuentos por volumen)
- Cumple con el principio Open/Closed
- Testeable independientemente

### 2. Factory Pattern (Creación de Objetos)

**Ubicación**: `com.parqueadero.pattern.factory`

**Propósito**: Centralizar la creación de objetos de dominio complejos.

**Implementaciones**:

**TicketFactory**:
```java
public Ticket crearTicketEntrada(Vehiculo vehiculo, Usuario usuario, String observaciones) {
    // Lógica de creación
    // Genera código único
    // Establece estado inicial
    // Configura fecha/hora
}
```

**VehiculoFactory**:
```java
public Vehiculo crearVehiculo(String placa, String tipo, ...) {
    // Normaliza datos (placa en mayúsculas)
    // Valida tipo de vehículo
    // Crea instancia configurada
}
```

**Ventajas**:
- Encapsula lógica de creación compleja
- Garantiza consistencia en la creación de objetos
- Facilita cambios en la lógica de creación

### 3. State Pattern (Estados del Ticket)

**Ubicación**: `com.parqueadero.pattern.state`

**Propósito**: Gestionar transiciones de estado del ticket de forma controlada.

**Diagrama de Estados**:
```
┌─────────┐
│ ACTIVO  │───procesarPago()───┐
└────┬────┘                    ▼
     │                    ┌─────────┐
     └───cancelar()──────►│ PAGADO  │
                          └─────────┘
                               │
                               │
                          ┌────▼──────┐
                          │ CANCELADO │
                          └───────────┘
```

**Implementación**:
- `TicketActivoState`: Permite pago y cancelación
- `TicketPagadoState`: Estado final, no permite cambios
- `TicketCanceladoState`: Estado final, no permite cambios

**Ventajas**:
- Previene transiciones inválidas
- Código más mantenible
- Fácil agregar nuevos estados

### 4. Repository Pattern (Persistencia)

**Ubicación**: `com.parqueadero.repository`

**Propósito**: Abstraer el acceso a datos y desacoplar la lógica de negocio de la persistencia.

**Ventajas**:
- Cambiar implementación de persistencia sin afectar servicios
- Facilita testing con mocks
- Queries centralizadas y reusables

## Principios SOLID Aplicados

### Single Responsibility Principle (SRP)
- Cada clase tiene una única responsabilidad
- Controllers: Solo manejan HTTP
- Services: Solo lógica de negocio
- Repositories: Solo acceso a datos

### Open/Closed Principle (OCP)
- Sistema abierto a extensión (nuevas estrategias de tarifa)
- Cerrado a modificación (código existente no cambia)

### Liskov Substitution Principle (LSP)
- Todas las implementaciones de `TarifaStrategy` son intercambiables
- Todos los estados de `TicketState` son intercambiables

### Interface Segregation Principle (ISP)
- Interfaces pequeñas y específicas
- Clientes no dependen de métodos que no usan

### Dependency Inversion Principle (DIP)
- Servicios dependen de interfaces (Repository)
- No dependen de implementaciones concretas

## Seguridad

### Autenticación y Autorización

**Mecanismo**: JWT (JSON Web Tokens) stateless

**Flujo de Autenticación**:
```
1. Usuario envía credenciales → /api/auth/login
2. Backend valida credenciales
3. Si válidas, genera JWT firmado
4. Cliente guarda token en localStorage
5. Cliente incluye token en header: Authorization: Bearer <token>
6. Backend valida token en cada petición (AuthTokenFilter)
7. Si token válido, permite acceso
```

**Características de Seguridad**:
- Contraseñas hasheadas con BCrypt
- Tokens con tiempo de expiración
- Control de acceso basado en roles (RBAC)
- CORS configurado
- Validación de datos con Bean Validation
- Manejo centralizado de excepciones

### Roles y Permisos

| Rol | Permisos |
|-----|----------|
| ADMIN | Acceso completo, puede eliminar registros |
| OPERADOR | Gestión de tickets y vehículos |
| CLIENTE | Solo consultas (futuro) |

## Base de Datos

### Modelo de Datos

```sql
usuarios (1) ←──→ (N) usuario_roles (N) ←──→ (1) roles
    │
    │ (1:N)
    ▼
tickets (N) ←──→ (1) vehiculos
    │
    │ (N:1)
    ▼
tarifas (por tipo de vehículo)
```

### Índices Recomendados

```sql
CREATE INDEX idx_ticket_estado ON tickets(estado);
CREATE INDEX idx_ticket_vehiculo ON tickets(vehiculo_id);
CREATE INDEX idx_vehiculo_placa ON vehiculos(placa);
CREATE INDEX idx_usuario_username ON usuarios(username);
```

## API REST

### Convenciones

- **Formato**: JSON
- **Autenticación**: Bearer Token (JWT)
- **Códigos HTTP**:
  - 200: Éxito
  - 201: Creado
  - 400: Error de validación
  - 401: No autenticado
  - 403: No autorizado
  - 404: No encontrado
  - 500: Error del servidor

### Ejemplos de Uso

**Registrar Entrada**:
```bash
curl -X POST http://localhost:8080/api/tickets/entrada \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehiculoId": 1,
    "observaciones": "Vehículo con rayones"
  }'
```

**Registrar Salida**:
```bash
curl -X POST http://localhost:8080/api/tickets/salida/TKT-ABC12345 \
  -H "Authorization: Bearer TOKEN"
```

## Frontend

### Estructura de Componentes

```
App
├── AuthProvider (Context)
├── Router
    ├── Login (Público)
    └── PrivateRoute (Requiere autenticación)
        ├── Dashboard
        ├── Vehiculos
        ├── Tickets
        └── TicketsActivos
```

### Gestión de Estado

- **Autenticación**: Context API (`AuthContext`)
- **Estado Local**: useState para formularios y listas
- **Persistencia**: localStorage para token y usuario

### Comunicación con Backend

- **Librería**: Axios
- **Interceptores**:
  - Request: Agrega token JWT automáticamente
  - Response: Maneja errores 401 (redirige a login)

## Dockerización

### Contenedores

1. **PostgreSQL**: Base de datos
2. **Backend**: Aplicación Spring Boot
3. **Frontend**: Aplicación React servida por Nginx

### Redes

- Red interna: `parqueadero-network`
- Comunicación entre contenedores por nombres de servicio

### Volúmenes

- `postgres_data`: Persistencia de base de datos

## Testing (Futuro)

### Backend
- Unit Tests: JUnit 5 + Mockito
- Integration Tests: TestContainers
- API Tests: RestAssured

### Frontend
- Unit Tests: Vitest
- Component Tests: React Testing Library
- E2E Tests: Playwright

## Performance

### Optimizaciones Implementadas

1. **Lazy Loading**: Relaciones JPA con FetchType.LAZY
2. **Índices**: En campos frecuentemente consultados
3. **Connection Pooling**: HikariCP (default en Spring Boot)
4. **Caching**: Preparado para Redis (futuro)

### Recomendaciones

- Implementar paginación para listados grandes
- Agregar caché para tarifas (cambian poco)
- Comprimir respuestas HTTP (gzip)

## Mantenibilidad

### Logs

- Nivel DEBUG en desarrollo
- Nivel INFO en producción
- Logs estructurados para búsqueda fácil

### Monitoreo

- Actuator endpoints para health checks
- Métricas disponibles en `/actuator`

## Escalabilidad Futura

### Posibles Mejoras

1. **Microservicios**: Separar en servicios independientes
   - Servicio de Autenticación
   - Servicio de Tickets
   - Servicio de Tarifas

2. **Event-Driven**: Usar mensajería (RabbitMQ/Kafka)
   - Eventos de entrada/salida
   - Notificaciones asíncronas

3. **CQRS**: Separar lecturas de escrituras

4. **API Gateway**: Para enrutamiento centralizado

## Conclusión

El sistema implementa un diseño robusto, modular y preparado para evolución futura, siguiendo las mejores prácticas de ingeniería de software y patrones de diseño establecidos.
