var client = require('smartsheet');
var token = process.env.SMARTSHEET_ACCESS_TOKEN;
var ss = client.createClient({ accessToken: token, logLevel: 'info' });
module.exports.cache = { };
module.exports = ss;
