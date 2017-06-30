"use strict";

import * as Bluebird from "bluebird";;
import * as cfg from "../config/config-loader";
import * as apiaiLib from "apiai";

export interface ApiaiSdk {
  textRequestAsync(message: string, opts: {sessionId: string}): Promise<any>;
}

const config = cfg.load();
const apiai = apiaiLib(config.apiai.token);
export let apiaiSdk: ApiaiSdk = <ApiaiSdk>{};

apiaiSdk.textRequestAsync = (message: string, opts: {sessionId: string}): Promise<any> =>
  new Bluebird((resolve, reject) => {
    const request = apiai.textRequest(message, opts);

    request.on("response", (response) => resolve(response));

    request.on("error", (error) => reject(error));

    request.end();
  });
