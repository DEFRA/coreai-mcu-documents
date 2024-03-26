const { saveDocument } = require('../../../app/storage/document-repo')
const { v4: uuidv4 } = require('uuid')

// Mock dependencies
jest.mock('./blob-service-client')
const { blobServiceClient } = require('./blob-service-client')

// Mock processPayloadDocument function
jest.mock('../lib/document')
const { processPayloadDocument } = require('../lib/document')

describe('saveDocument', () => {
  test('should save a document with allowed content types', async () => {
    uuidv4.mockReturnValue('mocked-uuid')

    // Mock processPayloadDocument to return a buffer
    const buffer = Buffer.from('mocked-buffer')
    processPayloadDocument.mockResolvedValue(buffer)

    // Mock documentsContainer and blockBlobClient
    const uploadDataMock = jest.fn()
    const blockBlobClientMock = {
      uploadData: uploadDataMock
    }
    const documentsContainerMock = {
      getBlockBlobClient: jest.fn().mockReturnValue(blockBlobClientMock)
    }
    blobServiceClient.getContainerClient.mockReturnValue(documentsContainerMock)

    const request = {
      payload: {},
      headers: {
        'content-type': 'application/pdf'
      }
    }

    await saveDocument(request.payload, request.headers['content-type'])

    expect(uuidv4).toHaveBeenCalledTimes(1)
    expect(processPayloadDocument).toHaveBeenCalledWith(request.payload)
    expect(blobServiceClient.getContainerClient).toHaveBeenCalledWith('yourContainerName')
    expect(documentsContainerMock.getBlockBlobClient).toHaveBeenCalledWith('mocked-uuid')
    expect(uploadDataMock).toHaveBeenCalledWith(buffer, { blobHTTPHeaders: { blobContentType: 'application/pdf' } })
  })

  test('should throw error for invalid content type', async () => {
    const request = {
      payload: {},
      headers: {
        'content-type': 'image/jpeg'
      }
    }

    await expect(saveDocument(request.payload, request.headers['content-type'])).rejects.toThrow('Invalid content type')
  })
})
