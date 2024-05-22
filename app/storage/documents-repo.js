const { v4: uuidv4 } = require('uuid')
const { getBlobClient } = require('./blob-service-client')
const config = require('../config/storage')
const { loadDocument } = require('../lib/document-loader')
const { updateMetadata, getMetadata } = require('./metadata-repo')
const { NEW } = require('../constants/document-status')

const blobServiceClient = getBlobClient()

const documentsContainer = blobServiceClient.getContainerClient(config.documentsContainer)

const initialiseContainers = async () => {
  console.log('Initialising containers...')
  await documentsContainer.createIfNotExists()
  console.log('Containers initialised')
}

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

  console.log('Listing blobs')
  for await (const blob of documentsContainer.listBlobsFlat(listOptions)) {
    console.log('Got blob')
    const metadata = await getMetadata('MCU', blob.name)
    console.log('Got metadata')
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

  const metadata = await getMetadata('MCU', id)
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
  const metadata = await getMetadata('MCU', id)

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

  await updateDocumentMetadata(id, {
    status: NEW
  })

  return id
}

const updateDocumentMetadata = async (id, metadata) => {
  const blockBlobClient = documentsContainer.getBlockBlobClient(id)

  if (!await blockBlobClient.exists()) {
    const err = new Error(`The document with ID ${id} does not exist`)

    err.code = 'NotFound'

    throw err
  }

  await updateMetadata('MCU', id, metadata)
}

module.exports = {
  initialiseContainers,
  getDocuments,
  getDocument,
  getDocumentContents,
  getDocumentMetadata,
  saveDocument,
  updateDocumentMetadata
}
