# CredConecta - Sistema de Gestão de Empréstimos

Sistema mobile para gestão de empréstimos com interface otimizada para dispositivos móveis.

## 🚀 Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Shadcn/UI** - Componentes de interface
- **Supabase** - Banco de dados e autenticação
- **Expo** - Desenvolvimento mobile

## 📱 Configuração Mobile (Expo)

### 1. Instalar Expo CLI
```bash
npm install -g @expo/cli
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_serv_do_supabase
```

### 3. Configurar Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Execute as queries SQL fornecidas para criar as tabelas
4. Configure as variáveis de ambiente

### 4. Executar no Expo

```bash
# Instalar dependências
npm install

# Iniciar Expo
npx expo start

# Para testar no dispositivo
# Baixe o app Expo Go na App Store/Play Store
# Escaneie o QR code que aparece no terminal
```

## 🗄️ Estrutura do Banco de Dados

### Tabela `users`
- `id` (UUID) - Chave primária
- `full_name` (TEXT) - Nome completo
- `cpf` (TEXT) - CPF único
- `password` (TEXT) - Senha
- `is_blocked` (BOOLEAN) - Status de bloqueio
- `monthly_payment_status` (TEXT) - Status de pagamento
- `created_at` (TIMESTAMP) - Data de criação

### Tabela `loans`
- `id` (UUID) - Chave primária
- `full_name` (TEXT) - Nome do cliente
- `cpf` (TEXT) - CPF do cliente
- `phone` (TEXT) - Telefone
- `loan_date` (DATE) - Data do empréstimo
- `loan_amount` (DECIMAL) - Valor do empréstimo
- `total_installments` (INTEGER) - Total de parcelas
- `paid_installments` (INTEGER) - Parcelas pagas
- `remaining_installments` (INTEGER) - Parcelas restantes
- `daily_penalty` (DECIMAL) - Multa diária
- `photo` (TEXT) - URL da foto
- `is_settled` (BOOLEAN) - Status de quitação
- `created_by` (TEXT) - ID do criador
- `created_at` (TIMESTAMP) - Data de criação
- `updated_at` (TIMESTAMP) - Data de atualização

## 🔐 Credenciais de Acesso

### Administrador
- **Senha**: 8470

### Usuário Teste (após criar no banco)
- **CPF**: 123.456.789-00
- **Senha**: 1234

## 🧪 Testando a Aplicação

1. **Teste de Conexão**: O app testará automaticamente a conexão com Supabase
2. **Login Admin**: Use a senha 8470
3. **Criar Usuário**: No painel admin, cadastre um novo usuário
4. **Login Usuário**: Use as credenciais criadas
5. **Cadastrar Empréstimo**: Teste todas as funcionalidades

## 📱 Funcionalidades Mobile

- ✅ Interface otimizada para touch
- ✅ Navegação por tabs
- ✅ Captura de foto pela câmera
- ✅ Upload de imagens
- ✅ Formulários responsivos
- ✅ Relatórios em tempo real
- ✅ Sincronização com banco de dados

## 🔧 Comandos Úteis

```bash
# Desenvolvimento local
npm run dev

# Build para produção
npm run build

# Expo development
npx expo start

# Expo build
npx expo build

# Testar no iOS Simulator
npx expo start --ios

# Testar no Android Emulator
npx expo start --android
```

## 📋 Checklist de Deploy

- [ ] Configurar variáveis de ambiente no Supabase
- [ ] Executar queries SQL para criar tabelas
- [ ] Configurar RLS policies
- [ ] Testar conexão com banco
- [ ] Criar usuário de teste
- [ ] Testar no Expo Go
- [ ] Build para produção

## 🆘 Troubleshooting

### Erro de Conexão Supabase
1. Verifique as variáveis de ambiente
2. Confirme se o projeto Supabase está ativo
3. Verifique as políticas RLS

### Erro no Expo
1. Limpe o cache: `npx expo start --clear`
2. Reinstale dependências: `rm -rf node_modules && npm install`
3. Verifique se o Expo CLI está atualizado

### Problemas de Câmera
1. Verifique permissões no app.json
2. Teste em dispositivo físico (câmera não funciona em simulador)
3. Confirme se o Expo Go tem permissão de câmera