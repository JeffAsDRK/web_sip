FROM nginx:alpine

RUN apk add --no-cache openssl && \
    mkdir -p /etc/nginx/certs && \
    openssl req -x509 -newkey rsa:2048 -nodes -days 3650 \
        -keyout /etc/nginx/certs/webphone.key \
        -out /etc/nginx/certs/webphone.crt \
        -subj "/CN=sip-webphone-2" \
        -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

COPY softphone.html /usr/share/nginx/html/softphone.html
COPY jssip-3.10.1.min.js /usr/share/nginx/html/jssip-3.10.1.min.js
COPY nginx.conf /etc/nginx/conf.d/default.conf
