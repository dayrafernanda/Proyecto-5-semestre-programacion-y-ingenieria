#!/bin/bash

echo "Ì¥ß Reparando configuraci√≥n de routing..."

# 1. Verificar que todos los componentes existen
echo "Ì≥Å Verificando componentes..."
components=(
  "login"
  "dashboard"
  "project-form"
  "portfolio"
  "project-review"
  "audit"
  "user-management"
  "academic-periods"
  "repository"
)

for component in "${components[@]}"; do
  if [ -f "src/app/components/${component}/${component}.component.ts" ]; then
    echo "‚úÖ $component"
  else
    echo "‚ùå $component - FALTANTE"
  fi
done

# 2. Verificar guards
echo ""
echo "Ìª°Ô∏è Verificando guards..."
if [ -f "src/app/guards/auth.guard.ts" ]; then
  echo "‚úÖ auth.guard"
else
  echo "‚ùå auth.guard - FALTANTE"
fi

if [ -f "src/app/guards/role.guard.ts" ]; then
  echo "‚úÖ role.guard"
else
  echo "‚ùå role.guard - FALTANTE"
fi

# 3. Verificar estructura principal
echo ""
echo "ÌøóÔ∏è Verificando estructura principal..."
if [ -f "src/app/app.component.ts" ]; then
  echo "‚úÖ app.component.ts"
else
  echo "‚ùå app.component.ts - FALTANTE"
fi

if [ -f "src/app/app.routes.ts" ]; then
  echo "‚úÖ app.routes.ts"
else
  echo "‚ùå app.routes.ts - FALTANTE"
fi

if [ -f "src/app/app.config.ts" ]; then
  echo "‚úÖ app.config.ts"
else
  echo "‚ùå app.config.ts - FALTANTE"
fi

if [ -f "src/main.ts" ]; then
  echo "‚úÖ main.ts"
else
  echo "‚ùå main.ts - FALTANTE"
fi

echo ""
echo "ÌæØ Reparaci√≥n completada. Reinicia el servidor."
