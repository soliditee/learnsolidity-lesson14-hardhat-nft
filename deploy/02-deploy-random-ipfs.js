const { network, ethers } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadToPinata")

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("5")
const RANDOM_IPFS_NFT_MINT_FEE = ethers.utils.parseEther("0.005")
const IMAGES_PATH = "./images/randomnft"
const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "Cuteness",
            value: 100,
        },
    ],
}

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let tokenUris = [
        "ipfs://QmQ4jPJnkQGrgnfsnD8j1TFdCKyWjah6p127MZF8872Fwz",
        "ipfs://QmbKHsFX6K6EYc4JJYMLxHKN4y9E2jvSi8gebp3eLk4jJW",
        "ipfs://QmZutvcjbesfNDtuwcSKZY9hTxxpLZo99eNyEVEHHB2oCP",
    ]
    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris()
    }

    let vrfCoordinatorV2Address, subscriptionId
    let vrfCoordinatorV2Mock

    if (developmentChains.includes(network.name)) {
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        const txResponse = await vrfCoordinatorV2Mock.createSubscription()
        const txReceipt = await txResponse.wait(1)
        subscriptionId = txReceipt.events[0].args.subId
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }

    const gasLane = networkConfig[chainId]["gasLane"]
    const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]
    const args = [vrfCoordinatorV2Address, gasLane, subscriptionId, callbackGasLimit, tokenUris, RANDOM_IPFS_NFT_MINT_FEE]

    const randomIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args: args,
        log: true,
        // @ts-ignore
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log(`Start verifying contract deployed at ${randomIpfsNft.address} ...`)
        await verify(randomIpfsNft.address, args)

        // Add VRF consumer for testnet
        const vrfCoodinator = await ethers.getContractAt("VRFCoordinatorV2Interface", vrfCoordinatorV2Address, deployer)
        await vrfCoodinator.addConsumer(subscriptionId, randomIpfsNft.address)
    } else {
        // Add VRF consumer for localhost
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId, randomIpfsNft.address)
    }
}

async function handleTokenUris() {
    tokenUris = []

    const imageResponses = await storeImages(IMAGES_PATH)
    for (fileName in imageResponses) {
        let tokenUriMeta = { ...metadataTemplate }
        tokenUriMeta.name = fileName.replace(".png", "")
        tokenUriMeta.description = `This is a ${tokenUriMeta.name} pup!`
        tokenUriMeta.image = `ipfs://${imageResponses[fileName].IpfsHash}`
        console.log(`Uploading JSON ${tokenUriMeta.name} - image = ${tokenUriMeta.image}`)
        const metadataResponse = await storeTokenUriMetadata(tokenUriMeta)
        tokenUris.push(`ipfs://${metadataResponse.IpfsHash}`)
    }

    return tokenUris
}

module.exports.tags = ["all", "random"]
