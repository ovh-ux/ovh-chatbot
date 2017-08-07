<a name="1.1.0"></a>
# [1.1.0](https://github.com/ovh-ux/ovh-chatbot/compare/1.0.0...v1.1.0) (2017-08-03)


### Bug Fixes

  **bot:**

  * empty title when no description in buttons ([3e88a0f](https://github.com/ovh-ux/ovh-chatbot/commit/3e88a0f))
  * crash when you aren't connected ([e5d4301](https://github.com/ovh-ux/ovh-chatbot/commit/e5d4301))
  * crash when you don't know an intent ([fe4de03](https://github.com/ovh-ux/ovh-chatbot/commit/fe4de03))


  **bots/postback:**

  * wrong path for messages model ([84bdbaa](https://github.com/ovh-ux/ovh-chatbot/commit/84bdbaa))


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

  * delete useless dependency 💄 ([aa0bbf5](https://github.com/ovh-ux/ovh-chatbot/commit/aa0bbf5))


  **package.json:**

  * update license to BSD-3-Clause. ([2be8bc7](https://github.com/ovh-ux/ovh-chatbot/commit/2be8bc7))


  **platform/messenger:**

  * fix more button ([#27](https://github.com/ovh-ux/ovh-chatbot/issues/27)) ([df195f0](https://github.com/ovh-ux/ovh-chatbot/commit/df195f0))
  * change for delete_original ([5ab7fe8](https://github.com/ovh-ux/ovh-chatbot/commit/5ab7fe8))
  * change replace_original ([abff282](https://github.com/ovh-ux/ovh-chatbot/commit/abff282))
  * fix sendFeedback ([da89c4d](https://github.com/ovh-ux/ovh-chatbot/commit/da89c4d))


  **slack:**

  * send 200 when receiving a message and not processed ([cc2c6da](https://github.com/ovh-ux/ovh-chatbot/commit/cc2c6da))


  **web:**

  * add response to welcome and connection intent ([f63aabf](https://github.com/ovh-ux/ovh-chatbot/commit/f63aabf))
  * security issue with web model add ttl ([0fa8f00](https://github.com/ovh-ux/ovh-chatbot/commit/0fa8f00))


  **website_break:**

  * delete useless textMessage ([5d00af1](https://github.com/ovh-ux/ovh-chatbot/commit/5d00af1))


### Features

  **chatbot:**

  * add disclaimer for outage p19 ([4bcc66b](https://github.com/ovh-ux/ovh-chatbot/commit/4bcc66b))
  * add feedback ([11e6e73](https://github.com/ovh-ux/ovh-chatbot/commit/11e6e73))
  * add whoAmI ([6288544](https://github.com/ovh-ux/ovh-chatbot/commit/6288544))
  * externalise local strings => constants ([c922632](https://github.com/ovh-ux/ovh-chatbot/commit/c922632))
  * add smalltalk feature ([9788bcb](https://github.com/ovh-ux/ovh-chatbot/commit/9788bcb))
  * add smalltalk feature and random for more fun ([edf8480](https://github.com/ovh-ux/ovh-chatbot/commit/edf8480))
  * add telephony diagnostic ([354719b](https://github.com/ovh-ux/ovh-chatbot/commit/354719b))
  * add xdsl diagnostic ([8e46f04](https://github.com/ovh-ux/ovh-chatbot/commit/8e46f04))


  **feedback:**

  * add thanks ([24a865b](https://github.com/ovh-ux/ovh-chatbot/commit/24a865b))
  * add questions ([61755d9](https://github.com/ovh-ux/ovh-chatbot/commit/61755d9))
  * add token auth ([dc275a7](https://github.com/ovh-ux/ovh-chatbot/commit/dc275a7))


  **platform:**

  * emojify ! ([6fa07fa](https://github.com/ovh-ux/ovh-chatbot/commit/6fa07fa))
  * add delete original when click on feedback button ([e4348da](https://github.com/ovh-ux/ovh-chatbot/commit/e4348da))
  * add feedback in slack ([259c7f2](https://github.com/ovh-ux/ovh-chatbot/commit/259c7f2))


  **slack/messenger:**

  * beautify user display ([699ac60](https://github.com/ovh-ux/ovh-chatbot/commit/699ac60))
  * add web support ([00d4e6e](https://github.com/ovh-ux/ovh-chatbot/commit/00d4e6e))


<a href="1.0.0"></a>
# [1.0.0](https://github.com/ovh-ux/ovh-chatbot/tree/1.0.0) (2017-05-04)

### Features

**chatbot:**

  * first commit ([1385305](https://github.com/ovh-ux/ovh-chatbot/commit/1385305))
