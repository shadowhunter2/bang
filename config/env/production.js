/**
 * Production environment settings
 *
 * This file can include shared settings for a production environment,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */
var radisHost = "192.168.100.37";
var redisPort = 6399;

module.exports = {

	/***************************************************************************
	 * Set the default database connection for models in the production        *
	 * environment (see config/connections.js and config/models.js )           *
	 ***************************************************************************/

	session : {
		host : radisHost,
    port :redisPort
	},

	fastCache : {
		host : radisHost,
		port : redisPort,
		pass : 'youknowthat',
		ttl : 20 * 60
	},

	serverConfig : {
		API_SERVER : "http://apikg.kktv1.com:8080/kkgame/entrance",
		CENTRAL_SERVER_ADDRESS : "http://192.168.100.74:80",
		JS_API_SERVER : "http://apikg.kktv1.com:8080/kkgame/entrance",
		CDN_SERVER : "/CDN/output"
	},


	/***************************************************************************
	 * Set the port in the production environment to 80                        *
	 ***************************************************************************/

	port : 1180,

	/***************************************************************************
	 * Set the log level in production environment to "silent"                 *
	 ***************************************************************************/

	log : {
		level : "error"
	}

};
