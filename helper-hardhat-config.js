const { ethers } = require("hardhat")

const networkConfig = {
    4: {
        name: "rinkeby",
        vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        subscriptionId: "8856",
        callbackGasLimit: "200000",
        interval: "30",
    },
    420: {
        name: "goerli",
        vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        subscriptionId: "179",
        callbackGasLimit: "200000",
        interval: "30",
    },
    31337: {
        entranceFee: ethers.utils.parseEther("0.001"),
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        callbackGasLimit: "200000",
        interval: "10",
    },
}

const developmentChains = ["hardhat", "localhost"]
const MOCK_DECIMALS = 8
const MOCK_ANSWER = 1200 * 10 ** MOCK_DECIMALS

module.exports = {
    networkConfig,
    developmentChains,
    MOCK_DECIMALS,
    MOCK_ANSWER,
}
