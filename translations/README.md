# Translations

> contains all the translation file needed for the bot to answer

Translation are named: `translation_<locale>.json` and JSON follow this pattern:

```json
  {
    "key": "value"
  }
```

if a translation file (or a key) is not found, it will use the default file `translation_en_US.json` ([source](https://github.com/ovh-ux/ovh-chatbot/utils/translator.js#L23))

You can add you own translations:
- duplicate a translation file
- name it with your locale
- edit the values (watch out for the "\n" and "\t")
