const pinataSDK = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")
require("dotenv").config

const pinataApiKey = process.env.PINATA_API_KEY
const pinataApiSecret = process.env.PINATA_API_SECRET
const pinata = pinataSDK(pinataApiKey, pinataApiSecret)

async function storeImages(imagesFilePath) {
    const fullImagesPath = path.resolve(imagesFilePath)
    const files = fs.readdirSync(fullImagesPath)
    let responses = {}
    for (fileIndex in files) {
        const fileName = files[fileIndex]
        if (!fileName.endsWith(".png")) {
            continue
        }
        try {
            console.log(`Uploading file ${files[fileIndex]} to Pinata`)
            const readableStream = fs.createReadStream(`${fullImagesPath}/${fileName}`)
            const response = await pinata.pinFileToIPFS(readableStream)
            responses[fileName] = response
        } catch (error) {
            console.log(error)
        }
    }
    return responses
}

async function storeTokenUriMetadata(metadata) {
    try {
        const response = await pinata.pinJSONToIPFS(metadata)
        return response
    } catch (error) {
        console.log(error)
    }
    return null
}

module.exports = { storeImages, storeTokenUriMetadata }
