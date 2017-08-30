# Apiai

## Overview

> All the files related to apiai agents

- `translations/`: contains the translation files.
- `archives/`: contains an archive of the chatbot api.ai setup. It is used to generate the other archives
- `template.json`: template file where every number is replaced by its corresponding value from the translations files

### Warning

be aware that sometimes you can get escaped characters (&lt; &gt; \") in your file, if you do change them back to the unescaped one, this will be better for reading the json file. However, "&lt;" and "&gt;" are replaced automatically during the creation of the archive.


## Setup Apiai

In order to have the good api.ai token used (ie: use the right language), you have to add your api.ai token in mongo, following the format in [models/api.ai.model.js](../models/api.ai.model.js) :
```json
{
  "locale": "en_US",
  "token": "YOUR-TOKEN-HERE"
}
```

## Training apiai

Once in production, you'll find that sometimes, api.ai doesn't find the right answer. Here is a step by step procedure to add new intent in production when you work with a preproduction agent.

1. add the **new intents** to **preproduction**
2. In the **production** agent, do the training with the **knwon** intents
3. once you are done, export the **production** and import it in the **preproduction** (**DO NOT RESTORE**, you'll lose your progress)
4. Now you can export your **preproduction** (it should have the new intents + the updated intents from production).
5. You can test you archive by importing it in **production** and see in the training tab, if the answers are good.
6. Repeat this process until your are satisfied.
7. Once your done, follow the step in the [`tools`](../tools) folder to translate the agent


## tools

Have a look at [/tools](../tools)!

### apiAiMongoUpdate.js

CLI tool to update mongo databse with the new apiAI tokens depending on the locale.

first, you'll need to set your `NODE_ENV` variable, in order to load the right db, from the config files

usage:

```shell
$ node apiAiMongoUpdate locale token [-f|--force]
```

Only use force mode (-f) to replace an existing value
example:

To add a new locale, *fr_BE*
```shell
$ node apiAiMongoUpdate fr_BE THE_APIAI_TOKEN_HERE
```

To replace the existing locale *en_US*
```shell
$ node apiAiMongoUpdate en_uS THE_NEW_APIAI_TOKEN_HERE --force
```
