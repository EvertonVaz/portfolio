#!/usr/bin/env bash
#
# Release deliberado: rode no lugar de `git push` quando quiser soltar versão.
# Sem novidade de versão, é um push normal. Com novidade, bumpa o package.json
# do frontend (commit + tag vX.Y.Z) e faz push da tag junto — o Coolify deploya.
#
# O hash do commit NÃO entra aqui: o Coolify injeta via SOURCE_COMMIT no build.
set -euo pipefail

cd "$(dirname "$0")/.."   # raiz do repo

FRONTEND="app/frontend"

read -rp "Nova versão? [y/N] " new
new=${new:-n}

if [[ ! "$new" =~ ^[Yy]$ ]]; then
  echo "→ push normal"
  git push
  exit 0
fi

current=$(node -p "require('./$FRONTEND/package.json').version")
echo "Versão atual: v$current"
read -rp "Qual versão? (X.Y.Z) " version

if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "✗ formato inválido — use X.Y.Z (ex: 0.3.0)"
  exit 1
fi

read -rp "Confirma v$version? [y/N] " ok
ok=${ok:-n}
if [[ ! "$ok" =~ ^[Yy]$ ]]; then
  echo "cancelado"
  exit 1
fi

branch=$(git rev-parse --abbrev-ref HEAD)
if [[ "$branch" != "main" ]]; then
  echo "⚠  você está em '$branch', não em 'main' — o Coolify deploya no push da main"
  read -rp "Seguir mesmo assim? [y/N] " go
  [[ "${go:-n}" =~ ^[Yy]$ ]] || { echo "cancelado"; exit 1; }
fi

# npm version só bumpa os arquivos (--no-git-tag-version): quando o package.json
# está num subdir e não na raiz do git, o npm PULA o commit/tag silenciosamente.
# Por isso o commit e a tag são feitos aqui, explícitos, a partir da raiz.
( cd "$FRONTEND" && npm version "$version" --no-git-tag-version )
git add "$FRONTEND/package.json" "$FRONTEND/package-lock.json"
git commit -m "Release v$version"
git tag -a "v$version" -m "Release v$version"
git push --follow-tags

echo "✓ v$version publicado — o Coolify vai deployar o push da $branch"
