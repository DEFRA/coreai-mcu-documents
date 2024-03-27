const { updateDocumentMetadata } = require('../../../../app/storage/document-repo')
const createServer = require('../../../../app/server')

jest.mock('../../../../app/storage/document-repo', () => ({
  updateDocumentMetadata: jest.fn()
}))

describe('PUT /document/{id}', () => {
  let server
  let id

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
    id = '7f1dd7ac-96ed-4746-a406-b32508ad8123'
  })

  afterEach(async () => {
    await server.stop()
  })

  test('responds with 200 on successful update', async () => {
    updateDocumentMetadata.mockResolvedValue(200)

    const response = await server.inject({
      method: 'PUT',
      url: `/document/${id}`,
      payload: {
        fileName: 'TestFile.pdf',
        uploadedBy: 'TestUser',
        documentType: 'Report',
        source: 'Email',
        sourceAddress: 'test@example.com',
        suggestedCategory: 'Finance',
        userCategory: 'Internal',
        targetMinister: 'Some Minister'
      }
    })

    expect(response.statusCode).toBe(200)
  })

  // test('responds with 404 when document not found', async () => {
  //   updateDocumentMetadata.mockRejectedValue(Object.assign(new Error('Not Found'), { code: 'NotFound' }))

  //   const response = await server.inject({
  //     method: 'PUT',
  //     url: '/document/invalid-id',
  //     payload: {
  //       // your payload here
  //     }
  //   })

  //   expect(response.statusCode).toBe(404)
  // })
})
