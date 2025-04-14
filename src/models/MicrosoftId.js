const MsIdExpress = require("microsoft-identity-express");
const appSettings = require("../appSettings");

class MicrosoftId {
  constructor(appSettings) {
    if (!MicrosoftId._intance) {
      MicrosoftId._instance = new MsIdExpress.WebAppAuthClientBuilder(
        appSettings
      ).build();
    }
    return MicrosoftId._instance;
  }
}

const msid = new MicrosoftId(appSettings);

module.exports = msid;
