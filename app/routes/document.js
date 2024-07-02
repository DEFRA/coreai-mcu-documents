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
const { put } = require('../schema/document')

module.exports = [{
  method: 'GET',
  path: '/documents',
  options: {
    tags: ['api', 'documents'],
    validate: {
      query: Joi.object({
        orderBy: Joi.string().valid('lastModified', 'createdOn').default('lastModified'),
        orderByDirection: Joi.string().valid('Asc', 'Desc').default('Desc'),
        uploadedBy: Joi.string()
      }),
      failAction: (request, h, err) => {
        console.error(err.details)

        return h.response({ errors: err.details.map(e => e.message) }).code(400).takeover()
      }
    }
  },
  handler: async (request, h) => {
    const { orderBy, orderByDirection, uploadedBy } = request.query
    try {
      const documents = await getDocuments(orderBy, orderByDirection, uploadedBy)

      return h.response(documents).code(200)
    } catch (err) {
      console.error(err)

      throw err
    }
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
    try {
      const document = await getDocument(request.params.id)

      return h.response(document).code(200)
    } catch (err) {
      console.error(err)

      throw err
    }
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

    return h.response(documentContents).code(200)
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
    try {
      const documentMetadata = await getDocumentMetadata(
        request.params.id
      )

      return h.response(documentMetadata).code(200)
    } catch (err) {
      console.error(err)

      throw err
    }
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
      payload: put
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

      console.error(err)

      throw err
    }

    return h.response().code(200)
  }
}]
