// This script only works with --network 'mainnet', or 'hardhat' when running a fork of mainnet 
task("read-price-converter-ens", "Gets the latest quote from a ratio of 2 Chainlink Price Feeds")
.addParam("basepair", "The token pair that you want as a base, ie 'dai-usd'")
.addParam("quotepair", "The token pair that you want as a quote , ie 'eur-usd'")
    .setAction(async taskArgs => {

        const ensBaseAddress = taskArgs.basepair + ".data.eth"
        const ensQuoteAddress = taskArgs.quotepair + ".data.eth"
        
        console.log("Base address: ", ensBaseAddress)
        console.log("Quote address: ", ensQuoteAddress)
        

        const V3Aggregator = await ethers.getContractFactory("MockV3Aggregator")
        console.log("Reading data from Price Feed consumer contract ", ensBaseAddress)
        console.log("Reading data from Price Feed consumer contract ", ensQuoteAddress)
        

        //Get signer information
        const accounts = await ethers.getSigners()
        const signer = accounts[0]
        let priceFeedConsumerContract = await new ethers.Contract(ensBaseAddress, V3Aggregator.interface, signer)
        await priceFeedConsumerContract.latestRoundData().then((data) => {
            console.log('Base Pair Price is: ', BigInt(data["answer"]).toString())
        })
        priceFeedConsumerContract = await new ethers.Contract(ensQuoteAddress, V3Aggregator.interface, signer)
        await priceFeedConsumerContract.latestRoundData().then((data) => {
            console.log('Quote Pair Price is: ', BigInt(data["answer"]).toString())
        })
    })

module.exports = {}
