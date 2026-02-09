---
title: "HTTPS Reverse Proxy Redirect with Nginx"
description: "This guide is an extension of Giovanni Albero's guide (how to use Cheshire Cat behind Nginx), integrating the reverse proxy with HTTPS to allow the Cheshire cat's APIs to be used in production."
author: "francesco-lazzarelli"
pubDate: 2024-12-29
categories: 
  - "tutorial"
tags: 
  - "deployment"
  - "nginx"
  - "production"
heroImage: "./images/nginx-https.png"
---

This guide is an extension of Giovanni Albero's guide ([how to use Cheshire Cat behind Nginx](https://cheshirecat.ai/how-to-use-cheshire-cat-behind-nginx/)), integrating the reverse proxy with HTTPS to allow the Cheshire cat's APIs to be used in production.

_This guide is specific to Linux-based systems._

## 0\. Nginx Installation

Refer to the Giovanni Albero's [guide](https://cheshirecat.ai/how-to-use-cheshire-cat-behind-nginx/) for instructions on setting up Nginx to avoid repetition. If you have already installed Nginx you can skip this step.

## 1\. SSL Certificate

If not already installed, you need to set up an SSL certificate. We will use [Let's Encrypt](https://letsencrypt.org/), which provides certificates for free.

```
$ sudo apt update
$ sudo apt install certbot python3-certbot-nginx

$ sudo certbot --nginx -d domain.com -d www.domain.com
```

_Replace **domain.com** with your domain name._

Finally, if you want to enable automatic certificate renewal (recommended):

```
$ sudo certbot renew --dry-run
```

## 2\. Modify the "Cat's" Configuration

You will also need to add a **.env** file in the same directory as the **compose.yml**. Its contents should be:

```
...
CCAT_HTTPS_PROXY_MODE=1
...
```

This configuration file must then be included in the **compose.yml** as follows:

```
services:
...
  cat:
  ...
    container_name: cheshire_cat_core
    env_file:
      - .env
    expose:
      - 80
    ports:
      - xxxxx:80
  ...
...
```

It is recommended to use a port other than 80 and to configure port mapping. To do so, replace "xxxxx" with a valid port number.

## 3\. Modify the Nginx Configuration File

To enable the reverse proxy to work with HTTPS, you need to modify the configuration file for the site in Nginx.

```
$ nano /etc/nginx/sites-available/cheshire-api.conf
```

_Replace **cheshire-api.conf** with the name you gave to the configuration file._

Edit the file as follows. Make sure to replace **domain.com** with your domain name and **xxxxx** with the port you chose in the previous step.

```
server {
    listen 80;
    server_name domain.com www.domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name domain.com www.domain.com;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/domain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location /api/ {
        proxy_pass http://localhost:xxxxx/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

Now, all requests sent to **https://domain.com/api/** will be redirected to **http://localhost:xxxxx/**.

_Everything written after **/api/** is forwarded in the redirect. For example, **https://domain.com/api/message** will be forwarded to **http://localhost:xxxxx/message**. With this single configuration, you can handle all API calls to the "Cat."_

## 4\. Restart the Service

Finally, check that the configuration is correct with:

```
$ sudo nginx -t
```

And restart the service:

```
$ sudo systemctl restart nginx
```

## Final Thoughts

You can now use your "Cat" in production without encountering the console error "Mixed Content: The page at 'https://frontend-domain.com' was loaded over HTTPS but requested an insecure endpoint 'http://cat-domain.com'."  
  
This solution is also compatible with WebSocket connections - you'll just need to make the appropriate adjustments to your nginx configuration file.
