jest.mock('../../../../app/storage/blob-service-client', () => ({
  getBlobClient: jest.fn().mockReturnValue({
    getContainerClient: jest.fn().mockReturnValue({
      getBlockBlobClient: jest.fn().mockReturnValue({
        uploadData: jest.fn().mockResolvedValue(true),
        exists: jest.fn().mockResolvedValue(true),
        setMetadata: jest.fn().mockResolvedValue(true)
      })
    })
  })
}))

jest.mock('../../../../app/storage/table-service-client', () => ({
  getTableClient: jest.fn().mockReturnValue({
    upsertEntity: jest.fn().mockResolvedValue(true)
  })
}))

jest.mock('../../../../app/config/storage', () => ({
  documentsContainer: 'test-documents-container'
}))

describe('documents-repo', () => {
  const { saveDocument } = require('../../../../app/storage/repos/documents')

  const expectedId = 'some-uuid'

  jest.mock('uuid', () => ({
    v4: jest.fn().mockReturnValue(expectedId)
  }))

  test('returns an id (UUID) when a document is saved', async () => {
    const documentBuffer = Buffer.from('Test PDF data')
    const id = await saveDocument(
      documentBuffer,
      'application/pdf'
    )

    expect(id).toBe(expectedId)
  })
})
