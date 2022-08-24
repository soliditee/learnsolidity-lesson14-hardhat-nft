const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const fs = require("fs")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        ethUsdPriceFeedAddress = (await ethers.getContract("MockV3Aggregator")).address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const lowSvg = await fs.readFileSync("./images/dynamicnft/frown.svg", { encoding: "utf8" })
    const highSvg = await fs.readFileSync("./images/dynamicnft/happy.svg", { encoding: "utf8" })

    const args = [ethUsdPriceFeedAddress, lowSvg, highSvg]
    const dynamicNft = await deploy("DynamicSvgNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Start verifying")
        await verify(dynamicNft.address, args)
    }
}

module.exports.tags = ["all", "dynamic"]
