"use strict";

import * as Bluebird from "bluebird";
import { TextMessage } from "../../../platforms/generics";

class Thanks {
  static action (senderId?, message?, entities?, res?): Promise<any> {
    return Bluebird.resolve({ responses: [new TextMessage("De rien avec plaisir :)")], feedback: false });
  }
}

export default { thanks: Thanks };
