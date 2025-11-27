const path = require('path');

module.exports = {
    // The TCP port that Node-RED will listen on
    uiPort: process.env.PORT || 1880,

    // The file containing the flows
    flowFile: 'flows.json',

    // Make the editor UI read-only
    // editorTheme: {
    //     projects: {
    //         enabled: false
    //     }
    // },

    // Serve a static directory of files
    // This is used to serve the compiled React frontend
    httpStatic: path.join(__dirname, '../frontend/dist'),

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
