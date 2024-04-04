const { DOC, PDF, DOCX, TXT } = require('../../constants/document-types')
const loadDocx = require('./docx')
const loadPdf = require('./pdf')
const loadText = require('./txt')

const loaders = {
  [DOCX]: loadDocx,
  [DOC]: loadDocx,
  [PDF]: loadPdf,
  [TXT]: loadText
}

const loadDocument = async (document) => {
  const blobMetadata = document.metadata

  const loader = loaders[document.contentType]

  if (!loader) {
    throw new Error(`Unsupported document type: ${document.contentType}`)
  }

  const docs = await loader(document)

  const docsWithMetadata = docs.map(doc => ({
    ...doc,
    metadata: {
      ...doc.metadata,
      blobMetadata: {
        ...blobMetadata,
        contentType: document.contentType
      }
    }
  }))

  let contents = ''
  for (const doc of docsWithMetadata) {
    contents += doc.pageContent + '\r\n\r\n'
  }

  return (contents + ' ').trim()
}

module.exports = {
  loadDocument
}
