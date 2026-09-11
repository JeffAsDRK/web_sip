# Softphone Web SIP + Asterisk (Docker)

Proyecto dockerizado con dos servicios:

- **asterisk**: servidor Asterisk (Debian + `apt install asterisk`) con transporte
  `ws` (WebSocket, sin TLS) habilitado en el puerto `8088`, listo para WebRTC
  (ICE, DTLS-SRTP, opus).
- **web**: interfaz web (HTML + JS puro con [JsSIP](https://jssip.net)) servida
  por nginx en el puerto `8080`, que se conecta directamente al Asterisk vía
  WebSocket local.

## Estructura

```
sip-webphone/
├── docker-compose.yml
├── asterisk/
│   ├── Dockerfile
│   └── config/
│       ├── pjsip.conf       # transporte WS + extensiones 1000/1001 (WebRTC)
│       ├── extensions.conf  # dialplan: llamadas 1000<->1001, eco en 600
│       ├── http.conf        # servidor HTTP interno (necesario para WS)
│       ├── rtp.conf         # rango de puertos RTP
│       └── logger.conf
└── web/
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── index.html
        ├── style.css
        └── app.js
```

## Levantar el proyecto

```bash
cd sip-webphone
docker compose up --build
```

Esto expone:

- `http://localhost:8080` → softphone web
- `ws://localhost:8088/ws` → WebSocket de señalización SIP de Asterisk
- `5060/udp` → SIP clásico (opcional, para softphones tipo Zoiper/Linphone)
- `10000-10010/udp` → RTP (audio)

## Uso

1. Abre `http://localhost:8080` en dos pestañas o dos navegadores distintos
   (o dos equipos en la misma red).
2. En la primera, deja los valores por defecto (extensión `1000`,
   password `1000pass`) y pulsa **Registrar**.
3. En la segunda, cambia a extensión `1001` / password `1001pass` y
   pulsa **Registrar**.
4. Desde cualquiera de las dos, escribe el número de la otra en el campo
   de destino (`1001` o `1000`) y pulsa **Llamar**. El navegador pedirá
   permiso de micrófono.
5. Para probar sin una segunda extensión, marca `600` (extensión de eco:
   repite el audio que envías) o `601` (dice la hora).

## Usuarios de prueba definidos en `pjsip.conf`

| Extensión | Password  |
|-----------|-----------|
| 1000      | 1000pass  |
| 1001      | 1001pass  |

Puedes agregar más copiando el bloque `[XXXX](endpoint-template)` +
`[XXXX] type=auth` + `[XXXX] type=aor` en `pjsip.conf`, y sumando su
extensión correspondiente en `extensions.conf`.

## Notas importantes

- La conexión WebSocket usada es `ws://` (sin cifrar), pensada para uso
  **local / LAN**. Si accedes a la web desde `http://localhost:8080` los
  navegadores modernos permiten `getUserMedia` sin HTTPS. Si accedes desde
  otra IP de la red (no localhost), Chrome/Firefox exigirán HTTPS para dar
  acceso al micrófono — en ese caso habría que añadir TLS (`wss://`) tanto
  en Asterisk (`pjsip.conf` con `protocol=wss` + certificados) como en
  nginx.
- Los endpoints ya están configurados con `webrtc=yes`, lo que activa
  automáticamente ICE, `rtcp_mux`, DTLS-SRTP y generación de certificado
  autofirmado para el medio — necesario para que un navegador pueda
  establecer la llamada.
- Si cambias el rango RTP en `rtp.conf`, actualiza también el rango de
  puertos publicado en `docker-compose.yml`.
- Para ver logs de Asterisk en vivo: `docker exec -it asterisk asterisk -rvvv`.
