task("read-random-crypto-marc", "Reads the random number returned to a contract by Chainlink VRF")
    .addParam("contract", "The address of the VRF contract that you want to read")
    .setAction(async taskArgs => {

        const contractAddr = taskArgs.contract
        const networkId = network.name
        console.log("Reading data from VRF contract ", contractAddr, " on network ", networkId)
        const RandomCryptoMarc = await ethers.getContractFactory("RandomCryptoMarc")

        //Get signer information
        const accounts = await hre.ethers.getSigners()
        const signer = accounts[0]

        //Create connection to Contract and call the createRequestTo function
        const vrfConsumerContract = new ethers.Contract(contractAddr, RandomCryptoMarc.interface, signer)
        let result = BigInt(await vrfConsumerContract.randomResult()).toString()
        let result2 = BigInt(await vrfConsumerContract.getNumberOfCryptoMarcs()).toString()
        console.log('# CryptoMarcs: ', result2)
        let lastTokenId = BigInt(await vrfConsumerContract.getLastTokenId()).toString()
        console.log('last token id: ', lastTokenId)
        // let res = new Array(lastTokenId + 1)
        // let res2 = new Array(lastTokenId + 1)
        // for (i = 0; i < lastTokenId; i++) {
        //     res[i] = await vrfConsumerContract.attributes(i)
        //     res2[i] = await vrfConsumerContract.competences(i)
        // }

        console.log('Random Number is: ', result)
        // for (i = 0; i < lastTokenId; i++) {
        //     console.log('CryptoMarc attributes: ', res[i].toString())
        //     console.log('CryptoMarc skills: ', res2[i].toString())
        // }
        if (result == 0 && ['hardhat', 'localhost', 'ganache'].indexOf(network.name) == 0) {
            console.log("You'll either need to wait another minute, or fix something!")
        }
        if (['hardhat', 'localhost', 'ganache'].indexOf(network.name) >= 0) {
            console.log("You'll have to manually update the value since you're on a local chain!")
        }
    })

module.exports = {}
