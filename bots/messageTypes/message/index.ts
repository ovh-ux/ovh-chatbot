"use strict";

import dnsServerConfig from "./dns_server_config";
import domainToHosting from "./domain_to_hosting";
import thanks from "./thanks";
import websiteBreak from "./website_break";
import goodAnswer from "./good_answer";
import ndhQuestion from "./ndh_question";

export default Object.assign({}, dnsServerConfig, domainToHosting, thanks, websiteBreak, goodAnswer, ndhQuestion);
