const { assert, expect } = require("chai")
const { deployments, ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name) ? describe.skip : describe("BasicNft", testBasicNft)

function testBasicNft() {
    let basicNft
    let deployer

    beforeEach(async () => {
        let signers = await ethers.getSigners()
        deployer = signers[0]
        await deployments.fixture("basic")
        basicNft = await ethers.getContract("BasicNft", deployer)
    })

    describe("constructor", () => {
        it("Token counter should default to 0", async () => {
            const tokenCounter = await basicNft.getTokenCounter()
            assert.equal(tokenCounter.toString(), "0")
        })
    })

    describe("mintNft", () => {
        it("Token counter should increase by 1 after minting", async () => {
            const tokenCounterBefore = await basicNft.getTokenCounter()
            await basicNft.mintNft()
            const tokenCounterAfter = await basicNft.getTokenCounter()
            assert.equal(tokenCounterBefore.add("1").toString(), tokenCounterAfter.toString())
        })
    })
}
