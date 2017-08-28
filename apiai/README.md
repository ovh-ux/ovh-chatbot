# Apiai

## Overview

> All the files related to apiai agents

- `translations/`: contains the translation files.
- `template.json`: template file where every number is replaced by its corresponding value from the translations files


## Setup Apiai

In order to have the good api.ai token used (ie: use the right language), you have to add your api.ai token in mongo, following the format in [models/api.ai.model.js](../models/api.ai.model.js) :
```json
{
  "locale": "en_US",
  "token": "YOUR-TOKEN-HERE"
}
```

### tools

Have a look at [/tools](../tools)!
