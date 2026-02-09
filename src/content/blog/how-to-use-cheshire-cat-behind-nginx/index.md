---
title: "How to use Cheshire Cat behind NGINX"
description: "> Startup guide with a basic setup to deploy the Cheshire Cat behind a reverse proxy with Nginx."
author: "giovanni-albero"
pubDate: 2024-01-17
categories: 
  - "tutorial"
tags: 
  - "advanced"
  - "deployment"
heroImage: "./images/Screenshot-from-2024-01-17-12-16-10.png"
---

> Startup guide with a basic setup to deploy the Cheshire Cat behind a reverse proxy with Nginx.

In a production environment you would use Nginx in order to manage access to a specific resource, like the Cat.  
For example, you would put a sub-path like `/admin` behind a basic authentication or put a filter to accept connection only by a specific IP address or class of them.

A reverse proxy is a server that sits between client devices and a web server, forwarding client requests to the web server and returning the server's responses to the clients.

Here an example about the usage of Nginx with Cheshire-Cat: the key concept is to use the reverse proxy.

First of all we need to install Nginx (the following instructions are based on Ubuntu):

```
$ sudo apt install nginx
```

If everything is installed successfully you can visit the Nginx's welcome page  
http://localhost

Now we have to configure Nginx in order to work with Cheshire Cat.  
Here the simple configuration file:

```
server {
    listen       80;
    listen  [::]:80;
    server_name  localhost;

    location / {
        proxy_pass http://localhost:1865/;
    }

    location /ws {
        proxy_pass http://localhost:1865/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

the file above must be saved in `/etc/nginx/sites-available` and than created a softlink inside `/etc/nginx/sites-enabled`.

```
$ cd /etc/nginx/sites-enabled
$ sudo ln -s ../sites-available/cheshire-cat.conf cheshire-cat.conf

```

and than we can validate and restart Nginx

```
$ sudo nginx -t
$ sudo systemctl restart nginx.service
```

Before testing that everything works, we need to run Cheshire-Cat in the same machine or network where nginx is running to reach it.

You can find a Github project here where this functionality is shown using a docker-compose [https://github.com/mimir-chatbot/reverse-proxy-example](https://github.com/mimir-chatbot/reverse-proxy-example).

## Next steps

Now that you have deployed your Cat instance, you may be interested in developing a custom client to allow the user interacting with it. Take a look at our [SDK libraries](https://cheshire-cat-ai.github.io/docs/technical/clientlib/clientlib-typescript/) and find the one that's most suitable for your needs. If you haven't yet, it's time to develop [your first plugin](https://cheshirecat.ai/write-your-first-plugin/)!
