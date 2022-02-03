task("read-tokenuri-crypto-marc", "Sets the tokenURI of a knwon CryptoMarc")
.addParam("contract", "The address of the RandomCryptoMarc contract that you want to act upon")
.addParam("tokenid", "The id of the CryptoMarc")
    .setAction(async taskArgs => {

        const contractAddr = taskArgs.contract
        const networkId = network.name
        const tokenId = taskArgs.tokenid
        
        console.log("Reading data from contract ", contractAddr, " on network ", networkId)
        const RandomCryptoMarc = await ethers.getContractFactory("RandomCryptoMarc")

        //Get signer information
        const accounts = await hre.ethers.getSigners()
        const signer = accounts[0]

        //Create connection to Contract and call the createRequestTo function
        const randomCryptoMarcContract = new ethers.Contract(contractAddr, RandomCryptoMarc.interface, signer)

        let result = String(await randomCryptoMarcContract.tokenURI(tokenId)).toString()
        console.log('Token URI: ', result)
        if (result == 0 && ['hardhat', 'localhost', 'ganache'].indexOf(network.name) == 0) {
            console.log("You'll either need to wait another minute, or fix something!")
        }
        if (['hardhat', 'localhost', 'ganache'].indexOf(network.name) >= 0) {
            console.log("You'll have to manually update the value since you're on a local chain!")
        }
    })

module.exports = {}
