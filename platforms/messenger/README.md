# Facebook messenger

## Setup your app

Prerequisite: you'll need to have a facebook page, or create one

1. go to https://developers.facebook.com/apps/
2. create an app (`add an app`)
3. configure the webhook:
  - add messenger as a product of your app
  - click on `configure webhooks`
  - the token is exported to the environement variable `FB_VALIDATION_TOKEN`
  - start your server at this step
  - the webhook url should be the path to the server endpoint your using (In our case: `https://bot.uxlabs.ovh/api/v1.0/webhook`)
  - Subscribe to the `messages` and `messaging_postbacks` event
4. get your tokens:
  - Go to `dashboard`:
    - export the secret key to the environement variable: `FB_APP_SECRET`
  - Go to `Messenger` product:
    - Select a facebook page
    - Allow your app
    - export the access token to the environement variable: `FB_APP_ACCESS_TOKEN`

## Help

- this tutorial is based on the [Facebook tutorial](https://developers.facebook.com/docs/messenger-platform/guides/quick-start)
- [Messenger Documentation](https://developers.facebook.com/docs/messenger-platform)

## More

You can add a welcome text, to your bot, when a user joins the conversation. Run the following command (don't forget to replace the text):
```shell
$ curl -X POST -H "Content-Type: application/json" -d '{
    "setting_type":"greeting",
    "greeting":{
      "text":"YOUR WELCOME TEXT HERE"
    }
  }' "https://graph.facebook.com/v2.6/me/thread_settings?access_token=$FB_APP_ACCESS_TOKEN"   
```
