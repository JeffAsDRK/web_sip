# Softphone JsSIP (standalone)

Softphone web de una sola página (`softphone.html`) que usa la librería
[JsSIP](https://jssip.net) (vendorizada en `jssip-3.10.1.min.js`, sin
dependencias externas ni build step: es JS puro cargado con `<script>`).

## Estructura

```
web_sip_2/
├── docker-compose.yml
├── Dockerfile        # nginx:alpine + certificado autofirmado para HTTPS
├── nginx.conf         # vhosts :80 y :443
├── softphone.html      # UI + lógica JsSIP (teclado, llamadas entrantes/salientes)
└── jssip-3.10.1.min.js # librería JsSIP vendorizada
```

## Levantar el proyecto

```bash
cd web_sip_2
docker compose up --build -d
```

Expone:

- `http://localhost:8080`  → softphone (HTTP)
- `https://localhost:8443` → softphone (HTTPS, certificado autofirmado)

> Nota: los navegadores solo permiten `getUserMedia` (micrófono) sin HTTPS
> cuando se accede desde `localhost`. Para usarlo desde otra IP/equipo de
> la red, usa el puerto `8443` (HTTPS) y acepta el certificado autofirmado.

## Uso

1. Abre la interfaz en el navegador.
2. Completa: nombre a mostrar, URI SIP (`sip:usuario@dominio`), usuario de
   autenticación, contraseña y servidor WebSocket (`wss://host:puerto/ws`
   o `ws://host:puerto/ws` de tu Asterisk, p.ej. el del proyecto `web_sip`).
3. Pulsa **Conectar y registrar**.
4. Marca un número o `sip:usuario@dominio` y pulsa **Llamar**.

No requiere `npm install` ni build: todo el JS (incluyendo JsSIP) ya está
incluido como archivo estático servido por nginx.
