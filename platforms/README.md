# Platforms

Contains all the handlers to communicate with different platforms

## Overview

+ `messenger` --> Contains all the object and functions and adapter object to reply on Facebook Messenger
+ `slack` --> Contains functions and adapter object to send reply on Slack
+ `web` --> Contains functions and adapter object to send reply in the *ovh's managers*
+ `twitter` -->  Contains functions and adapter object to send reply on Twitter DMs

### Add a new platform

+ Add new webhook/route for specific platform in `routes` and his handler in `controllers`

+ When you call `bot.ask()` in the controller of your webhook this function return a generic structure that you must transform/adapt for your platform.

+ You have to develop adapters for your platform (for example: [messenger_adapters.js](messenger/messenger_adapters.js)).

+ For at least, each generic type you have to create an adapter and use this one in your function `send(messageData)` (example in [messenger.js](messenger/messenger.js)) that takes a generic structure and transform it via an adapter and send it to the platform API.

### Message types

+ `TextMessage` -->  simple message with text

+ `ButtonsMessage` --> message with multiple buttons (1 - 3 buttons)

+ `ButtonsListMessage` --> message with more buttons like a list and with sometimes the more button to display next items. (1 - 4 buttons)

### Button types

+ `URL` --> button with a link to other pages on the browser for example (http://ovh.com)

+ `POSTBACK` --> Button that launch an action on this API

+ `MORE` --> Button to display more items in a list
