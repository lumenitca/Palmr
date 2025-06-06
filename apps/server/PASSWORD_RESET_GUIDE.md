# 🔐 Palmr Password Reset Guide

Este guia explica como resetar senhas de usuários diretamente no container Docker, sem necessidade de configuração SMTP.

## 📋 Visão Geral

O sistema Palmr possui uma funcionalidade de reset de senha que normalmente depende de configurações SMTP para enviar emails. Este script CLI permite que administradores com acesso ao terminal do Docker resetem senhas de usuários de forma **interativa e segura**, respeitando todas as regras de segurança e encriptação do sistema.

## 🚀 Como Usar

### Script Shell Interativo (Única Opção)

1. **Acesse o container Docker:**
   ```bash
   docker exec -it <container_name> /bin/sh
   ```

2. **Navegue para o diretório do servidor:**
   ```bash
   cd /app/server
   ```

3. **Execute o script de reset:**
   ```bash
   ./reset-password.sh
   ```

## 📚 Comandos Disponíveis

### Reset de Senha Interativo
```bash
./reset-password.sh
```

### Listar Usuários do Sistema
```bash
./reset-password.sh --list
```

### Ajuda
```bash
./reset-password.sh --help
```

## 🔒 Segurança

### O que o script faz:
- ✅ **Modo interativo obrigatório** - Todas as ações requerem confirmação
- ✅ **Encriptação bcrypt** com salt rounds 10 (idêntico ao sistema)
- ✅ **Validação rigorosa** de formato de email e regras de senha
- ✅ **Confirmação dupla** da nova senha antes de aplicar
- ✅ **Limpeza automática** de tokens de reset existentes
- ✅ **Logs detalhados** de todas as operações
- ✅ **Verificação de usuário** com exibição completa dos dados

### O que o script NÃO faz:
- ❌ Não permite operações sem confirmação
- ❌ Não bypassa autenticação (requer acesso ao container)
- ❌ Não registra tentativas de login inválidas
- ❌ Não envia notificações por email
- ❌ Não altera outras configurações do usuário

## 📖 Fluxo de Uso

1. **Iniciar o script** - Execute `./reset-password.sh`
2. **Inserir email** - Digite o email do usuário que terá a senha resetada
3. **Verificar usuário** - O sistema mostra informações completas do usuário
4. **Confirmar ação** - Confirme explicitamente se deseja prosseguir
5. **Nova senha** - Digite a nova senha (mínimo 8 caracteres)
6. **Confirmar senha** - Digite novamente para confirmar
7. **Sucesso** - Senha atualizada com confirmação detalhada

## 🔧 Exemplo de Uso

```bash
$ ./reset-password.sh

🔐 Palmr Password Reset Tool
===============================
This script allows you to reset a user's password directly from the Docker terminal.
⚠️  WARNING: This bypasses normal security checks. Use only when necessary!

Enter user email: user@example.com

✅ User found:
   Name: João Silva
   Username: joao.silva
   Email: user@example.com
   Status: Active
   Admin: No

Do you want to reset the password for this user? (y/n): y

🔑 Enter new password requirements:
   - Minimum 8 characters

Enter new password: ********
Confirm new password: ********

🔄 Hashing password...
💾 Updating password in database...
🧹 Cleaning up existing password reset tokens...

✅ Password reset successful!
   User: João Silva (user@example.com)
   The user can now login with the new password.

🔐 Security Note: The password has been encrypted using bcrypt with salt rounds of 10.
```

## ⚠️ Importante

### Segurança Aprimorada
- **Modo interativo obrigatório** - Não há atalhos ou comandos diretos
- **Múltiplas confirmações** - Cada etapa requer confirmação explícita
- **Acesso restrito** - Funciona apenas com acesso ao terminal do container
- **Validação completa** - Todos os dados são verificados antes da execução
- **Backup recomendado** - Considere fazer backup do banco antes de usar em produção

### Procedimentos Recomendados
- **Documente o uso** - Registre quando e por que a senha foi resetada
- **Notifique o usuário** - Informe ao usuário sobre a alteração por outros meios
- **Verifique o resultado** - Confirme que o usuário consegue fazer login
- **Monitore logs** - Verifique logs do sistema após o reset

## 🛠️ Solução de Problemas

### Erro: "tsx is not available"
```bash
# O script instalará automaticamente as dependências
# Se falhar, instale manualmente:
pnpm install
# ou
npm install
```

### Erro: "Prisma client not found"
```bash
# O script gerará automaticamente o cliente Prisma
# Se falhar, execute manualmente:
npx prisma generate
```

### Erro: "Database connection failed"
- Verifique se o banco de dados está rodando
- Confirme se o arquivo `prisma/palmr.db` existe e tem permissões corretas
- Verifique se o container tem acesso ao volume do banco

### Erro: "Script must be run from server directory"
```bash
# Certifique-se de estar no diretório correto:
cd /app/server
```

### Erro: "User not found"
- Verifique se o email está correto
- Use `./reset-password.sh --list` para ver todos os usuários
- Confirme se o usuário existe no sistema

## 🔍 Logs e Auditoria

O script gera logs detalhados de todas as ações:
- **Identificação do usuário** encontrado
- **Confirmações** de cada etapa
- **Operações no banco** realizadas
- **Resultado final** da operação

Para auditoria completa, considere:
- Documentar data/hora da execução
- Registrar quem executou o script
- Manter histórico das alterações
- Verificar logs do sistema após o reset

## 🎯 Quando Usar

### Situações Apropriadas:
- ✅ **Usuário admin bloqueado** sem acesso ao email
- ✅ **SMTP não configurado** ou com problemas
- ✅ **Recuperação de emergência** do sistema
- ✅ **Configuração inicial** do ambiente
- ✅ **Testes controlados** em desenvolvimento

### Precauções:
- ⚠️ **Use apenas quando necessário** - Bypassa controles normais
- ⚠️ **Ambiente controlado** - Certifique-se do contexto de uso
- ⚠️ **Comunicação clara** - Informe equipe e usuário afetado
- ⚠️ **Documentação** - Registre o motivo e procedimento

---

**🔐 Filosofia de Segurança:** Este script prioriza segurança através de interatividade obrigatória, múltiplas confirmações e validações rigorosas. Não há atalhos ou modos "rápidos" - cada reset requer atenção e confirmação deliberada do administrador. 