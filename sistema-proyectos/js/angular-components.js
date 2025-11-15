class ProyectoComponent {
    constructor(proyecto) {
        this.proyecto = proyecto;
        this.element = this.render();
    }

    render() {
        const div = document.createElement('div');
        div.className = 'proyecto-card';
        div.innerHTML = `
            <h3>${this.proyecto.titulo}</h3>
            <p>${this.proyecto.descripcion}</p>
            <div class="proyecto-info">
                <span class="estado ${this.proyecto.estado}">${this.proyecto.estado}</span>
                <span class="progreso">${this.proyecto.progreso}%</span>
            </div>
            <div class="proyecto-acciones">
                <button onclick="editarProyecto(${this.proyecto.id})">Editar</button>
                <button onclick="eliminarProyecto(${this.proyecto.id})">Eliminar</button>
            </div>
        `;
        return div;
    }
}

function cargarProyectosAngularStyle() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '<h2>📋 Proyectos (Estilo Angular)</h2><div id="proyectos-container"></div>';

    const container = document.getElementById('proyectos-container');

    sistema.proyectos.forEach(proyecto => {
        const componente = new ProyectoComponent(proyecto);
        container.appendChild(componente.element);
    });
}