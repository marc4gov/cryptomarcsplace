task("request-random-crypto-marc", "Requests a random CryptoMarc for a Chainlink VRF enabled smart contract")
    .addParam("contract", "The address of the RandomCryptoMarc contract that you want to call")
    .setAction(async taskArgs => {

        const contractAddr = taskArgs.contract
        const networkId = network.name
        console.log("Requesting a random number using RandomCryptoMarc contract ", contractAddr, " on network ", networkId)
        const RandomCryptoMarc = await ethers.getContractFactory("RandomCryptoMarc")

        //Get signer information
        const accounts = await hre.ethers.getSigners()
        const signer = accounts[0]

        //Create connection to VRF Contract and call the getRandomNumber function
        const vrfConsumerContract = new ethers.Contract(contractAddr, RandomCryptoMarc.interface, signer)
        var result = await vrfConsumerContract.requestNewRandomCryptoMarc('CryptoMarc')
        console.log('Contract ', contractAddr, ' random cryptomarc request successfully called. Transaction Hash: ', result.hash)
        console.log("Run the following to read the returned random number:")
        console.log("npx hardhat read-random-crypto-marc --contract " + contractAddr + " --network " + network.name)
    })

module.exports = {}
