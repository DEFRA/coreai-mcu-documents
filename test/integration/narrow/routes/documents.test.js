const { updateDocumentMetadata, saveDocument } = require('../../../../app/storage/documents-repo')
const { processPayloadDocument } = require('../../../../app/lib/document')
const createServer = require('../../../../app/server')
const { v4: uuidv4 } = require('uuid')

jest.mock('../../../../app/storage/documents-repo', () => ({
  updateDocumentMetadata: jest.fn(),
  saveDocument: jest.fn()
}))

jest.mock('../../../../app/lib/document', () => ({
  processPayloadDocument: jest.fn()
}))

describe('/documents', () => {
  let server

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    await server.stop()
  })

  describe('POST /documents', () => {
    test('responds with 201 and saves document when a valid PDF is provided', async () => {
      const validPDFBuffer = Buffer.from('PDF CONTENTS')
      const expectedId = uuidv4()

      processPayloadDocument.mockResolvedValue(validPDFBuffer)
      saveDocument.mockResolvedValue(expectedId)

      const response = await server.inject({
        method: 'POST',
        url: '/documents',
        payload: validPDFBuffer,
        headers: {
          'content-type': 'application/pdf'
        }
      })

      expect(response.statusCode).toBe(201)
      expect(response.result).toEqual({ id: expectedId })
      expect(saveDocument).toHaveBeenCalledWith(validPDFBuffer, 'application/pdf')
    })

    test('responds with 415 - Unsupported Media Type when an invalid file type is provided', async () => {
      processPayloadDocument.mockResolvedValue()
      saveDocument.mockResolvedValue()

      const response = await server.inject({
        method: 'POST',
        url: '/documents',
        payload: {},
        headers: {
          'content-type': 'image/x-png'
        }
      })

      expect(response.statusCode).toBe(415)
    })
  })

  describe('PUT /documents/{id}', () => {
    let id

    beforeEach(async () => {
      id = uuidv4()
    })

    afterEach(async () => {
      id = null
    })

    test('responds with 200 on successful update', async () => {
      updateDocumentMetadata.mockResolvedValue(200)

      const response = await server.inject({
        method: 'PUT',
        url: `/documents/${id}`,
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

    test('responds with 404 when document not found', async () => {
      updateDocumentMetadata.mockRejectedValue(Object.assign(new Error('Not Found'), { code: 'NotFound' }))

      const response = await server.inject({
        method: 'PUT',
        url: '/documents/invalid-id',
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

      expect(response.statusCode).toBe(404)
    })
  })
})
