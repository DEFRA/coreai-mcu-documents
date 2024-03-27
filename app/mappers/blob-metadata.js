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

const map = (metadata, lookup) => {
  const obj = {}

  for (const key in metadata) {
    obj[lookup[key]] = metadata[key]
  }

  return obj
}

const mapMetadataToBlob = (metadata) => map(metadata, blob)

module.exports = {
  mapMetadataToBlob
}
