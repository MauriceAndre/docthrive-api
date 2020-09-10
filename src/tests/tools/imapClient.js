// external modules
const imaps = require("imap-simple");
const config = require("config");

let options = config.get("testMail");

options = {
  imap: {
    ...options,
  },
};

function connect() {
  return imaps.connect(options);
}

async function deleteAllMessages(connection) {
  //   const results = await connection.search(["ALL"]);
  //   const uids = results.map((res) => res.attributes.uid);
  await connection.deleteMessage("*");
}

module.exports = {
  connect,
  deleteAllMessages,
};
