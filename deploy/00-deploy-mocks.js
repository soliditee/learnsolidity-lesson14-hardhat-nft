const { network, ethers } = require("hardhat")
const { developmentChains, MOCK_ANSWER, MOCK_DECIMALS } = require("../helper-hardhat-config")

const BASE_FEE = ethers.utils.parseEther("0.25")
const GAS_PRICE_LINK = 1e9

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    if (developmentChains.includes(network.name)) {
        log(`Local network: ${network.name}! Deploying Mock Contracts`)
        const mockContractCoordinator = await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            args: [BASE_FEE, GAS_PRICE_LINK],
            log: true,
        })
        const mockContractAggregator = await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            args: [MOCK_DECIMALS, MOCK_ANSWER],
            log: true,
        })
        log("Mocks Deployed!")
        log("---------------------------------------------------")
    } else {
        log(`-- Network: ${network.name} -- Skipping Mock Contracts`)
    }
}

module.exports.tags = ["all", "mocks", "random", "dynamic"]
