
echo "��� Generando componentes del sistema SENA..."

mkdir -p src/app/components/{login,dashboard,project-form,portfolio,project-review,project-edit,audit,user-management,academic-periods,repository,notifications,profile}
mkdir -p src/app/{services,models,guards,interceptors,utils}

echo "��� Generando componentes..."
ng generate component components/login --skip-import
ng generate component components/dashboard --skip-import
ng generate component components/project-form --skip-import
ng generate component components/portfolio --skip-import
ng generate component components/project-review --skip-import
ng generate component components/project-edit --skip-import
ng generate component components/audit --skip-import
ng generate component components/user-management --skip-import
ng generate component components/academic-periods --skip-import
ng generate component components/repository --skip-import
ng generate component components/notifications --skip-import
ng generate component components/profile --skip-import

echo "��� Generando servicios..."
ng generate service services/auth
ng generate service services/project
ng generate service services/notification
ng generate service services/user
ng generate service services/audit
ng generate service services/academic-period

echo "���️ Generando guards..."
ng generate guard guards/auth
ng generate guard guards/role

echo "��� Generando interceptors..."
ng generate interceptor interceptors/auth
ng generate interceptor interceptors/error

echo "��� Instalando Bootstrap..."
npm install bootstrap @popperjs/core bootstrap-icons

echo "��� ¡Todos los componentes generados exitosamente!"
echo ""
echo "��� Estructura creada:"
echo "   ✅ 12 componentes"
echo "   ✅ 6 servicios" 
echo "   ✅ 2 guards"
echo "   ✅ 2 interceptors"
echo "   ✅ Bootstrap instalado"
echo ""
echo "��� Para iniciar el proyecto: ng serve"
