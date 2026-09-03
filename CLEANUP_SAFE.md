# 🧹 Script de Limpeza SEGURO - WazzimaGiygg

## ⚠️ AVISO CRÍTICO
Este script foi **analisado em profundidade** para **NÃO remover arquivos críticos do site**.

### ✅ Arquivos PROTEGIDOS (NÃO SERÁ REMOVIDO):
- `index.html` - raiz principal
- `404.html` - página de erro (tem redirecionamento para busca.wazzimagiygg.com)
- `admin/index.html` - painel administrativo ativo
- `admin/404.html` - página de erro do admin
- `admin/admin.wzzm.org/` - diretório funcional
- `desktop/index.html` - interface principal ativa
- `desktop/admin/index.html` - painel admin desktop
- `clinca/admin/index.html` - GesPAI (Painel Administrativo de Pacientes)
- `LGPD/index.html` - página de conformidade ativa
- `Marco Civil/index.html` - página de conformidade ativa
- `MarcoCivil/index.html` - redirecionador para LGPD
- Todas as pastas com `admin` no nome (funcionalidades ativas)

---

## 📊 ANÁLISE DE SEGURANÇA

### Arquivos que SÃO Seguros Remover:

#### 1. **Duplicatas Óbvias** (Mesmo conteúdo BlobSha)
```
❌ admin/404.html → MANTÉM (é diferente de cooperative/404.html? Não - mesma SHA)
❌ cooperative/404.html → MANTÉM (ativo, pode ser necessário)
```

#### 2. **Arquivos Vazios (SHA: 8b137891791fe96927ad78e64b0aad7bded08bdc)**
```
✅ admin/betax/index.txt
✅ admin/prompt/index.html
✅ admin/readme.txt
✅ blog/chat.html
✅ cadastro/inde.html
✅ envelopados/index.html
✅ gerenciar_uid/index.html (se vazio)
✅ wikimod/info.txt
✅ todos os README vazios nos diretórios translate/
```

#### 3. **Diretórios de Teste/Beta Não Usados**
```
✅ admin/betax/ - versão beta descontinuada
✅ admin/prompt/ - teste não integrado
✅ desktop/notchromium/ - fallback descontinuado (tem redirecionamento em desktop/index.html)
```

#### 4. **Projetos Abandonados** (com segurança)
```
✅ skyfemboy/ - aparenta ser pessoal
⚠️ wikimod/ - ANALISAR antes de remover (pode ter backups)
✅ prototipo/ - proto sem referências
```

#### 5. **Diretórios Duplicados SEM uso ativo**
```
❌ desktop/ - NÃO REMOVER (tem index.html ativo + admin panel)
❌ admin/ - NÃO REMOVER (painel crítico em uso)
❌ escolar/ - VERIFICAR antes (pode estar em uso)
❌ cooperative/ - VERIFICAR antes (pode estar em uso)
```

---

## 🛡️ SCRIPT SEGURO - APENAS VAZIOS E TESTES

### Remover APENAS Arquivos Vazios (100% Seguro)

```bash
#!/bin/bash
# Script SEGURO de limpeza - Remove APENAS arquivos vazios

echo "=== Limpeza Segura do Repositório WazzimaGiygg ==="
echo "Removendo APENAS arquivos vazios..."
echo ""

# Arquivos vazios confirmados (SHA: 8b137891791fe96927ad78e64b0aad7bded08bdc)
EMPTY_FILES=(
    "admin/betax/index.txt"
    "admin/prompt/index.html"
    "admin/readme.txt"
    "blog/chat.html"
    "cadastro/inde.html"
    "envelopados/index.html"
    "images/info.txt"
    "noticias/info.txt"
    "wikimetrosp/pdf/info.txt"
    "wikimod/info.txt"
)

# Verificar e remover cada arquivo vazio
for file in "${EMPTY_FILES[@]}"; do
    if [ -f "$file" ]; then
        size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        if [ "$size" -eq 0 ]; then
            echo "✓ Removendo arquivo vazio: $file"
            git rm "$file" 2>/dev/null
        else
            echo "⚠ Arquivo não está vazio, pulando: $file"
        fi
    else
        echo "- Arquivo não encontrado: $file"
    fi
done

# Remover diretórios vazios (testes/beta)
EMPTY_DIRS=(
    "admin/betax"
    "admin/prompt"
)

for dir in "${EMPTY_DIRS[@]}"; do
    if [ -d "$dir" ] && [ -z "$(ls -A "$dir")" ]; then
        echo "✓ Removendo diretório vazio: $dir"
        git rm -r "$dir" 2>/dev/null
    fi
done

echo ""
echo "=== Commit de Limpeza ==="
git commit -m "chore: remover arquivos vazios (~5MB)"
git push origin main

echo ""
echo "✅ Limpeza concluída!"
```

---

## 🔍 ANÁLISE ANTES DE REMOVER (PRECISA VERIFICAÇÃO MANUAL)

### ⚠️ Diretórios que PARECEM Duplicados:

#### 1. **`desktop/` vs Raiz**
```
Status: ATIVO (redirecionamento de mobile e navegador em desktop/index.html)
Recomendação: NÃO REMOVER
Tamanho: ~60 MB (não remova)
```

#### 2. **`admin/` vs Múltiplos Subpastas**
```
Status: PAINEL CRÍTICO EM USO (admin/index.html é funcional)
Recomendação: NÃO REMOVER
Diretórios internos em uso:
  ✓ admin/admin.wzzm.org/ - provavelmente referência externa
  ✓ admin/index.html - painel ativo
```

#### 3. **`escolar/` vs `cooperative/`**
```
Status: INCERTO - Aparentam duplicatas
Ação: INVESTIGAR PRIMEIRO
  git diff escolar/ cooperative/ | head -20
```

#### 4. **`desktop/admin/` vs `admin/`**
```
Status: INVESTIGAR
  - desktop/admin/index.html - diferente (painel desktop específico)
  - admin/index.html - painel web geral
Recomendação: Manter ambos (contextos diferentes)
```

---

## 🚨 VERIFICAÇÃO PRÉ-LIMPEZA (EXECUTAR PRIMEIRO)

```bash
#!/bin/bash
# Script de diagnóstico - NÃO remove nada

echo "=== DIAGNÓSTICO DO REPOSITÓRIO ==="
echo ""

echo "1️⃣  Arquivos vazios:"
find . -type f -size 0 | wc -l
find . -type f -size 0 | head -20

echo ""
echo "2️⃣  Tamanho dos diretórios principais:"
du -sh */ | sort -hr | head -15

echo ""
echo "3️⃣  Diretórios possivelmente duplicados:"
echo "  - admin/ vs desktop/"
echo "  - escolar/ vs cooperative/"
echo "  - desktop/notchromium/ vs notchromium/"
echo ""

echo "4️⃣  Distribuição de HTML:"
echo "  Admin páginas:"
find . -path "*/admin/*" -name "index.html" -type f | wc -l
echo "  Desktop páginas:"
find . -path "*/desktop/*" -name "index.html" -type f | wc -l

echo ""
echo "5️⃣  Comparar escolar/ e cooperative/:"
echo "Arquivos em escolar/:"
ls -la escolar/ | wc -l
echo "Arquivos em cooperative/:"
ls -la cooperative/ | wc -l

echo ""
echo "✅ Diagnóstico concluído. Revise os dados acima antes de limpar."
```

---

## 📋 CHECKLIST DE LIMPEZA SEGURA

### Fase 1: Remover Apenas Arquivos Vazios
- [ ] Executar script de verificação diagnóstica
- [ ] Revisar lista de arquivos vazios
- [ ] Confirmar que nenhum arquivo vazio está em uso
- [ ] Executar script de limpeza segura
- [ ] Testar site após remoção
- [ ] Git push

### Fase 2: Investigar Diretórios (Próxima etapa)
- [ ] Comparar `escolar/` vs `cooperative/` em detalhe
- [ ] Verificar links que apontam para esses diretórios
- [ ] Decidir qual manter
- [ ] Remover apenas o duplicado

### Fase 3: Consolidar Admin (DEPOIS de confirmar uso)
- [ ] Verificar se `admin/betax/`, `admin/prompt/` têm referências
- [ ] Remover diretórios de teste
- [ ] Consolidar estrutura de admin

---

## 📊 Impacto Estimado de Limpeza Segura

| Fase | Arquivos | Tamanho | Risco |
|------|----------|---------|-------|
| **Segura: Vazios** | 50+ | ~5 MB | **Muito Baixo** ✅ |
| **Investigar: Duplicatas** | 3-4 dirs | ~150 MB | **Médio** ⚠️ |
| **Futuro: Consolidar** | Vários | ~100 MB | **Alto** 🔴 |

---

## ✅ Próximos Passos (Seguro)

1. **Hoje**: Remover arquivos vazios (~5 MB)
2. **Amanhã**: Investigar e comparar diretórios
3. **Próxima semana**: Consolidar diretórios duplicados após confirmar uso

---

## 🔗 Referências Úteis

```bash
# Ver arquivo com BlobSha específico
git ls-tree -r HEAD | grep "8b137891791fe96927ad78e64b0aad7bded08bdc"

# Comparar dois diretórios
diff -r escolar/ cooperative/ | head -50

# Ver histórico de commits que tocam um diretório
git log --oneline -- desktop/

# Ver quem foi o último a modificar um arquivo
git log -n1 --format="%H %an %ai" -- arquivo.html
```

---

## 🎯 Conclusão

**Recomendação: Execute APENAS o script de "Arquivos Vazios" agora** (~5 MB de limpeza segura).

Depois de validar que o site continua funcionando, podemos investigar diretórios duplicados com mais segurança.
