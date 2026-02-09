---
title: "How to run Cheshire Cat behind a Traefik reverse proxy to add SSL support"
description: "Traefik is a reverse proxy that is gaining momentum in both Docker Compose and Kubernetes deployments. Why choosing Traefik over other solutions, like Nginx, is out of the scope of this short post:..."
author: "marco-ottolini"
pubDate: 2024-09-11
categories: 
  - "tutorial"
heroImage: "./images/cat-traefik-1.jpg"
---

[Traefik](https://traefik.io/traefik/) is a reverse proxy that is gaining momentum in both Docker Compose and Kubernetes deployments. Why choosing Traefik over other solutions, like Nginx, is out of the scope of this short post: there are technical and "religious" reasons...

Why would I like to run the Cat behind a reverse proxy?  
In container based deployments is a must to have all services behind an ingress server (more "modern" name for reverse proxy) to basically provide:

- Automatic SSL support (through Let's Encrypt)

- Access Control (like a simple auth or token based authentication)

- Routing (let the service appear under a subdir of a domain instead of a subdomain)

To keep things as simple as possible, I created a docker-compose file with just two services:

- Traefik

- Cheshire-cat

The configuration of Traefik is simple and it just declares that it should be available on both insecure and secure ports (80 and 443), with automatic handling of SSL certificates and "elevation" from insecure to secure connection (meaning that if you request a page over http you will be redirected automatically to https.

The configuration of the Cheshire-Cat service is a bit more complex.  
In the `labels` section we declare that this service, whose publish by default on port 1865, will work behind Traefik, at a specific URI, using SSL.  
In the `environment` section we configure the Cat itself, using three environment variables:

- CCAT\_CORE\_HOST

- CCAT\_CORE\_USE\_SECURE\_PROTOCOLS -

- CCAT\_HTTPS\_PROXY\_MODE - Important, it this is not set to true, the Cat would not work correctly

Here is the docker-compose file I used to run the Cat behind Traefik:

```
services:
  traefik:
    image: "traefik:v3.1.0"
    container_name: "traefik"
    command:
#      - "--log.level=DEBUG"
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.web.http.redirections.entryPoint.to=websecure"
      - "--entrypoints.web.http.redirections.entryPoint.scheme=https"
      - "--entrypoints.web.http.redirections.entrypoint.permanent=true"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.myresolver.acme.tlschallenge=true"
      - "--certificatesresolvers.myresolver.acme.email=${EMAIL_LETSENCRYPT}"
      - "--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json"
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - "letsencrypt:/letsencrypt"
      - "/var/run/docker.sock:/var/run/docker.sock:ro"

  cheshire-cat:
    image: ghcr.io/cheshire-cat-ai/core:${CAT_VERSION}
    container_name: cheshire-cat
    restart: always
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.${TRAEFIK_ROUTER_CAT}.rule=Host(`${URI_CHESHIRE_CAT}`)"
      - "traefik.http.routers.${TRAEFIK_ROUTER_CAT}.entrypoints=websecure"
      - "traefik.http.routers.${TRAEFIK_ROUTER_CAT}.tls.certresolver=myresolver"
      - "traefik.port=1865"
    ports:
      - 1865:80
    environment:
      - CCAT_CORE_HOST=${URI_CHESHIRE_CAT}
      - CCAT_CORE_USE_SECURE_PROTOCOLS=${CCAT_CORE_USE_SECURE_PROTOCOLS}
      - CCAT_HTTPS_PROXY_MODE=true
 #    - CCAT_LOG_LEVEL=${CCAT_LOG_LEVEL}
 #    - CCAT_DEBUG=${CCAT_DEBUG}
    volumes:
      - cat-static:/app/cat/static
      - cat-plugins:/app/cat/plugins
      - cat-data:/app/cat/data

volumes:
  letsencrypt:
    driver: local
  cat-data:
    driver: local
  cat-plugins:
    driver: local
  cat-static:
    driver: local
```

This is the content of the .env file (change its values according to your own deployment):

```
EMAIL_LETSENCRYPT=youremail@email.com
TRAEFIK_ROUTER_CAT=cat
URI_CHESHIRE_CAT=yourservice.yourdomain.com

## CHESHIRE CAT
CAT_VERSION=1.7.1
CCAT_CORE_USE_SECURE_PROTOCOLS=true
CCAT_DEBUG=true
CCAT_LOG_LEVEL=DEBUG
```
