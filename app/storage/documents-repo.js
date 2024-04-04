const { v4: uuidv4 } = require('uuid')
const { blobServiceClient } = require('./blob-service-client')
const { mapMetadataToBlob, mapMetadataToBase } = require('../mappers/blob-metadata')
const config = require('../config/storage')
const { loadDocument } = require('../lib/document-loader')

const documentsContainer = blobServiceClient.getContainerClient(config.documentsContainer)

const getDocuments = async (orderBy = 'lastModified ', orderByDirection = 'Desc') => {
  const blobs = []

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
    const metadata = mapMetadataToBase(blob.metadata)

    blob.metadata = metadata

    blobs.push(blob)
  }

  blobs.sort((a, b) => {
    const aValue = new Date(a.properties[orderBy])
    const bValue = new Date(b.properties[orderBy])

    if (orderByDirection === 'Desc') {
      return bValue - aValue
    } else {
      return aValue - bValue
    }
  })

  return blobs
}

const getDocument = async (id) => {
  const blobClient = documentsContainer.getBlobClient(id)

  const documentBuffer = await blobClient.downloadToBuffer()

  return documentBuffer
}

const getDocumentBuffer = async (id) => {
  const blobClient = documentsContainer.getBlockBlobClient(id)

  if (!await blobClient.exists()) {
    const err = new Error(`The document with ID ${id} does not exist`)

    err.code = 'NotFound'

    throw err
  }

  const buffer = await blobClient.downloadToBuffer()
  const properties = await blobClient.getProperties()

  const metadata = mapMetadataToBase(properties.metadata)
  const contentType = properties.contentType

  return {
    buffer,
    metadata,
    contentType
  }
}

const getDocumentContents = async (id) => {
  const document = await getDocumentBuffer(id)
  const contents = await loadDocument(document)

  return contents
}

const getDocumentMetadata = async (id) => {
  const blobClient = documentsContainer.getBlobClient(id)

  const properties = await blobClient.getProperties()
  const metadata = mapMetadataToBase(properties.metadata)

  delete properties.metadata

  return {
    name: id,
    properties,
    metadata
  }
}

const saveDocument = async (buffer, type) => {
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
  getDocumentContents,
  getDocumentMetadata,
  saveDocument,
  updateDocumentMetadata
}
