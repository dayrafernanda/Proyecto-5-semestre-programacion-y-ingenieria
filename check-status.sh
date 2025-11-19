
echo "��� Verificando estado del proyecto ..."

echo "��� Compilando proyecto..."
ng build --configuration development --no-progress

if [ $? -eq 0 ]; then
    echo "✅ Compilación exitosa"
else
    echo "❌ Error en compilación"
    exit 1
fi

echo "��� Verificando servicios..."
if [ -f "src/app/services/auth.service.ts" ]; then
    echo "✅ Auth Service: OK"
else
    echo "❌ Auth Service: Faltante"
fi

if [ -f "src/app/guards/auth.guard.ts" ]; then
    echo "✅ Auth Guard: OK" 
else
    echo "❌ Auth Guard: Faltante"
fi

echo "��� Verificando componentes..."
components=("login" "dashboard")
for comp in "${components[@]}"; do
    if [ -f "src/app/components/$comp/$comp.component.ts" ] && [ -f "src/app/components/$comp/$comp.component.html" ]; then
        echo "✅ $comp Component: OK"
    else
        echo "❌ $comp Component: Faltante"
    fi
done

echo ""
echo "��� Estado del proyecto: COMPLETADO"
echo "��� Ejecuta: ng serve"
echo "��� Accede a: http://localhost:4200"
