# Sistema de Parqueadero

Sistema de gestión de parqueadero desarrollado con arquitectura monolítica modular en capas.

## 🏗️ Arquitectura

### Backend
- **Framework**: Spring Boot 3.x
- **Lenguaje**: Java 17+
- **Base de Datos**: PostgreSQL
- **Seguridad**: Spring Security con JWT
- **Patrones de Diseño**: Strategy, Factory, Repository, State
- **Principios**: SOLID

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Consumo API**: REST

## 📋 Estructura del Proyecto

```
parqueaderoProyecto/
├── backend/                 # Aplicación Spring Boot
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/parqueadero/
│   │   │   │       ├── config/          # Configuraciones
│   │   │   │       ├── controller/      # Controladores REST
│   │   │   │       ├── service/         # Lógica de negocio
│   │   │   │       ├── repository/      # Acceso a datos
│   │   │   │       ├── model/           # Entidades
│   │   │   │       ├── dto/             # Data Transfer Objects
│   │   │   │       ├── security/        # JWT y seguridad
│   │   │   │       ├── pattern/         # Patrones de diseño
│   │   │   │       └── exception/       # Manejo de excepciones
│   │   │   └── resources/
│   │   └── test/
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                # Aplicación React
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── context/
│   │   └── pages/
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

## 🚀 Inicio Rápido

### Con Docker Compose (Recomendado)

```bash
docker compose up --build
```

### Desarrollo Local

#### Backend
```bash
cd backend
./mvnw spring-boot:run
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## � Información de Acceso

- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:8082/api
- **Base de datos PostgreSQL**: localhost:5435
- **Credenciales**: `admin` / `admin123`

## �🔐 Seguridad

- Autenticación stateless con JWT
- Control de acceso basado en roles (RBAC)
- Validación de datos con Bean Validation
- Manejo centralizado de excepciones
- Protección CSRF y CORS configurados

## 📊 Patrones de Diseño Implementados

1. **Strategy**: Cálculo de tarifas según tipo de vehículo
2. **Factory**: Creación de objetos de dominio (Tickets, Vehículos)
3. **Repository**: Abstracción de persistencia
4. **State**: Gestión de estados del ticket (Activo, Pagado, Cancelado)

## 🔧 Tecnologías

- Spring Boot 3.2.x
- Spring Security
- Spring Data JPA
- PostgreSQL 15
- JWT (jjwt)
- React 18
- Vite 5
- Docker & Docker Compose

## 📝 Licencia

MIT License
