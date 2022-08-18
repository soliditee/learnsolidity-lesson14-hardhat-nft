const { assert, expect } = require("chai")
const { deployments, ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name) ? describe.skip : describe("RandomIpfsNft", testRandomIpfsNft)

function testRandomIpfsNft() {
    let randomNft, vrfCoordinatorV2Mock
    let deployer

    beforeEach(async () => {
        let signers = await ethers.getSigners()
        deployer = signers[0]
        await deployments.fixture("random")
        randomNft = await ethers.getContract("RandomIpfsNft", deployer)
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
    })

    describe("constructor", () => {
        it("Token counter should default to 0", async () => {
            const tokenCounter = await randomNft.getTokenCounter()
            assert.equal(tokenCounter.toString(), "0")
        })
    })

    describe("fulfillRandomWords", () => {
        it("Minted NFT should have the expected dog breed based on the given random word", async () => {
            const tokenCounterBefore = await randomNft.getTokenCounter()

            const requestId = await requestRandomNft(randomNft)

            const expectedArgs = [1 /* Shiba, corresponding to 10 -> 39 */, tokenCounterBefore, deployer.address]
            await expect(vrfCoordinatorV2Mock.fulfillRandomWordsWithOverride(requestId, randomNft.address, [10]))
                .to.emit(randomNft, "NftMinted")
                .withArgs(...expectedArgs)
        })

        it("Token counter should increase by 1 after minting", async () => {
            const tokenCounterBefore = await randomNft.getTokenCounter()

            const requestId = await requestRandomNft(randomNft)
            await vrfCoordinatorV2Mock.fulfillRandomWordsWithOverride(requestId, randomNft.address, [100])

            const tokenCounterAfter = await randomNft.getTokenCounter()
            assert.equal(tokenCounterBefore.add("1").toString(), tokenCounterAfter.toString())
        })
    })
}

async function requestRandomNft(randomNft) {
    const mintFee = await randomNft.getMintFee()
    const txRequestNft = await randomNft.requestNft({ value: mintFee })
    const txReceipt = await txRequestNft.wait(1)
    const requestId = txReceipt.events[1].args.requestId
    return requestId
}
