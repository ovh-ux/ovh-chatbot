# Tools

All the scripts needed for ApiAi Management.

### jsonZipConversion.js

Conversion tool between api.ai zip file and a single json file containing all the relevant data.

### apiAiTranslation.js

Conversion tool between our custom api.ai json file to json file ready for translation (have a look at : [/apiai](../apiai/))

### apiAiUploadZip.js

Tool to update all the api.ai agents at once.

- It will get the associate archive depending on the language of the bot. You can either restore or update the agent. *Restoration is discouraged as it might alter the language property of the agent*

- It requires to have a cookie string containing the session information in order to authenticate. This cookie string must be in the `APIAI_COOKIE` environment variable.

## Workflow

1. Work on one agent in api.ai, add you intents and entities, with example and (if needed) the responses.

2.  Download the agent archive (`Settings/Export and Import/Export as Zip`) and copy it to `apiai/archives/ovh-chatbot.zip`

3. `$ grunt export`: it will create the `apiai/translations` folder and the `template.json` based on the `apiai/archives/ovh-chatbot.zip`.

4. Provide all the translations files needed based of the generated translation file: `translations/apiai_fr.json`

5. Set the `APIAI_COOKIE` environment variable, how to do it:
  - Login to api.ai.
  - Open the developer tools.
  - Go to https://console.api.ai/api-client/user/.
  - In your developer tools window, go to the network tab.
  - Find the request.
  - The cookie value, in the request headers is what you need.

6. `$ grunt import`: it will generate back the different archives and upload it to api.ai

7. You're done! Each agent in api.ai has been updated to the last translations files and the new intents and entities have been added :tada:
