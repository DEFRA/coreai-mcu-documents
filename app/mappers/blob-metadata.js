const blob = {
  fileName: 'file_name',
  uploadedBy: 'uploaded_by',
  documentType: 'document_type',
  source: 'source',
  sourceAddress: 'source_address',
  suggestedCategory: 'suggested_category',
  userCategory: 'user_category',
  targetMinister: 'target_minister'
}

const base = {
  file_name: 'fileName',
  uploaded_by: 'uploadedBy',
  document_type: 'documentType',
  source: 'source',
  source_address: 'sourceAddress',
  suggested_category: 'suggestedCategory',
  user_category: 'userCategory',
  target_minister: 'targetMinister'
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
