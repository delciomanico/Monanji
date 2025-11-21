#!/bin/bash

# Script de configuração do Sistema de Denúncias MININT
# Este script automatiza a configuração inicial do projeto

echo "🏛️ Sistema de Denúncias MININT - Configuração Inicial"
echo "======================================================="

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js v18 ou superior."
    exit 1
fi

# Verificar se o PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL não encontrado. Por favor, instale o PostgreSQL v14 ou superior."
    exit 1
fi

echo "✅ Pré-requisitos verificados"

# Instalar dependências do projeto principal
echo "📦 A instalar dependências do projeto principal..."
npm install

# Configurar API
echo "🔧 A configurar API backend..."
cd api

# Instalar dependências da API
echo "📦 A instalar dependências da API..."
npm install

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "📝 A criar arquivo de configuração .env..."
    cp .env.example .env
    echo "⚠️  IMPORTANTE: Edite o arquivo api/.env com as suas configurações de base de dados"
fi

cd ..

# Verificar se a base de dados existe
echo "🗄️ A verificar base de dados..."
DB_EXISTS=$(sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw minint_complaints && echo "true" || echo "false")

if [ "$DB_EXISTS" = "false" ]; then
    echo "📊 A criar base de dados..."
    
    # Criar base de dados
    sudo -u postgres createdb minint_complaints
    
    if [ $? -eq 0 ]; then
        echo "✅ Base de dados criada com sucesso"
        
        # Executar esquema SQL
        echo "🏗️ A criar tabelas na base de dados..."
        sudo -u postgres psql minint_complaints < database/schema.sql
        
        if [ $? -eq 0 ]; then
            echo "✅ Esquema da base de dados criado com sucesso"
        else
            echo "❌ Erro ao criar esquema da base de dados"
        fi
    else
        echo "❌ Erro ao criar base de dados"
    fi
else
    echo "✅ Base de dados já existe"
fi

# Criar directório de uploads se não existir
if [ ! -d "api/uploads" ]; then
    echo "📁 A criar directório de uploads..."
    mkdir -p api/uploads
    echo "✅ Directório de uploads criado"
fi

echo ""
echo "🎉 Configuração concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Edite o arquivo api/.env com as suas configurações de base de dados"
echo "2. Execute 'npm run start:api' para iniciar o servidor backend"
echo "3. Execute 'npm run start:app' para iniciar a aplicação mobile"
echo ""
echo "🌐 Endpoints da API estarão disponíveis em: http://localhost:3000"
echo "📱 Use o Expo Go para testar a aplicação mobile"
echo ""
echo "📞 Em caso de emergência: 113 (Polícia) | 112 (Bombeiros) | 111 (Saúde)"
