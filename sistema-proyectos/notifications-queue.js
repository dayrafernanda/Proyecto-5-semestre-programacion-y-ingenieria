// Simple notifications queue for demo purposes
// Stores queue in localStorage under key 'notificacionesQueue'
(function () {
    function getQueue() {
        return JSON.parse(localStorage.getItem('notificacionesQueue') || '[]');
    }

    function saveQueue(queue) {
        localStorage.setItem('notificacionesQueue', JSON.stringify(queue));
    }

    // Enqueue a notification object: { to, titulo, mensaje, tipo, fecha }
    window.enqueueNotification = function (notif) {
        const queue = getQueue();
        queue.push({ id: Date.now() + Math.random(), notif, attempts: 0, lastError: null });
        saveQueue(queue);
        return true;
    };

    // Process the whole queue (synchronous-ish). For demo it just logs and marks as sent.
    window.processNotificationQueue = function (opts = {}) {
        const queue = getQueue();
        if (queue.length === 0) return { success: true, processed: 0 };

        const maxAttempts = opts.maxAttempts || 3;
        const processed = [];

        for (let i = queue.length - 1; i >= 0; i--) {
            const item = queue[i];
            try {
                // Simulate HTTP send: here we just console.log and mark as delivered
                console.log('[notifications-queue] sending', item.notif);
                // Simulate random failure small chance
                if (Math.random() < (opts.failRate || 0.05)) throw new Error('Simulated send failure');

                // mark processed: remove from queue
                queue.splice(i, 1);
                processed.push(item);
            } catch (e) {
                item.attempts = (item.attempts || 0) + 1;
                item.lastError = e.message;
                // if exceeded attempts, drop and log
                if (item.attempts >= maxAttempts) {
                    console.warn('[notifications-queue] dropping after max attempts', item);
                    queue.splice(i, 1);
                }
            }
        }

        saveQueue(queue);
        return { success: true, processed: processed.length };
    };

    // Expose a helper to see queue
    window.getNotificationQueue = getQueue;
})();
