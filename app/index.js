require('./insights').setup()
const config = require('../config/storage')

const createServer = require('./server')

const initialiseContainers = async () => {
  const documentsContainer = blobServiceClient.getContainerClient(config.documentsContainer)
  console.log('Initialising containers...')
  await documentsContainer.createIfNotExists()
  console.log('Containers initialised')
}

const init = async () => {
  const server = await createServer()
  await server.start()
  await initialiseContainers()
  console.log('Server running on %s', server.info.uri)
}

init()
