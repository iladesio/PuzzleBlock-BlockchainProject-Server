const { Console } = require('console');
const express = require('express');
const router = express.Router();
const axios = require('axios')
const { Web3 } = require('web3'); // Importare Web3 correttamente

router.post('/userInfo', async (req, res) => {

    try {
        var address = req.body.address

        if (address === undefined || address === "") {
            throw "Address must be set";
        }

        //given the address, call the PuzzleContract function of getUserInfo. 
        var web3 = new Web3('http://127.0.0.1:7545');

        const ABI = require('../../contracts/PuzzleContract.json');
        console.log("ABI: " + ABI)
        const contractAddress = require('../../contracts/contracts.json')["PuzzleContract"];
        console.log("contractAddress: " + contractAddress)

        var contract = new web3.eth.Contract(ABI, contractAddress);
        // Get the current value of my number
        var result = undefined;
        try {
            result = await contract.methods.getUserInfo(address).call();
        } catch (e) {
            throw "Error during getUserInfo contract call with input address " + address + ": " + e
        }

        if (result === undefined)
            throw "User not found";
        if (result === '0' || result == 0) {
            res.json({})
        } else {
            var userJsonHash = result;  //web3.utils.hexToAscii(result.toString(16))

            //invoke post request to localhost:3000/api/ipfs/getPinnedJson
            await axios.post("http://localhost:3000/api/ipfs/getPinnedJson", {
                hash: userJsonHash
            }).then((response) => {
                res.json(response.data)
            }).catch(function (error) {
                throw "Cannot read from IPFS: " + error.response.data;
            });

        }
    } catch (error) {
        res.status(500).send(error);
    }
});


router.post('/register', async (req, res) => {
    try {

        var address = req.body.address;
        var username = req.body.username;
        if (address === undefined || address === "") {
            throw "Address must be set";

        }

        if (username === undefined || username === "") {
            throw "Username must be set";
        }

        //invoke post request to localhost:3000/api/ipfs/usernameExists
        await axios.post("http://localhost:3000/api/ipfs/usernameExists", { username: username }).then((response) => {
            if (response.data.result)
                throw "Username already used";
        });

        //given the address, call the PuzzleContract function of getUserInfo. 
        var web3 = new Web3('http://127.0.0.1:7545');


        const ABI = require('../../contracts/PuzzleContract.json');
        //console.log("ABI: " + ABI)
        const contractAddress = require('../../contracts/contracts.json')["PuzzleContract"];
        //console.log("contractAddress: " + contractAddress)

        var contract = new web3.eth.Contract(ABI, contractAddress);
        // Get the current value of my number
        var result = await contract.methods.getUserInfo(address).call();
        if (result != 0) {
            throw "User already registered";
        } else {

            var userJson = {
                "UserAddress": address,
                "Username": username,
                "PrimaryBalance": 0,
                "SecondaryBalance": 0,
                "Points": 0,
                "CurrentLevel": 0,
                "RunCompleted": 0,
                "AmethystNumber": 0,
                "GrimoireNumber": 0,
                "PotionNumber": 0
            }
            try {
                //invoke post request to localhost:3000/api/ipfs/getPinnedJson
                axios.post("http://localhost:3000/api/ipfs/pinJson", {
                    jsonObject: userJson,
                    filename: username
                }).then((response) => {
                    let ret = response.data.result;
                    console.log("User registered in IPFS with CID: " + ret);
                    res.json(ret);
                });

            } catch (error) {
                throw "Cannot read from IPFS: " + error.response.data;
            }
        }
    } catch (e) {
        res.status(500).send(e);
    }
});

// Export the router
module.exports = router;