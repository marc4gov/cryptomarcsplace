task("load-market-item", "Loads an NFT into the marketplace")
.addParam("contract", "The address of the Market contract ")
.addParam("nftaddress", "The NFT token contract address")
.addParam("tokenid", "The token id within the NFT token contract")
    
    .setAction(async taskArgs => {

        const contractAddr = taskArgs.contract
        const nftaddress = taskArgs.nftaddress
        const tokenid = taskArgs.tokenid
        const decimals = 8
        
        const networkId = network.name

        const MarketContract = await ethers.getContractFactory("NFTMarket")

        //Get signer information
        const accounts = await hre.ethers.getSigners()
        const signer = accounts[0]
        const marketContract = await new ethers.Contract(contractAddr, MarketContract.interface, signer)
        await marketContract.createMarketItem(nftaddress, tokenid, 1).then((data) => {
            console.log('Event: ', data)
        })
    })

module.exports = {}
