// ---------
// 1. OBTENER EL LIENZO (CANVAS)
// ---------
// Buscamos el elemento <canvas> que pusimos en el index.html
// usando su 'id'.
const canvas = document.getElementById('gameCanvas');

// Obtenemos el "contexto" 2D. Esta es la herramienta que
// nos permite dibujar formas, líneas y colores en el lienzo.
const ctx = canvas.getContext('2d');

// ---------
// 2. CONEXIÓN AL SERVIDOR WEBSOCKET
// ---------
// Creamos una nueva conexión WebSocket.
	// ¡OJO! Apuntamos a 'ws://localhost:3000'.
	// No a 5173 (Vite), sino a 3000 (Fastify),
	// que es donde está nuestro 'server.js'.
	//const ws = new WebSocket('ws://localhost:3000');
// 'location.host' es una variable del navegador que contiene
// el host desde el que se cargó la página (ej: '192.168.1.50:3000')
const ws = new WebSocket(`ws://${location.host}`);

// ---------
// 3. DEFINIR FUNCIONES DE DIBUJADO
// ---------

/**
 * Dibuja un solo jugador en el lienzo.
 * @param {object} player - Un objeto de jugador (ej: {x: 10, y: 20, color: '#FF0000'})
 */
function drawPlayer(player) {
  // Le decimos al "pincel" (ctx) de qué color queremos dibujar
  ctx.fillStyle = player.color;
  
  // Dibujamos un rectángulo relleno en la posición (x, y) del jugador
  // con un tamaño de 50x50 píxeles.
  ctx.fillRect(player.x, player.y, 50, 50);
}

/**
 * La función principal de renderizado (dibujado) del juego.
 * @param {object} gameState - El objeto completo del estado del juego
 * (ej: { players: { "id1": {...}, "id2": {...} } })
 */
function renderGame(gameState) {
  // 1. Borrar todo el lienzo
  // Esto es crucial para la animación. Borramos el fotograma anterior
  // antes de dibujar el nuevo.
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 2. Obtener la lista de jugadores
  // gameState.players es un OBJETO. Usamos Object.values()
  // para convertirlo en una LISTA (Array) de jugadores.
  const players = Object.values(gameState.players);

  // 3. Dibujar cada jugador
  // Recorremos la lista y llamamos a nuestra función de dibujo
  // para cada uno de los jugadores.
  for (const player of players) {
    drawPlayer(player);
  }
}

// ---------
// 4. ESCUCHAR EVENTOS DEL WEBSOCKET
// ---------

// Evento: 'open' (Se ejecuta 1 vez cuando la conexión es exitosa)
ws.addEventListener('open', () => {
  console.log('¡Conectado al servidor WebSocket en el puerto 3000!');
  // Ya no necesitamos enviar un "hola" manual.
  // El servidor nos añadirá al 'gameState' y nos enviará la lista.
});

// Evento: 'message' (Se ejecuta CADA VEZ que el servidor nos envía datos)
ws.addEventListener('message', (event) => {
  // 'event.data' contiene el mensaje del servidor.
  // Viene como un texto en formato JSON (ej: '{"players":{...}}')
  
  // 1. Convertimos el texto JSON de vuelta a un objeto JavaScript
  const gameState = JSON.parse(event.data);
  
  // 2. Llamamos a nuestra función para dibujar este nuevo estado
  renderGame(gameState);
});

// Evento: 'close' (Se ejecuta si la conexión se cierra)
ws.addEventListener('close', () => {
  console.log('Desconectado del servidor WebSocket');
});

// Evento: 'error' (Se ejecuta si hay un error de conexión)
ws.addEventListener('error', (err) => {
  console.error('Error en WebSocket:', err);
});

// ---------
// 5. ESCUCHAR TECLAS DEL JUGADOR
// ---------
// Añadimos un "escuchador" al navegador para la tecla 'keydown' (tecla presionada)
window.addEventListener('keydown', (event) => {
  // 'event.key' nos dice qué tecla se presionó (ej: "ArrowUp")
  
  // Comprobamos si es una de las teclas de flecha
  // y enviamos el comando de texto correspondiente al servidor.
  switch (event.key) {
    case 'ArrowUp':
      ws.send('up');
      break;
    case 'ArrowDown':
      ws.send('down');
      break;
    case 'ArrowLeft':
      ws.send('left');
      break;
    case 'ArrowRight':
      ws.send('right');
      break;
  }
});
