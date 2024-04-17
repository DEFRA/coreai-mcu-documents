const { getTableClient } = require('./table-service-client')
const tableConfig = require('../config/storage')
const { mapMetadataToBlob, mapMetadataToBase } = require('../mappers/blob-metadata')

const tableClient = getTableClient(tableConfig.metadataTable)

const initialiseTables = async () => {
  await tableClient.createTable()
}

const enrichEntity = (project, docId, metadata) => {
  return {
    partitionKey: project.toUpperCase(),
    rowKey: docId,
    ...metadata
  }
}

const updateMetadata = async (project, docId, metadata) => {
  const existing = await getMetadata(project, docId)
  
  const update = {
    ...existing,
    ...metadata
  }

  const mapped = mapMetadataToBlob(update)
  const enriched = enrichEntity(project, docId, mapped)

  await tableClient.upsertEntity(enriched, 'Replace')
}

const getMetadata = async (project, docId) => {
  let metadata

  try {
    metadata = await tableClient.getEntity(project, docId)
  } catch (err) {
    if (err.statusCode === 404) {
      return {}
    }

    throw err
  }

  return mapMetadataToBase(metadata)
}

module.exports = {
  initialiseTables,
  updateMetadata,
  getMetadata
}
