# Diagnostics

> contains all the diagnostics methods used in order to perform a diagnostic.

## Overview

+ [`hosting.js`](hosting.js) => hosting diagnostics (dns, mail, html error codes).
+ [`telephony.js`](telephony.js) => telephony diagnostics (billing and portability)
+ [`xdsl.js`](xdsl.js) => xDSL diagnostics (billing, order, slamming, incidents, line diagnostic)

### Add a New diagnostic

+ you have to create new file for your diagnostic.
+ This file must export object with methods to make diagnostics
+ They're are no specific rules about the methods. However, we recommend having methods returning an Array of object/promises from [generics](../platforms/generics.js).
