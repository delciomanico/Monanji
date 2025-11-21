# Sistema de Denúncias MININT

Sistema completo de denúncias para o Ministério do Interior de Angola, incluindo API backend em Node.js/PostgreSQL e aplicação mobile em React Native/Expo.

## Estrutura do Projeto

```
├── api/                    # Backend API (Node.js + Express + PostgreSQL)
├── app/                    # Frontend Mobile (React Native + Expo)
├── database/               # Esquema da base de dados
├── services/               # Serviços da aplicação
└── README.md
```

## 🛠️ Configuração do Ambiente

### Pré-requisitos

- Node.js (v18 ou superior)
- PostgreSQL (v14 ou superior)
- Expo CLI
- Git

### 1. Configuração da Base de Dados

1. Instale e inicie o PostgreSQL
2. Crie a base de dados:
   ```sql
   CREATE DATABASE minint_complaints;
   CREATE USER minint_user WITH PASSWORD 'sua_senha';
   GRANT ALL PRIVILEGES ON DATABASE minint_complaints TO minint_user;
   ```

3. Execute o esquema da base de dados:
   ```bash
   psql -U minint_user -d minint_complaints -f database/schema.sql
   ```

### 2. Configuração do Backend API

1. Entre na pasta da API:
   ```bash
   cd api
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```
   Edite o arquivo `.env` com as suas configurações de base de dados.

4. Inicie o servidor:
   ```bash
   npm start
   ```

   Para desenvolvimento com restart automático:
   ```bash
   npm run dev
   ```

### 3. Configuração do Frontend Mobile

1. Na raiz do projeto, instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o Expo:
   ```bash
   npx expo start
   ```

3. Use o Expo Go no seu dispositivo móvel ou emulador para testar a aplicação.

## 📱 Funcionalidades

### Tipos de Denúncias Suportadas

1. **Desaparecimento de Pessoa**
   - Dados pessoais da pessoa desaparecida
   - Circunstâncias do desaparecimento
   - Upload de fotos e documentos
   - Localização e data do último avistamento

2. **Crime Comum**
   - Furto, roubo, agressão, homicídio
   - Detalhes do crime e localização
   - Informações sobre suspeitos
   - Evidências e testemunhas

3. **Corrupção / Crime Económico**
   - Suborno, desvio de fundos
   - Entidades envolvidas
   - Valores e documentos
   - Descrição das irregularidades

4. **Violência Doméstica**
   - Dados da vítima e agressor
   - Tipo de violência
   - Histórico de ocorrências
   - Nível de urgência

5. **Crime Informático**
   - Burlas online, phishing
   - Plataformas envolvidas
   - Screenshots e links
   - Detalhes técnicos

### Características do Sistema

- ✅ **Denúncias Anónimas**: Opção de manter sigilo total da identidade
- ✅ **Acompanhamento em Tempo Real**: Protocolo único para consultar o estado do caso
- ✅ **Upload de Evidências**: Suporte para fotos, documentos e áudios
- ✅ **Busca de Casos**: Consulta por número de BI do denunciante
- ✅ **Notificações**: Actualizações sobre o progresso dos casos
- ✅ **Segurança**: Encriptação de dados e autenticação JWT
- ✅ **Validação**: Verificação de dados e prevenção de spam

## 🔧 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registar utilizador
- `POST /api/auth/login` - Iniciar sessão
- `POST /api/auth/logout` - Terminar sessão
- `GET /api/auth/profile` - Perfil do utilizador

### Denúncias
- `POST /api/complaints` - Submeter nova denúncia
- `GET /api/complaints/:id` - Obter denúncia por ID
- `GET /api/complaints/protocol/:protocol` - Buscar por protocolo
- `PUT /api/complaints/:id/status` - Actualizar estado

### Busca e Consulta
- `GET /api/search/cases/bi/:biNumber` - Buscar casos por BI
- `GET /api/search/protocol/:protocol` - Buscar por protocolo
- `GET /api/search/missing-persons` - Buscar pessoas desaparecidas

### Evidências
- `POST /api/evidence/:complaintId` - Upload de evidências
- `GET /api/evidence/:complaintId` - Listar evidências
- `DELETE /api/evidence/:id` - Remover evidência

### Estatísticas
- `GET /api/stats/dashboard` - Estatísticas gerais
- `GET /api/stats/types` - Estatísticas por tipo
- `GET /api/stats/locations` - Estatísticas por localização

## 📊 Esquema da Base de Dados

### Tabelas Principais

- **complaints**: Denúncias principais
- **missing_person_details**: Detalhes de pessoas desaparecidas
- **common_crime_details**: Detalhes de crimes comuns
- **corruption_details**: Detalhes de corrupção
- **domestic_violence_details**: Detalhes de violência doméstica
- **cyber_crime_details**: Detalhes de crimes informáticos
- **complaint_evidence**: Evidências anexadas
- **users**: Utilizadores do sistema
- **case_notifications**: Notificações de casos

## 🔒 Segurança

### Medidas Implementadas

1. **Autenticação JWT**: Tokens seguros com expiração
2. **Hashing de Passwords**: Bcrypt com salt rounds altos
3. **Rate Limiting**: Limitação de pedidos por IP
4. **Validação de Entrada**: express-validator para todos os inputs
5. **Sanitização**: Limpeza de dados para prevenir XSS
6. **CORS**: Configuração adequada para requests cross-origin
7. **Upload Seguro**: Validação de tipos e tamanhos de ficheiro
8. **Row-Level Security**: Políticas na base de dados

## 🚀 Como Executar

### 1. Iniciar a Base de Dados
```bash
# Certifique-se que o PostgreSQL está a correr
sudo systemctl start postgresql

# Crie a base de dados (apenas na primeira vez)
sudo -u postgres createdb minint_complaints
sudo -u postgres psql minint_complaints < database/schema.sql
```

### 2. Iniciar o Backend API
```bash
cd api
npm install
npm start
```

O servidor estará disponível em `http://localhost:3000`

### 3. Iniciar a Aplicação Mobile
```bash
# Na raiz do projeto
npm install
npx expo start
```

Use o Expo Go no seu dispositivo ou emulador para testar a aplicação.

## 📞 Contactos de Emergência

Em casos de emergência imediata, contacte:
- **Polícia**: 113
- **Bombeiros**: 112
- **Saúde**: 111

## 🏛️ Ministério do Interior - República de Angola

Sistema desenvolvido para modernizar e digitalizar o processo de denúncias, promovendo transparência, eficiência e acesso à justiça para todos os cidadãos angolanos.