const { v4: uuidv4 } = require('uuid')
const { blobServiceClient } = require('./blob-service-client')
const { mapMetadataToBlob } = require('../mappers/blob-metadata')
const config = require('../config/storage')

const getDocuments = async () => {
  const documentsContainer = blobServiceClient.getContainerClient(config.documentsContainer)

  let blobs = []

  for await (const blob of documentsContainer.listBlobsFlat()) {
    blobs.push(blob)
  }

  return blobs
}

// to do
const getDocument = async (id) => {
  const documentsContainer = blobServiceClient.getContainerClient(config.documentsContainer)
  // const document = blobServiceClient.
  return { id: `${id}` }
}

// to do
const getDocumentMetadata = async (id) => {
  // const documentMetaData = blobServiceClient.
  return {
    file_name: 'TestFile.pdf',
    uploaded_by: 'TestUser',
    document_type: 'Report',
    source: 'Email',
    source_address: 'test@example.com',
    suggested_category: 'Finance',
    user_category: 'Internal',
    target_minister: 'Some Minister'
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
