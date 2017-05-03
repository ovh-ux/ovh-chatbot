# How to install [![Gitter](https://img.shields.io/gitter/room/nwjs/nw.js.svg)](https://gitter.im/ovh/ux)

### Requirements

+ Node.Js >= 6.0
+ MongoDB (URL connection string in environment variable MONGO, example: `export MONGO="mongodb://username:password@host1:27017/ovhchatbot"`)
+ Facebook developer account with Facebook developer app created (more explanations below)
+ Slack developer account with Slack developer app created (more explanations below)
+ Wit.ai account
+ Public ip with domain linked in HTTPS

**For each environment variable, if you want to use docker and docker-compose you can put the value in the `Dockerfile` of this project.**

### Create a wit.ai account

+ Create an account on [wit.ai website](https://wit.ai)
+ Go in **Stories** section on this [this project](https://wit.ai/bnjjj/ovh-status) and click on **Export App**.
+ It will download a `zip` file. Now you can create a new **wit.ai** app and import this `zip` file to create. 
+ Copy your **Server Access Token** found in the **Settings** section
+ And save it into the env variable named `WIT_TOKEN`

### Deployment

+ You have to host this project on a public instance with a public ip and link this IP to a domain name
+ To get a free SSL on your domain linked to the public ip of your chatbot API you can use [the "SSL Gateway" service by OVH](https://www.ovh.com/fr/ssl-gateway/) or simply use [Let's encrypt](https://letsencrypt.org/). You just have to indicate the domain and ip linked to this domain.
+ Save your domain name into env variable **APP_URL** (for example: `export APP_URL=https://myCustomDomain.com`)

### Run the API on your server or with docker-compose
Requirements --> environment variable: **WIT_TOKEN**, **MONGO** and **APP_URL**

**Without docker**
```shell
$ npm i 
$ APP_PORT=80 npm start
```

**With docker and docker-compose**
```shell
$ sudo docker-compose up 
```

### Create Facebook Developer app for chatbot

+ On your server export an env variable named `FB_VALIDATION_TOKEN` with the value `ovh_chatbot_dev` for example. This value is the same that you fill in step 2 of this [Facebook tutorial](https://developers.facebook.com/docs/messenger-platform/guides/quick-start) and the webhook url must be `https://yourCustomDomain/api/v1.0/webhook`
+ Follow the four first steps [described here](https://developers.facebook.com/docs/messenger-platform/guides/quick-start), but don't take care about the sample app that Facebook give.
+ Save the correspondant informations in env variable (`FB_APP_SECRET` --> in section `dashboard`, `FB_APP_ACCESS_TOKEN` --> in section `messenger`)

### Create Slack Developer app for chatbot

+ Go on [this page](https://api.slack.com/apps?new_app=1) and create a new app 
+ Enable **Interactive Messages** and add request URL `https://yourCustomDomain/api/v1.0/slack/actions`
+ Enable **Event Subscriptions** and add request URL `https://yourCustomDomain/api/v1.0/slack`
+ In the same section subscribe to event **message.im** and save changes
+ Add a bot user in section **Bot Users**
+ In section **OAuth & Permissions** add permissions named `bot` and `chat:write:bot` 
+ In the same section click on **Install App to Team** in order to get the **Bot User Oauth Access Token** which are saved in our env variable as `SLACK_BOT_ACCESS_TOKEN`
+ Then add a redirect URLs like this one `https://yourCustomDomain/api/v1.0/slack/authorize`
+ In section **Basic Information** you can fetch the **Client ID** saved in our env variable as `SLACK_ID`, the **Client Secret** saved in `SLACK_SECRET` and the **Verification Token** in `SLACK_TOKEN`
+ Go in **Manage Distribution** section and access to the **Sharable URL** to install slack bot into your team.

### Create your api.ovh.com application

+ Go on [this page](https://api.ovh.com) and click on **First steps ...** to create an application et save the application key and secret in env variable `OVH_KEY` and `OVH_SECRET`

If you need more informations you can [join us on Gitter](https://gitter.im/ovh/ux)
