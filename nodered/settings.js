module.exports = {
    // The TCP port that Node-RED will listen on
    uiPort: process.env.PORT || 1880,

    // The file containing the flows
    flowFile: 'flows.json',

    // The root path for the Node-RED editor
    httpAdminRoot: '/editor',

    // The root path for the dashboard
    httpNodeRoot: '/',

    // Serve a static directory of files from within the Docker container
    httpStatic: '/data/frontend_dist',

    // Any other global settings for the Node-RED runtime
    functionGlobalContext: {
        // os:require('os'),
    },

    // Logging
    logging: {
        // Console logging
        console: {
            level: "info",
            metrics: false,
            audit: false
        }
    }
};
