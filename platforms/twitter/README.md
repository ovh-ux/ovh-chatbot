# Twitter

:warning: **Twitter feature has not been tested, please don't use it for production** :warning:

_:construction: Currently twitter Webhook API is in beta. Features might change :construction:_

## Setup the app

1. go to https://apps.twitter.com/ and create an App (use the account you want to use as a bot)
2. go to the `Permissions` tab and set permission to: `Read, Write and Access direct messages`
3. go to the `Keys and Access Tokens` tab and click `Create my access token`
4. Export your tokens:
  - export the `Consumer Key` to the environement varibale `TWITTER_API_KEY`
  - export the `Consumer Secret` to the environement varibale `TWITTER_API_SECRET`
  - export the `Owner ID` to the environement varibale `TWITTER_APP_ID`
  - export the `Access Token` to the environement varibale `TWITTER_ACCESS_TOKEN`
  - export the `Access Token Secret` to the environement varibale `TWITTER_ACCESS_TOKEN_SECRET`

## Setup the webhook

>  Currently you must apply to use the webhook feature ([Apply here](https://gnipinc.formstack.com/forms/account_activity_api_configuration_request_form))

Go checkout https://github.com/twitterdev/twitter-webhook-boilerplate-node and follow the steps in order to setup your webhook, ignore the sections about Heroku

## Help

- You can find the webhook Getting started [here](https://dev.twitter.com/webhooks/getting-started)

- [Twitter DM documentation](https://dev.twitter.com/rest/direct-messages)


## More
You can setup a welcome message:
1. `POST direct_messages/welcome_messages/new` with the parameters:
    ```json
    {
      "welcome_message" : {
        "message_data": {
          "text": "YOUR WELCOME MESSAGE"
        }
      }
    }
    ```
2. Take note of the `welcome_message.id` in the response
3. `POST direct_messages/welcome_messages/rules/new` with the parameters:
  ```json
  {
    "welcome_message_rule": {
        "welcome_message_id": "PREVIOUS_ID"
      }
  }
  ```
