const { network, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts()

    // Mint BasicNFT
    const basicNft = await ethers.getContract("BasicNft", deployer)
    const txBasicMint = await basicNft.mintNft()
    await txBasicMint.wait(1)
    console.log(`Basic NFT index 0 tokenURI: ${await basicNft.tokenURI(0)}`)

    // Mint Random IPFS NFT
    const randomNft = await ethers.getContract("RandomIpfsNft", deployer)
    const mintFee = await randomNft.getMintFee()
    const txRandomMintRequest = await randomNft.requestNft({ value: mintFee })
    const txRandomMintReceipt = await txRandomMintRequest.wait(1)
    const requestId = txRandomMintReceipt.events[1].args.requestId
    // Wait for VRFCoordinator callback
    await new Promise(async (resolve, reject) => {
        setTimeout(() => reject("Missing NftMinted event"), 5 * 60 * 1000)
        randomNft.once("NftMinted", async () => {
            resolve()
        })
        if (developmentChains.includes(network.name)) {
            // If localhost, trigger VRFCoordinatorMock
            const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
            await vrfCoordinatorV2Mock.fulfillRandomWordsWithOverride(requestId, randomNft.address, [10])
        }
    })

    console.log(`Random NFT index 0 tokenURI: ${await randomNft.tokenURI(0)}`)

    // Mint Dynamic SVG NFT
    const dynamicNft = await ethers.getContract("DynamicSvgNft", deployer)
    const highValue = ethers.utils.parseEther("2000")
    const txDynamicMint = await dynamicNft.mintNft(highValue)
    await txDynamicMint.wait(1)
    console.log(`Dynamic NFT index 0 tokenURI: ${await dynamicNft.tokenURI(0)}`)
}
module.exports.tags = ["all", "mint"]
