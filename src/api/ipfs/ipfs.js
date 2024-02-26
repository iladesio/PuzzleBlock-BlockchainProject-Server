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
        typeOfFile = req.body.type
        const { PINATA_API_KEY_2, SECRET_PINATA_API_KEY_2 } = process.env;
        const pinata = new pinataSDK(PINATA_API_KEY_2, SECRET_PINATA_API_KEY_2);

        const options = {
            pinataMetadata: {
                name: filename,
                keyvalues: {
                    type: typeOfFile
                }
            }

        };

        // We pass in the readable stream for the file, ******and****** the options object.
        pinata.pinJSONToIPFS(jsonObject, options).then((result) => {
            //handle results here
            res.json(result.IpfsHash);
        }).catch((err) => {
            //handle error here
            res.status(500).send("Impossible to save data on IPFS: " + err.message)
        });

    } catch (error) {
        res.status(500).send("Cannot pin file: " + error);
    }

});

router.post('/pinByHash', (req, res) => {
    try {
        hash = req.body.ipfsCid
        username = req.body.username
        typeOfFile = req.body.type

        const { PINATA_API_KEY_2, SECRET_PINATA_API_KEY_2 } = process.env;
        const pinata = new pinataSDK(PINATA_API_KEY_2, SECRET_PINATA_API_KEY_2);

        const options = {
            pinataMetadata: {
                name: username,
                keyvalues: {
                    type: typeOfFile
                }
            }

        };

        pinata.pinByHash(hash, options).then((result) => {
            //handle results here
            res.json("Ok");
        }).catch((err) => {
            //handle error here
            res.status(500).send("Impossible to pin hash: " + err.message)
        });


    } catch (error) {
        res.status(500).send("Cannot pin hash: " + error);
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
        const { PINATA_API_KEY_2, SECRET_PINATA_API_KEY_2 } = process.env;
        const pinata = new pinataSDK(PINATA_API_KEY_2, SECRET_PINATA_API_KEY_2);

        // We pass in the readable stream for the file, ******and****** the options object.
        pinata.unpin(hash).then((result) => {
            //handle results here
            res.json(result);
        }).catch((err) => {
            //handle error here
            res.status(500).send("Impossible to unpin json: " + err.message)
        });
    } catch (error) {
        res.status(500).send("Cannot unpin file: " + error);
    }
});

router.post('/getFiles', async (req, res) => {
    try {
        username = req.body.username
        type = req.body.type
        const { PINATA_TOKEN_2 } = process.env;


        var url = 'https://api.pinata.cloud/data/pinList?includeCount=true&status=pinned&metadata[keyvalues]={"type":{"value":"' + type + '","op":"eq"}}';
        if (username !== undefined && username !== "")
            url = 'https://api.pinata.cloud/data/pinList?includeCount=true&status=pinned&metadata[keyvalues]={"type":{"value":"' + type + '","op":"eq"}}&metadata[name]=' + username

        header = { Authorization: 'Bearer ' + PINATA_TOKEN_2 }

        await axios.get(url, {
            headers: header
        }).then((response) => {
            res.json(response.data);
        }).catch(function (err) {
            throw "pinList error :" + err
        });

    } catch (error) {
        res.status(500).send("Cannot retrieve profiles: " + error);
    }

});


// Export the router
module.exports = router;