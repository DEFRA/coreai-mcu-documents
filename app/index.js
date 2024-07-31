require('./insights').setup()
const { initialiseContainers } = require('./storage/repos/documents')
const createServer = require('./server')
const { initialiseTables } = require('./storage/repos/metadata')

const init = async () => {
  const server = await createServer()
  await server.start()

  if (process.env.INIT_STORAGE) {
    await initialiseContainers()
    await initialiseTables()
  }

  console.log('Server running on %s', server.info.uri)
}

init()
