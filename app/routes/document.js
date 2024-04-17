const Joi = require('joi')
const { processPayloadDocument } = require('../lib/document')
const {
  getDocuments,
  getDocument,
  getDocumentContents,
  getDocumentMetadata,
  saveDocument,
  updateDocumentMetadata
} = require('../storage/documents-repo')

module.exports = [{
  method: 'GET',
  path: '/documents',
  options: {
    tags: ['api', 'documents'],
    validate: {
      query: Joi.object({
        orderBy: Joi.string().valid('lastModified', 'createdOn').default('lastModified'),
        orderByDirection: Joi.string().valid('Asc', 'Desc').default('Desc')
      })
    },
  },
  handler: async (request, h) => {
    const { orderBy, orderByDirection } = request.query
    const documents = await getDocuments(orderBy, orderByDirection)
    return h.response(documents).code(201)
  }
},
{
  method: 'GET',
  path: '/documents/{id}',
  options: {
    tags: ['api', 'documents'],
    validate: {
      params: Joi.object({
        id: Joi.string().uuid().required()
      })
    }
  },
  handler: async (request, h) => {
    const document = await getDocument(
      request.params.id
    )

    return h.response(document).code(201)
  }
},
{
  method: 'GET',
  path: '/documents/{id}/contents',
  options: {
    tags: ['api', 'documents'],
    validate: {
      params: Joi.object({
        id: Joi.string().uuid().required()
      })
    }
  },
  handler: async (request, h) => {
    const documentContents = await getDocumentContents(
      request.params.id
    )

    return h.response(documentContents).code(201)
  }
},
{
  method: 'GET',
  path: '/documents/{id}/metadata',
  options: {
    tags: ['api', 'documents'],
    validate: {
      params: Joi.object({
        id: Joi.string().uuid().required()
      })
    }
  },
  handler: async (request, h) => {
    const documentMetadata = await getDocumentMetadata(
      request.params.id
    )

    return h.response(documentMetadata).code(201)
  }
},
{
  method: 'POST',
  path: '/documents',
  options: {
    tags: ['api', 'documents'],
    payload: {
      maxBytes: (50 * 1024 * 1024) + 250,
      timeout: false,
      output: 'stream',
      parse: false,
      allow: [
        'application/msword',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ]
    }
  },
  handler: async (request, h) => {
    const document = await processPayloadDocument(request.payload)
    const id = await saveDocument(
      document,
      request.headers['content-type']
    )

    return h.response({ id }).code(201)
  }
},
{
  method: 'PUT',
  path: '/documents/{id}',
  options: {
    tags: ['api', 'documents'],
    validate: {
      payload: Joi.object({
        fileName: Joi.string().optional(),
        uploadedBy: Joi.string().optional(),
        documentType: Joi.string().optional(),
        source: Joi.string().optional(),
        sourceAddress: Joi.string().optional(),
        userCategory: Joi.string().optional(),
        targetMinister: Joi.string().optional(),
        suggestedCategory: Joi.string().optional(),
        author: Joi.string().optional(),
        summary: Joi.string().optional(),
        keyPoints: Joi.array().items(Joi.string()).optional(),
        keyFacts: Joi.array().items(Joi.string()).optional(),
        sentiment: Joi.string().optional()
      })
    }
  },
  handler: async (request, h) => {
    try {
      await updateDocumentMetadata(
        request.params.id,
        request.payload
      )
    } catch (err) {
      if (err.code === 'NotFound') {
        return h.response().code(404).takeover()
      }

      throw err
    }

    return h.response().code(200)
  }
}]
