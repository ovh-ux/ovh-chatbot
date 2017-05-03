# Bots

Represent all the modules about bot's answers and her specific type with an intention already given

## Overview

+ `messageTypes` --> Represent the answers type
+ [`hosting.js`](hosting.js) --> Manage the questions about hosting bot
+ [`utils.js`](utils.js)


### Add a new intent and response

+ Create new file in the corresponding directory, if your intent is an answer to a message send by the user add a new file in `messageTypes/message` and if it's a response from a postback action button so create a new file in `messageTypes/postback`.

+ This new file must export a class with a static function with this prototype `static action(senderId, message, entities, res)` and return a promise.

+ The return structure must be an object from [generics](../platforms/generics.js)

+ In the exported object, the name of the key must be the intent name