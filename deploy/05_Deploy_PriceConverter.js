let { networkConfig } = require('../helper-hardhat-config')

module.exports = async ({
    getNamedAccounts,
    deployments,
    getChainId
}) => {

    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = await getChainId()
    let ethUsdPriceFeedAddress
    let daiUsdPriceFeedAddress
    let eurUsdPriceFeedAddress
    let maticUsdPriceFeedAddress
    if (chainId == 31337) {
        const EthUsdAggregator = await deployments.get('EthUsdAggregator')
        ethUsdPriceFeedAddress = EthUsdAggregator.address
        daiUsdPriceFeedAddress = EthUsdAggregator.address // hack! for mocking
        eurUsdPriceFeedAddress = EthUsdAggregator.address // hack! for mocking

    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]['ethUsdPriceFeed']
        daiUsdPriceFeedAddress = networkConfig[chainId]['daiUsdPriceFeed']
        eurUsdPriceFeedAddress = networkConfig[chainId]['eurUsdPriceFeed']
        if (chainId == 80001) {
            maticUsdPriceFeedAddress = networkConfig[chainId]['maticUsdPriceFeed']
            eurUsdPriceFeedAddress = maticUsdPriceFeedAddress // hack! to get responses
        }
    }
    // Price Feed Address, values can be obtained at https://docs.chain.link/docs/reference-contracts
    // Default one below is ETH/USD contract on Kovan
    log("----------------------------------------------------")
    const priceConverter = await deploy('PriceConverter', {
        from: deployer,
        args: [],
        log: true
    })
    log("Run Price Converter contract with command:")
    log("npx hardhat read-price-converter --contract " + priceConverter.address + 
                                        " --basepair " + daiUsdPriceFeedAddress +
                                        " --quotepair " + eurUsdPriceFeedAddress +
                                        " --network " + networkConfig[chainId]['name'])
    log("----------------------------------------------------")

}

module.exports.tags = ['all', 'convert', 'main']
