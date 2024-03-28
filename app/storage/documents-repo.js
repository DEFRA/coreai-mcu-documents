const { v4: uuidv4 } = require('uuid')
const { blobServiceClient } = require('./blob-service-client')
const { mapMetadataToBlob } = require('../mappers/blob-metadata')
const config = require('../config/storage')

const getDocuments = async () => {
  const documentsContainer = blobServiceClient.getContainerClient(config.documentsContainer)

  let blobs = []

  const listOptions = {
    includeCopy: false,
    includeDeleted: false,
    includeDeletedWithVersions: false,
    includeLegalHold: false,
    includeMetadata: false,
    includeSnapshots: true,
    includeTags: true,
    includeUncommitedBlobs: false,
    includeVersions: false,
    prefix: ''         
  }

  for await (const blob of documentsContainer.listBlobsFlat(listOptions)) {
    blobs.push(blob)
  }

  return blobs
}

const getDocument = async (id) => {
  const documentsContainer = blobServiceClient.getContainerClient(config.documentsContainer)
  const blobClient = documentsContainer.getBlobClient(id)

  try {
    const documentBuffer = await blobClient.downloadToBuffer()
    return documentBuffer
  } catch (err) {
    throw err
  }
}

const getDocumentMetadata = async (id) => {
  const documentsContainer = blobServiceClient.getContainerClient(config.documentsContainer)
  const blobClient = documentsContainer.getBlobClient(id)

  try {
    const { metadata, contentType } = await blobClient.getProperties()

    return {
      metadata,
      contentType
    }
  } catch (err) {
    throw err
  }
}

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
  getDocuments,
  getDocument,
  getDocumentMetadata,
  saveDocument,
  updateDocumentMetadata
}
