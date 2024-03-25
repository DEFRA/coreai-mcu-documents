const Joi = require('joi')
const { processPayloadDocument } = require("../lib/document")
const { saveDocument, updateDocumenteMetadata } = require("../storage/document-repo")


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
  path: '/document/{uuid}',
  options: {
    tags: ['api', 'document'],
  },
  handler: (request, h) => {

     /*
      - To do:

        - get / set file meta data using blob metadata
        
          Fields:
            FileName
            UploadedBy
            DocumentType
            Source
            SourceAddress
            SuggestedCategory
            UserCategory
            TargetMinster
      */

    console.log(`Document PUT endpoint hit with uuid ${request.params.uuid}`)
    return h.response(`${request.params.uuid}`).code(200)
  }
}]
