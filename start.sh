#!/bin/bash

echo "🚀 Iniciando Sistema de Parqueadero con Docker Compose..."
echo ""

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor, instala Docker primero."
    exit 1
fi

# Verificar si Docker Compose está disponible
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose no está disponible. Por favor, instala Docker Compose primero."
    exit 1
fi

echo "✅ Docker y Docker Compose están instalados"
echo ""

# Detener contenedores existentes
echo "🛑 Deteniendo contenedores existentes..."
docker compose down

echo ""
echo "🔨 Construyendo e iniciando contenedores..."
docker compose up --build -d

echo ""
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

echo ""
echo "✅ Sistema iniciado exitosamente!"
echo ""
echo "📝 Información de acceso:"
echo "   - Frontend: http://localhost:5174"
echo "   - Backend API: http://localhost:8082/api"
echo "   - Base de datos PostgreSQL: localhost:5435"
echo ""
echo "👤 Credenciales por defecto:"
echo "   - Usuario: admin"
echo "   - Contraseña: admin123"
echo ""
echo "📊 Para ver los logs:"
echo "   docker compose logs -f"
echo ""
echo "🛑 Para detener el sistema:"
echo "   docker compose down"
