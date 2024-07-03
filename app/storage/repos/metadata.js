const { getTableClient } = require('../table-service-client')
const tableConfig = require('../../config/storage')
const { mapMetadataToBlob, mapMetadataToBase } = require('../../mappers/blob-metadata')

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
  const mapped = {
    ...mapMetadataToBlob(metadata),
    key_points: JSON.stringify(metadata.keyPoints),
    key_facts: JSON.stringify(metadata.keyFacts)
  }

  const enriched = enrichEntity(project, docId, mapped)

  await tableClient.upsertEntity(enriched, 'Merge')
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

  const mapped = mapMetadataToBase(metadata)

  if (metadata.key_points) {
    mapped.keyPoints = JSON.parse(metadata.key_points)
  }

  if (metadata.key_facts) {
    mapped.keyFacts = JSON.parse(metadata.key_facts)
  }

  return mapped
}

module.exports = {
  initialiseTables,
  updateMetadata,
  getMetadata
}
