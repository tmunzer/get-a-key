

module.exports.configuration = {
    location: {
        GET: require("./configuration/location/location").GET
    }
};

module.exports.monitor = {
    device: {
        GET: require("./monitor/device").GET
    },
    client: {
        clientsList: require("./monitor/client").clientsList,
        clientDetails: require("./monitor/client").clientDetails
    }
};

module.exports.clientlocation = {
    clienttimeseries: {
        GET: require("./clientlocation/clienttimeseries").GET,
        GETwithEE: require("./clientlocation/clienttimeseries").GETwithEE

    },
    clientcount: {
        GET: require("./clientlocation/clientcount").GET,
        GETwithEE: require("./clientlocation/clientcount").GETwithEE
    }
};

module.exports.identity = {
    userGroups: {
        getUserGroups: require("./identity/userGroups").getUserGroups
    },
    credentials: {
        getCredentials: require("./identity/credentials").getCredentials,
        createCredential: require("./identity/credentials").createCredential,
        deleteCredential: require("./identity/credentials").deleteCredential,
        deliverCredential: require("./identity/credentials").deliverCredential,
        renewCredential: require("./identity/credentials").renewCredential,
        updateCredential: require("./identity/credentials").updateCredential
    }
};