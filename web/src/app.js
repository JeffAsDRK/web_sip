let ua = null;
let currentSession = null;
let isMuted = false;

const $ = (id) => document.getElementById(id);
const logBox = $('logBox');
const regStatus = $('regStatus');
const remoteAudio = $('remoteAudio');

function log(msg) {
  const time = new Date().toLocaleTimeString();
  logBox.textContent += `[${time}] ${msg}\n`;
  logBox.scrollTop = logBox.scrollHeight;
}

function setRegistered(ok) {
  regStatus.textContent = ok ? 'Registrado' : 'Desconectado';
  regStatus.className = 'status ' + (ok ? 'online' : 'offline');
  $('callBtn').disabled = !ok;
}

function setInCall(inCall) {
  $('callBtn').disabled = inCall || regStatus.classList.contains('offline');
  $('hangupBtn').disabled = !inCall;
  $('muteBtn').disabled = !inCall;
}

$('registerBtn').addEventListener('click', () => {
  if (typeof JsSIP === 'undefined') {
    log('ERROR: no se pudo cargar la libreria JsSIP (vendor/jssip.min.js). Verifica que el archivo exista dentro de la imagen web.');
    return;
  }

  const wsUrl = $('wsUrl').value.trim();
  const domain = $('sipDomain').value.trim();
  const user = $('sipUser').value.trim();
  const pass = $('sipPass').value.trim();

  if (ua) {
    ua.stop();
    ua = null;
  }

  const socket = new JsSIP.WebSocketInterface(wsUrl);
  const configuration = {
    sockets: [socket],
    uri: `sip:${user}@${domain}`,
    password: pass,
    session_timers: false,
    register: true,
  };

  ua = new JsSIP.UA(configuration);

  ua.on('connecting', () => log('Conectando al WebSocket...'));
  ua.on('connected', () => log('WebSocket conectado'));
  ua.on('disconnected', () => { log('WebSocket desconectado'); setRegistered(false); });
  ua.on('registered', () => { log('Registrado en Asterisk como ' + user); setRegistered(true); });
  ua.on('unregistered', () => { log('No registrado'); setRegistered(false); });
  ua.on('registrationFailed', (e) => { log('Fallo de registro: ' + e.cause); setRegistered(false); });

  ua.on('newRTCSession', (data) => {
    currentSession = data.session;

    if (data.originator === 'remote') {
      log('Llamada entrante de ' + data.request.from.uri.user);
      currentSession.answer({
        mediaConstraints: { audio: true, video: false }
      });
    }

    currentSession.on('progress', () => log('Llamando...'));
    currentSession.on('accepted', () => { log('Llamada aceptada'); setInCall(true); });
    currentSession.on('confirmed', () => log('Llamada en curso'));
    currentSession.on('ended', () => { log('Llamada finalizada'); setInCall(false); currentSession = null; });
    currentSession.on('failed', (e) => { log('Llamada fallida: ' + e.cause); setInCall(false); currentSession = null; });

    currentSession.connection.addEventListener('track', (event) => {
      remoteAudio.srcObject = event.streams[0];
    });
  });

  ua.start();
});

$('callBtn').addEventListener('click', () => {
  const dest = $('destination').value.trim();
  const domain = $('sipDomain').value.trim();
  if (!ua || !dest) return;

  const target = `sip:${dest}@${domain}`;
  ua.call(target, {
    mediaConstraints: { audio: true, video: false }
  });
  log('Marcando a ' + dest + '...');
});

$('hangupBtn').addEventListener('click', () => {
  if (currentSession) {
    currentSession.terminate();
  }
});

$('muteBtn').addEventListener('click', () => {
  if (!currentSession) return;
  isMuted = !isMuted;
  if (isMuted) {
    currentSession.mute({ audio: true });
    $('muteBtn').textContent = 'Reactivar audio';
  } else {
    currentSession.unmute({ audio: true });
    $('muteBtn').textContent = 'Silenciar';
  }
});
