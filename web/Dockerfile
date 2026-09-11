FROM nginx:alpine

RUN apk add --no-cache openssl && \
    mkdir -p /etc/nginx/certs && \
    openssl req -x509 -newkey rsa:2048 -nodes -days 3650 \
        -keyout /etc/nginx/certs/webphone.key \
        -out /etc/nginx/certs/webphone.crt \
        -subj "/CN=sip-webphone" \
        -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

COPY src/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
