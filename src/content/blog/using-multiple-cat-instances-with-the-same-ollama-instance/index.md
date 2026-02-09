---
title: "Using multiple Cat instances with the same Ollama instance"
description: "If you’ve landed on this guide, you’re probably wondering: how can I use the same Ollama instance to connect it to multiple Cat instances?"
author: "francesco-lazzarelli"
pubDate: 2025-02-17
categories: 
  - "tutorial"
tags: 
  - "development"
  - "network"
heroImage: "./images/stregatto-guida.webp"
---

If you’ve landed on this guide, you’re probably wondering: how can I use the same Ollama instance to connect it to multiple Cat instances?

Using a single Ollama instance allows you to save both memory and money, avoiding the need for powerful hardware to run multiple instances, each with a separate LLM.

In this guide, I’ll show you how to configure multiple Cheshire Cat instances to work simultaneously with the same LLM, using Docker's networking.

## Creating the Network Infrastructure

We’ll use the networking features provided by Docker. By default, the **docker compose** command creates a network between the containers launched via the **compose.yml** file. To enable multiple Cat instances to communicate with the same Ollama instance, we’ll use the _**networks**_ property, which allows creating a network that can be used outside the directory where the \`docker compose up\` command is executed.

Among the many properties offered by the _**networks**_ command, we’re only interested in _**external**_, which should be set to _**true**_. For more details, refer to the official documentation: [Networking in Compose](https://docs.docker.com/compose/how-tos/networking/).

## Changes to the compose.yml File

Modify each **_compose.yml_** file as follows:

```
networks:
  cat-network:
    external: true
...
```

With this configuration, we create and use the **_cat-network_** network instead of the default one. Containers belonging to this network will now be able to communicate with each other.

Of course, you can choose a different name for the network if you prefer.

## Required Modifications to the Cat Backend

No changes are needed in the Cat backend. You can continue using the same URL and port configured previously (default: http://ollama\_cat:11434).

The only modifications involve the **_compose.yml_** file. Here’s an example:

```
services:
  cheshire-cat-core-xxx:
    image: ghcr.io/cheshire-cat-ai/core:latest
    container_name: cheshire_cat_xxx
    env_file:
      - .env
    expose:
      - 80
    depends_on:
      - ollama
    ports:
      - xxxxx:80
    volumes:
      - ./static:/app/cat/static
      - ./plugins:/app/cat/plugins
      - ./data:/app/cat/data
    networks:
      - cat-network
    restart: unless-stopped
    ...
```

For each Cat instance, you need to modify:

- The service name.

- The container name.

- The port where the process will run.

The only difference compared to the default **_compose.yml_** file is the addition of the **_networks_** property, which specifies the network the container should belong to.

## Alternative Solution (Not Recommended)

An alternative approach involves adding all "Cats" as different services directly into a single **_compose.ym_**l file. The **docker compose up** command will automatically create a network between the containers it starts.

However, this solution has some limitations:

- It’s less organized compared to the configuration with separate networks.

- Managing a single **_compose.yml_** file makes it more cumbersome to update or modify active instances, and add new ones.

In contrast, using separate networks allows you to manage each instance independently, adding new ones or modifying existing ones without disrupting the entire configuration.

## Final Considerations

With this configuration, all containers within the network can communicate with each other, including the various "Cats". This approach can also serve as a foundation for a _**multi-agent**_ network, but we’ll cover that in a future guide.

I hope you found this guide helpful!
