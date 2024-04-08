require('./insights').setup()
const { initialiseContainers } = require('./storage/documents-repo')
const createServer = require('./server')

const init = async () => {
  const server = await createServer()
  await server.start()
  await initialiseContainers()
  console.log('Server running on %s', server.info.uri)
}

init()
