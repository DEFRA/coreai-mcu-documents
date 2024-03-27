const { v4: uuidv4 } = require('uuid')
const { blobServiceClient } = require('./blob-service-client')
const { mapMetadataToBlob } = require('../mappers/blob-metadata')
const config = require('../config/storage')

const saveDocument = async (buffer, type) => {
  const documentsContainer = blobServiceClient.getContainerClient(config.documentsContainer)

  const id = uuidv4()

  const blockBlobClient = documentsContainer.getBlockBlobClient(id)

  const options = {
    blobHTTPHeaders: {
      blobContentType: type
    }
  }

  await blockBlobClient.uploadData(buffer, options)

  return id
}

const updateDocumentMetadata = async (id, metadata) => {
  const documentsContainer = blobServiceClient.getContainerClient(config.documentsContainer)
  const blockBlobClient = documentsContainer.getBlockBlobClient(id)

  if (!await blockBlobClient.exists()) {
    const err = new Error(`The document with ID ${id} does not exist`)

    err.code = 'NotFound'

    throw err
  }

  const mapped = mapMetadataToBlob(metadata)

  await blockBlobClient.setMetadata(mapped)
}

module.exports = {
  saveDocument,
  updateDocumentMetadata
}
