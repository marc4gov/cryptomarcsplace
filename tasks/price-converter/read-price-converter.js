task("read-price-converter", "Gets the latest quote from a ratio of 2 Chainlink Price Feeds")
.addParam("contract", "The address of the Price Converter consumer contract that you want to read")
.addParam("basepair", "The token pair that you want as a base, ie 'DAI/USD'")
.addParam("quotepair", "The token pair that you want as a quote , ie 'EUR/USD'")
    
    .setAction(async taskArgs => {

        const contractAddr = taskArgs.contract
        const baseAddr = taskArgs.basepair
        const quoteAddr = taskArgs.quotepair
        const decimals = 8
        
        const networkId = network.name

        const PriceConverterContract = await ethers.getContractFactory("PriceConverter")
        console.log("Reading data from Price Converter consumer contract ", contractAddr, " on network ", networkId)

        //Get signer information
        const accounts = await ethers.getSigners()
        const signer = accounts[0]
        const priceConverterContract = await new ethers.Contract(contractAddr, PriceConverterContract.interface, signer)
        await priceConverterContract.getDerivedPrice(baseAddr, quoteAddr, decimals).then((data) => {
            console.log('Ratio base numerator/quote numerator is: ', BigInt(data).toString())
        })
    })

module.exports = {}
