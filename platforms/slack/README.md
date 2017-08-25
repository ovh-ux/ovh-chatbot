# Slack

## Setup your app

1. Go on https://api.slack.com/apps and create a new app
2. Enable **Interactive Messages** and add request URL `https://yourCustomDomain/api/v1.0/slack/actions`
3. Enable **Event Subscriptions** and add request URL `https://yourCustomDomain/api/v1.0/slack`
4. In the same section subscribe to event **message.im** and save changes
5. Add a bot user in section **Bot Users**
6. In section **OAuth & Permissions** add permissions named `bot` and `chat:write:bot`
7. In the same section click on **Install App to Team** in order to get the **Bot User Oauth Access Token** which are saved in our env variable as `SLACK_BOT_ACCESS_TOKEN`
8. Then add a redirect URLs like this one `https://yourCustomDomain/api/v1.0/slack/authorize`
9. In section **Basic Information** you can fetch the **Client ID** saved in our env variable as `SLACK_ID`, the **Client Secret** saved in `SLACK_SECRET` and the **Verification Token** in `SLACK_TOKEN`
10. Go in **Manage Distribution** section and open the **Sharable URL** to install slack bot into your team.

## Help

- [Slack documentation](https://api.slack.com/docs/messages)
