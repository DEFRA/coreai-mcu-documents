const { Blob } = require('buffer')
const { PDFLoader } = require('langchain/document_loaders/fs/pdf')

const load = async (document) => {
  const blob = new Blob([document.buffer])

  const loader = new PDFLoader(blob)

  return loader.load()
}

module.exports = load
