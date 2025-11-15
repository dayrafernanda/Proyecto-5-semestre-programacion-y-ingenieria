function mostrarModal(contenido) {
    document.getElementById('modal-body').innerHTML = contenido;
    document.getElementById('modal').style.display = 'block';
}

function cerrarModal() {
    document.getElementById('modal').style.display = 'none';
}

window.onclick = function (event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        cerrarModal();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    actualizarInfoUsuario();

    if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
        const welcomeSection = document.getElementById('welcome-section');
        if (welcomeSection) {
            welcomeSection.style.display = 'block';
        }
    }
});

function verTodasRevisiones() {
    cargarRevisiones();
}