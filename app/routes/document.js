const Joi = require('joi')
const { processPayloadDocument } = require("../lib/document")
const { saveDocument, updateDocumentMetadata } = require("../storage/document-repo")


module.exports = [{
  method: 'POST',
  path: '/document',
  options: {
    tags: ['api', 'document'],
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
      ],
    },
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
  path: '/document/{id}',
  options: {
    tags: ['api', 'document'],
      validate: {
        payload: Joi.object({
        fileName: Joi.string().required(),
        uploadedBy: Joi.string().required(),
        documentType: Joi.string().required(),
        source: Joi.string().required(),
        sourceAddress: Joi.string().required(),
        suggestedCategory: Joi.string().required(),
        userCategory: Joi.string().required(),
        targetMinister: Joi.string().required(),
      })
    },
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
