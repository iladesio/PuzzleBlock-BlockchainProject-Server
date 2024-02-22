const { Console } = require('console');
const express = require('express');
const router = express.Router();
const pinataSDK = require('@pinata/sdk');
const axios = require('axios')
var constants = require('../../constants');

router.post('/pinJson', (req, res) => {
    try {
        jsonObject = req.body.jsonObject
        filename = req.body.filename
        //const fs = require('fs')
        const { PINATA_API_KEY_2, SECRET_PINATA_API_KEY_2 } = process.env;
        const pinata = new pinataSDK(PINATA_API_KEY_2, SECRET_PINATA_API_KEY_2);

        //const src = "user.json";
        //const file = fs.createReadStream(src)
        const options = {
            pinataMetadata: {
                name: filename
            }
        };

        // We pass in the readable stream for the file, ******and****** the options object.
        pinata.pinJSONToIPFS(jsonObject, options).then((result) => {
            //handle results here
            res.json({ "result": result.IpfsHash });
        }).catch((err) => {
            //handle error here
            res.status(500).send("Impossible to load data on IPFS: " + err)
        });

    } catch (error) {
        res.status(500).send("Cannot pin file: " + error);
    }

});


router.post('/getPinnedJson', async (req, res) => {
    try {
        hash = req.body.hash
        const { PINATA_GATEWAY_TOKEN_2 } = process.env;

        url = constants.PINATA_GATEWAY_2 + '/ipfs/' + hash

        console.log(url)

        header = { 'x-pinata-gateway-token': PINATA_GATEWAY_TOKEN_2 }

        await axios.get(url, {
            maxBodyLength: "Infinity",
            headers: header
        }).then((response) => {
            res.json(response.data)
        }).catch(function (error) {
            console.log(error)
            if (error.response != undefined) throw error.response.data;
            else if (error.cause != undefined) throw error.cause;
            else throw "cannot retrieve file from ipfs"
        });

    } catch (error) {
        res.status(500).send("Cannot retrieve file: " + error);
    }

});


router.post('/unpinJson', async (req, res) => {
    try {
        hash = req.body.hash
        const { PINATA_API_KEY, SECRET_PINATA_API_KEY } = process.env;
        const pinata = new pinataSDK(PINATA_API_KEY, SECRET_PINATA_API_KEY);

        // We pass in the readable stream for the file, ******and****** the options object.
        pinata.unpin(hash).then((result) => {
            //handle results here
            res.json({ "result": "OK" });
        }).catch((err) => {
            //handle error here
            res.status(500).send("Impossible to unpin json: " + err)
        });
    } catch (error) {
        res.status(500).send("Cannot unpin file: " + error);
    }
});

router.post('/usernameExists', async (req, res) => {
    try {
        username = req.body.username
        const { PINATA_API_KEY_2, SECRET_PINATA_API_KEY_2 } = process.env;
        const pinata = new pinataSDK(PINATA_API_KEY_2, SECRET_PINATA_API_KEY_2);

        var isFound = false;

        //const metadataFilter = {
        //    name: username,
        //    keyvalues: null

        //};

        const filters = {
            unpinEnd: null
        };


        for await (const item of pinata.getFilesByCount(filters)) {
            if (item != null && item.metadata.name === username && item.metadata.date_unpinned === null) {
                isFound = true;
                break;
            }
        }

        res.json({ "result": isFound });
    } catch (error) {
        res.status(500).send("Cannot check username: " + error);
    }

});

// Export the router
module.exports = router;