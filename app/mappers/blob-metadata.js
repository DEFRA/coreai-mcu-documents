const blob = {
  fileName: 'file_name',
  uploadedBy: 'uploaded_by',
  documentType: 'document_type',
  source: 'source',
  sourceAddress: 'source_address',
  userCategory: 'user_category',
  targetMinister: 'target_minister',
  suggestedCategory: 'suggested_category',
  author: 'author',
  summary: 'summary',
  keyPoints: 'key_points',
  keyFacts: 'key_facts',
  sentiment: 'sentiment'
}

const base = {
  file_name: 'fileName',
  uploaded_by: 'uploadedBy',
  document_type: 'documentType',
  source: 'source',
  source_address: 'sourceAddress',
  user_category: 'userCategory',
  target_minister: 'targetMinister',
  suggested_category: 'suggestedCategory',
  author: 'author',
  summary: 'summary',
  key_points: 'keyPoints',
  key_facts: 'keyFacts',
  sentiment: 'sentiment'
}

const map = (metadata, lookup) => {
  const obj = {}

  for (const key in metadata) {
    obj[lookup[key]] = metadata[key]
  }

  return obj
}

const mapMetadataToBlob = (metadata) => map(metadata, blob)
const mapMetadataToBase = (metadata) => map(metadata, base)

module.exports = {
  mapMetadataToBlob,
  mapMetadataToBase
}
