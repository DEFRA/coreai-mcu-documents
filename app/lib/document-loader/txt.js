const { Blob } = require('buffer')
const { TextLoader } = require('langchain/document_loaders/fs/text')

const load = async (document) => {
  const blob = new Blob([document.buffer])

  const loader = new TextLoader(blob)

  return loader.load()
}

module.exports = load
