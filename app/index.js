require('./insights').setup()
const { initialiseContainers } = require('./storage/documents-repo')
const createServer = require('./server')
const { initialiseTables } = require('./storage/metadata-repo')

const init = async () => {
  const server = await createServer()
  await server.start()
  await initialiseContainers()
  await initialiseTables()
  console.log('Server running on %s', server.info.uri)
}

init()
