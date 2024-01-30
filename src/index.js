const fs = require('fs'); // Rimuovere 'node:' per evitare problemi di compatibilità
const {Web3} = require('web3'); // Importare Web3 correttamente
const path = require('path');
var constants = require('./constants');

// Connessione al provider locale di Ethereum
web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));

async function deployContracts() {
    let contractsInfo = [];
    
    console.log("Total number of contracts to deploy:", constants.CONTRACTS.length);

    for (let contractData of constants.CONTRACTS) {
        const filePath = path.resolve(__dirname, './contracts/' + contractData['name'] + '.txt');
        // Carica l'ABI e il bytecode del contratto
        const ABI = require('./contracts/' + contractData['name'] + '.json');
        const bytecode = fs.readFileSync(filePath, 'utf8');
        
        console.log("Deploying Contract:", contractData['name']);
        let contractInstance = new web3.eth.Contract(ABI);
        
        try {
            let newContract = await contractInstance
                .deploy({ data: bytecode })
                .send({ from: constants.ADMIN_ACCOUNT, gas: 4700000 });
            
            console.log("Contract Address:", newContract.options.address);

            // Aggiungi le informazioni del contratto a contractsInfo
            contractsInfo.push({
                name: contractData['name'],
                address: newContract.options.address,
                abi: ABI,
                bytecode: bytecode
            });
        } catch (error) {
            console.error("Error deploying contract:", contractData['name'], error);
        }
    }
    fs.writeFileSync(constants.CONTRACTS_JSON, JSON.stringify(contractsInfo, null, 2));
    console.log('Contracts information has been saved to ' + constants.CONTRACTS_JSON);
}

deployContracts();
