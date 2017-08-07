# constants

contains all the string the bot needs for answering the user.

## Overview

+ [diagnostics.js](diagnostics.js): the string for the diagnostics, separated in each diagnostics category.
+ [guides.js](guides.js): a list of guides for helping the user.
+ [responses.js](responses.js): the string used before doing diagnostics, and for generic messages.

### Dynamic strings

In order to have dynamic string generated, the [vocajs lib](https://vocajs.com/) is used. Have a look at the method `sprintf`.

[From the vocajs.sprintf doc](https://vocajs.com/#sprintf) :
>   By default, the arguments are used in the given order.

>   For argument numbering and swapping, %m$ (where m is a number indicating the argument order) is used instead of % to specify explicitly which argument is taken. For instance %1$s fetches the 1st argument, %2$s the 2nd and so on, no matter what position the conversion specification has in format.
