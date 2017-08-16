# Bots

Represent all the modules about bot's answers and its specific types with an intention already given

## Overview

+ `messageTypes` --> Represent the answers type
+ [`common.js`](common.js) --> Manage the responses
+ [`utils.js`](utils.js) --> Utility function


### Add a new intent and response

+ Create new file in the corresponding directory:
  * if your intent is an answer to a message send by the user add a new file in `messageTypes/message`
    - This new file must export a class with a static function with this prototype `static action(senderId, message, entities, res)` and return a promise (see below).
    - In the exported object, the name of the key must be the intent name

  * if it's a response from a postback action button so create a new file in `messageTypes/postback`.
    - This new file must export a array of objects containing this two properties:
      * `regx<String>`: the pattern the regex should be matching.
      * `action (senderId, postback, regx, entities, res)<function>`: the function which is going to be called and return a promise (see below).

+ The return structure must be an object containing this properties:
  * `feedback`: a boolean indicating if a request for feedback is needed
  * `responses`: an array of objects (or promises) from [generics](../platforms/generics.js)
