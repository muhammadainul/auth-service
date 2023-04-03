require('dotenv').config();

module.exports = {
    development: {
        myConfig: {
            sessionSecret: "topSecret!",
            refreshSessionSecret: "topSecret!",
            expiredSessionTime: "24h",
            expiredRefreshSessionTime: "24h",
            api_gateway_url: 'https://192.168.42.238:8443/',
            api_gateway_admin: 'https://192.168.42.238:8444/'
        }
    },
    test: {
        myConfig: {
            sessionSecret: "topSecret!",
            refreshSessionSecret: "topSecret!",
            expiredSessionTime: "2h",
            expiredRefreshSessionTime: "3h",
            api_gateway_url: 'https://192.168.42.238:8443/',
            api_gateway_admin: 'https://192.168.42.238:8444/'
        }
    },
    production: {
        myConfig: {
            sessionSecret: "topSecret!",
            refreshSessionSecret: "topSecret!",
            expiredSessionTime: "2h",
            expiredRefreshSessionTime: "3h",
            api_gateway_url: 'https://192.168.42.238:8443/',
            api_gateway_admin: 'https://192.168.42.238:8444/'
        }
    }
}   