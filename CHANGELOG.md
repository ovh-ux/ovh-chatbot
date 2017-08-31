<a name="1.2.0"></a>
# :gem: [1.2.0](https://github.com/ovh-ux/ovh-chatbot/compare/1.1.0...1.2.0) inexpensive-science (2017-08-30) :gem:


### :ambulance: Bug Fixes :ambulance:

  **controller/web:**

  * fix promise in response not resolved ([0ce998f](https://github.com/ovh-ux/ovh-chatbot/commit/0ce998f))

  **platforms:**

  * fix reaching message length limit ([a34d1aa](https://github.com/ovh-ux/ovh-chatbot/commit/a34d1aa))

  **security:**

  * fix x-hub-signature wasn't properly checked ([cf7ad8e](https://github.com/ovh-ux/ovh-chatbot/commit/cf7ad8e))

### :sparkles: Features :sparkles:

  **apiai:**

  * support for multiple apiai ([0de6eac](https://github.com/ovh-ux/ovh-chatbot/commit/0de6eac))

  **bot:**

  * add when will my service expires ? ([a6d7f3c](https://github.com/ovh-ux/ovh-chatbot/commit/a6d7f3c))
  * inform user when service doesn't work anymore ([0330462](https://github.com/ovh-ux/ovh-chatbot/commit/0330462))

  **express:**

  * add cache for web users ([fe57549](https://github.com/ovh-ux/ovh-chatbot/commit/fe57549))

  **Grunt:**

  * add grunt for compiling api.ai zip configs ([a1ee7f7](https://github.com/ovh-ux/ovh-chatbot/commit/a1ee7f7))
  * add i18n feature ([e971185](https://github.com/ovh-ux/ovh-chatbot/commit/e971185))
  * add loggin ([d8ba0cf](https://github.com/ovh-ux/ovh-chatbot/commit/d8ba0cf))

  **tools:**

  * add api ai update task ([c4c7b81](https://github.com/ovh-ux/ovh-chatbot/commit/c4c7b81))

<a name="1.1.0"></a>
# :gem: [1.1.0](https://github.com/ovh-ux/ovh-chatbot/compare/1.0.0...v1.1.0) Moving Smoke (2017-08-07) :gem:

### :ambulance: Bug Fixes :ambulance:

**bot:**
  * empty title when no description in buttons ([3e88a0f](https://github.com/ovh-ux/ovh-chatbot/commit/3e88a0f))
  * crash when you aren't connected ([e5d4301](https://github.com/ovh-ux/ovh-chatbot/commit/e5d4301))
  * crash when you don't know an intent ([fe4de03](https://github.com/ovh-ux/ovh-chatbot/commit/fe4de03))

**constants:**
  * French typos ([222962c](https://github.com/ovh-ux/ovh-chatbot/commit/222962c))

**controllers:**
  * missing type for quick responses ([61f720f](https://github.com/ovh-ux/ovh-chatbot/commit/61f720f))

**controllers/messenger:**
  * wrong path for platforms ([a1dd6fb](https://github.com/ovh-ux/ovh-chatbot/commit/a1dd6fb))

**deps:**
  * remove useless eslint-plugin-import deps. ([bba5ff7](https://github.com/ovh-ux/ovh-chatbot/commit/bba5ff7))

**diag:**
  * missing web support ([c6cd5d9](https://github.com/ovh-ux/ovh-chatbot/commit/c6cd5d9))

**diag/xdsl:**
  * missing manager link ([f1b01fe](https://github.com/ovh-ux/ovh-chatbot/commit/f1b01fe))

**messenger:**

  * change for buttonlistmessage ([5dcbefb](https://github.com/ovh-ux/ovh-chatbot/commit/5dcbefb))
  * incorect buttonListMessage adapter ([4fbcc59](https://github.com/ovh-ux/ovh-chatbot/commit/4fbcc59))

**mongo:**
  * failling to connect to mongo ([a198694](https://github.com/ovh-ux/ovh-chatbot/commit/a198694))

**ndh:**
  * spelling and json parsing ([2651586](https://github.com/ovh-ux/ovh-chatbot/commit/2651586))

**package:**
  * delete useless dependency ([aa0bbf5](https://github.com/ovh-ux/ovh-chatbot/commit/aa0bbf5))

**package.json:**
  * update license to BSD-3-Clause. ([2be8bc7](https://github.com/ovh-ux/ovh-chatbot/commit/2be8bc7))

**platform/messenger:**

  * change for delete_original ([5ab7fe8](https://github.com/ovh-ux/ovh-chatbot/commit/5ab7fe8))
  * change replace_original ([abff282](https://github.com/ovh-ux/ovh-chatbot/commit/abff282))
  * fix more button ([#27](https://github.com/ovh-ux/ovh-chatbot/issues/27)) ([df195f0](https://github.com/ovh-ux/ovh-chatbot/commit/df195f0))
  * fix sendFeedback ([da89c4d](https://github.com/ovh-ux/ovh-chatbot/commit/da89c4d))

**slack:**
  * send 200 when receiving a message and not processed ([cc2c6da](https://github.com/ovh-ux/ovh-chatbot/commit/cc2c6da))

**web:**
  * add response to welcome and connection intent ([f63aabf](https://github.com/ovh-ux/ovh-chatbot/commit/f63aabf))
  * security issue with web model add ttl ([0fa8f00](https://github.com/ovh-ux/ovh-chatbot/commit/0fa8f00))

**website_break:**
  * delete useless textMessage ([5d00af1](https://github.com/ovh-ux/ovh-chatbot/commit/5d00af1))


### :sparkles: Features :sparkles:

**chatbot:**
  * add disclaimer for outage p19 ([4bcc66b](https://github.com/ovh-ux/ovh-chatbot/commit/4bcc66b))
  * add feedback ([11e6e73](https://github.com/ovh-ux/ovh-chatbot/commit/11e6e73))
  * add whoAmI ([6288544](https://github.com/ovh-ux/ovh-chatbot/commit/6288544))
  * add smalltalk feature ([9788bcb](https://github.com/ovh-ux/ovh-chatbot/commit/9788bcb))
  * add smalltalk feature and random for more fun ([edf8480](https://github.com/ovh-ux/ovh-chatbot/commit/edf8480))
  * add telephony diagnostic ([354719b](https://github.com/ovh-ux/ovh-chatbot/commit/354719b))
  * add xdsl diagnostic ([8e46f04](https://github.com/ovh-ux/ovh-chatbot/commit/8e46f04))
  * externalise local strings => constants ([c922632](https://github.com/ovh-ux/ovh-chatbot/commit/c922632))

**feedback:**
  * add thanks ([24a865b](https://github.com/ovh-ux/ovh-chatbot/commit/24a865b))
  * add questions ([61755d9](https://github.com/ovh-ux/ovh-chatbot/commit/61755d9))
  * add token auth ([dc275a7](https://github.com/ovh-ux/ovh-chatbot/commit/dc275a7))

**platform:**
  * add delete original when click on feedback button ([e4348da](https://github.com/ovh-ux/ovh-chatbot/commit/e4348da))
  * add feedback in slack ([259c7f2](https://github.com/ovh-ux/ovh-chatbot/commit/259c7f2))
  * emojify ! ([6fa07fa](https://github.com/ovh-ux/ovh-chatbot/commit/6fa07fa))

**slack/messenger:**
  * add web support ([00d4e6e](https://github.com/ovh-ux/ovh-chatbot/commit/00d4e6e))
  * beautify user display ([699ac60](https://github.com/ovh-ux/ovh-chatbot/commit/699ac60))


<a href="1.0.0"></a>
# :gem: [1.0.0](https://github.com/ovh-ux/ovh-chatbot/tree/1.0.0) Running Artificial (2017-05-04) :gem:
### :tada: Features :tada:

**chatbot:**
  * first commit ([1385305](https://github.com/ovh-ux/ovh-chatbot/commit/1385305))
