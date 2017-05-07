# Contributing to ovh-chatbot [![Gitter](https://img.shields.io/gitter/room/nwjs/nw.js.svg)](https://gitter.im/ovh/ux)

This project accepts contributions. In order to contribute, you should
pay attention to a few things:

1. your code must follow the coding style rules
2. your code must be fully documented
3. GitHub Pull Requests

## Coding and documentation Style:

- Code must pass with `npm run lint`
- Code must pass with `npm test`

## Licensing for new files:

Ovh-chatbot is licensed under a MIT license. Anything contributed to
Ovh-chatbot must be released under this license.

When introducing a new file into the project, please make sure it has a
copyright header making clear under which license it's being released.

### Add a new platform [visit this page](platforms/README.md)

### Add a new intent and response [visit this page](bots/README.md)

### Add a new diagnostic

+ At the moment only diagnostics for hosting are made but in order to create a new kind of diagnostic you have to create new file in `diagnostics`.

+ This file should must object with methods to make diagnostics
