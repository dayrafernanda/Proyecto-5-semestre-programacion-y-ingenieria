const NOTIF_QUEUE_KEY = 'notificacionesQueue';

function getQueue() {
    return JSON.parse(localStorage.getItem(NOTIF_QUEUE_KEY) || '[]');
}

function saveQueue(queue) {
    localStorage.setItem(NOTIF_QUEUE_KEY, JSON.stringify(queue));
}

function enqueueNotification(notif) {
    const queue = getQueue();
    queue.push({
        id: queue.length + 1,
        notif,
        estado: 'pending',
        intentos: 0,
        createdAt: new Date().toISOString()
    });
    saveQueue(queue);
}

function processNotifications() {
    const queue = getQueue();
    const pendientes = queue.filter(q => q.estado === 'pending' || (q.estado === 'retry' && q.intentos < 3));

    if (pendientes.length === 0) {
        alert('No hay notificaciones pendientes en la cola');
        return;
    }

    pendientes.forEach(item => {
        try {
            console.log('Enviando notificación (simulada):', item.notif);
            item.estado = 'done';
            item.sentAt = new Date().toISOString();
        } catch (e) {
            item.intentos = (item.intentos || 0) + 1;
            item.estado = item.intentos >= 3 ? 'failed' : 'retry';
            item.lastError = e.message;
        }
    });

    saveQueue(queue);
    alert(`Procesadas ${pendientes.length} notificaciones (simulado)`);
}

function verColaNotificaciones() {
    const queue = getQueue();
    let contenido = '<h3>📬 Cola de Notificaciones</h3>';
    if (queue.length === 0) contenido += '<p>No hay elementos en la cola</p>';
    contenido += '<ul>';
    queue.forEach(item => {
        contenido += `<li>ID:${item.id} estado:${item.estado} intentos:${item.intentos} titulo:${item.notif?.titulo || ''}</li>`;
    });
    contenido += '</ul>';
    mostrarModal(contenido);
}

window.enqueueNotification = enqueueNotification;
window.processNotifications = processNotifications;
window.verColaNotificaciones = verColaNotificaciones;
