function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const resultado = sistema.iniciarSesion(email, password);
    if (resultado.success) {
        alert(resultado.mensaje);
        window.location.href = 'index.html';
    } else {
        alert('Error: ' + resultado.error);
    }
}

function handleLogout() {
    const resultado = sistema.cerrarSesion();
    alert(resultado.mensaje);
    window.location.href = 'login.html';
}

function mostrarRegistro() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

function mostrarLogin() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
}

function handleRegister(event) {
    event.preventDefault();
    const nombre = document.getElementById('reg-nombre').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const rol = document.getElementById('reg-rol').value;

    const resultado = sistema.registrarUsuario(nombre, email, password, rol);
    if (resultado.success) {
        alert(resultado.mensaje);
        mostrarLogin();
    } else {
        alert('Error: ' + resultado.error);
    }
}

function actualizarInfoUsuario() {
    const userInfo = document.getElementById('user-info');
    if (sistema.usuarioActual) {
        userInfo.innerHTML = `
            <span>👤 ${sistema.usuarioActual.nombre} (${sistema.usuarioActual.rol})</span>
            <button class="logout-btn" onclick="handleLogout()">🚪 Logout</button>
        `;
    }
}