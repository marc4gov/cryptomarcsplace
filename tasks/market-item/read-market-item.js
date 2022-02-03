task("read-market-item", "Loads an NFT into the marketplace")
.addParam("contract", "The address of the Market contract ")
.addParam("itemid", "The item id for the Market contract ")

    
    .setAction(async taskArgs => {

        const contractAddr = taskArgs.contract
        const itemid = taskArgs.itemid

        
        const networkId = network.name

        const MarketContract = await hre.ethers.getContractFactory("NFTMarket")

        //Get signer information
        const accounts = await hre.ethers.getSigners()
        const signer = accounts[0]
        const marketContract = await new ethers.Contract(contractAddr, MarketContract.interface, signer)
        let items = await marketContract.fetchMarketItems()
        console.log("Item: ", items.toString())
    })

module.exports = {}
