---
title: "Exploring the new AuthHandler API: building a Keycloak Integration"
description: "> In this article we explore the new AuthHandler API in Cheshire Cat and learn how to integrate external authentication providers like Keycloak."
author: "luca-gobbi"
pubDate: 2024-10-28
categories: 
  - "plugin"
  - "tutorial"
heroImage: "./images/catcloak.png"
---

> In this article we explore the new AuthHandler API in Cheshire Cat and learn how to integrate external authentication providers like Keycloak.

#### Handling Custom Authentication

Before the introduction of the AuthHandler, integrating custom authentication required a lot of boilerplate code and workarounds, from proxying the Cheshire Cat server to leveraging hooks to do specific actions.

However, with the release of version 1.7.0, Cheshire Cat now offers a flexbile API to implement custom authentication flows, bringing in your own authentication/authorization solution.

#### A grasp of the AuthHandler API

At its core, the AuthHandler API has two key components:

1. AuthHandlerConfig: a configuration class where you define settings for your custom handler, such as connection details to your provider, user data mapping, permission mapping, etc.

3. BaseAuthHandler: the main class which you extend to create your own custom handler.

#### Talk is cheap, show me the code

Let's go through the step-by-step process of builing a custom AuthHandler. In this example, we'll integrate Keycloak, but concepts will apply to any external system.

First of all, we need to lock our Cat instance to activate the CoreAuthHandler. Since the authentication handlers are chained within the internal authentication pipeline, users will be allowed through even if our handler attempts to block them. To address this, you simply need to set three environment variables: `CCAT_API_KEY`, `CCAT_API_KEY_WS` and `CCAT_JWT_SECRET`. Check the [docs](https://cheshire-cat-ai.github.io/docs/production/auth/authentication/) for more detail.

Secondly, we need to create a new plugin (need a refresh on how to do it? [Check it here](https://cheshire-cat-ai.github.io/docs/quickstart/prepare-plugin/)).

##### Installing requirements

Next, we need to add python-keycloak as a dependency to this plugin. Just edit the requirements.txt file and add:

```
python-keycloak==4.6.2
```

Although we could use Keycloak's REST API directly, we will use the [Keycloak Python client](https://github.com/marcospereirampj/python-keycloak) by Marcos Pereira for the sake of simplicity.

##### Defining the AuthHandler Class

Now, the juicy part: writing our own custom auth handler. We start by creating a class that inherits from the `BaseAuthHandler`:

```
from cat.factory.custom_auth_handler import BaseAuthHandler
from cat.factory.auth_handler import AuthHandlerConfig
from cat.auth.permissions import AuthPermission, AuthResource, AuthUserInfo
from cat.log import log

from keycloak import KeycloakOpenID

class KeycloakAuthHandler(BaseAuthHandler):

    def __init__(self, **config):
        self.keycloak_openid = KeycloakOpenID(
            server_url=config["server_url"],
            client_id=config["client_id"],
            realm_name=config["realm"],
            client_secret_key=config["client_secret"]
        )
            
    async def authorize_user_from_jwt(
        self, token: str, auth_resource: AuthResource, auth_permission: AuthPermission
    ) -> AuthUserInfo | None:
        try:
            token_info = await self.keycloak_openid.a_decode_token(token)
            return AuthUserInfo(
                id=token_info.get("sub"),
                name=token_info.get("preferred_username"),
            )

        except Exception as e:
            log.error(f"Error processing token: {e}")
            return None

    async def authorize_user_from_key(
        self, *args, **kwargs
    ) -> AuthUserInfo | None:
        log.debug("KeycloakAuthHandler does not support API keys.")
        return None
```

In the constructor we initialize the Keycloak client using parameters from the AuthHandler configuration, we'll declare that in a moment. Then, we implement the two main methods from the `BaseAuthHandler` abstract class: `authorize_user_from_jwt` and `authorize_user_from_`key.

In the `authorize_user_from_jwt` we simply delegate Keycloak to validate and decode the incoming JWT token. User information extracted from the token are then forwarded to our Cheshire Cat as an AuthUserInfo object. This Pydantic model holds user data, which can be used in the framework for further authorization and resource access. We're just skipping API key authentication for this integration.

##### Defining the AuthHandlerConfig class

Now it's time to create an `AuthHandlerConfig` class to configure our custom AuthHandler:

```
from cat.factory.auth_handler import AuthHandlerConfig
from pydantic import ConfigDict, Field

class KeycloakAuthHandlerConfig(AuthHandlerConfig):
    _pyclass: Type = KeycloakAuthHandler

    server_url: str = Field(..., description="The URL of the Keycloak server.")
    realm: str = Field(..., description="The realm to use.")
    client_id: str = Field(..., description="The client ID to use.")
    client_secret: str = Field(..., description="The client secret to use.")

    model_config = ConfigDict(
        json_schema_extra={
            "humanReadableName": "Keycloak Auth Handler",
            "description": "Delegate auth to a Keycloak instance."
        }
    )
```

This class defines the configuration required to instantiate the KeycloakAuthHandler, including the Keycloak server URL, realm, client ID, and client secret.

##### Final steps

We are almost done! Now, we need to make sure that our Cat is aware of this new AuthHandler. To do this, we add a specific hook to our plugin:

```
from cat.mad_hatter.decorators import hook
from typing import List

@hook(priority=0)
def factory_allowed_auth_handlers(allowed: List[AuthHandlerConfig], cat) -> List:
    allowed.append(KeycloakAuthHandlerConfig)
    return allowed 
```

Finally, to actually configure the AuthHandler in our Cat instance we can use the PUT endpoint `/auth_handler/settings/{auth_handler_name}`. You can use this cURL command as example:

```
curl --location --request PUT 'http://your_cat_server:1865/auth_handler/settings/KeycloakAuthHandlerConfig' \
--header 'Content-Type: application/json' \
--data '{
   "server_url": "http://your_keycloak_server:8080",
   "realm": "your_realm",
   "client_id": "your_client_id",
   "client_secret": "your_client_secret"
}'
```

##### Conclusion

In this article, we’ve explored how to integrate Keycloak into Cheshire Cat using the new AuthHandler API. With the introduction of the flexible AuthHandlerConfig and BaseAuthHandler components, it's now easier than ever to bring in external authentication providers.

For a more detailed and ready-to-use implementation, you can refer to the [Catcloak](https://github.com/lucagobbi/catcloak). This plugin handles user data mapping, controlling which information needs to be forwarded to Cheshire Cat. It also manages role permissions, acting as a bridge between your own Keycloak roles and Cheshire Cat permissions.
