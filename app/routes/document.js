const Joi = require('joi')
const { v4: uuid } = require('uuid')
const { Readable } = require('stream')

module.exports = [{
  method: 'POST',
  path: '/document',
  options: {
    tags: ['api', 'document'],
    payload: {
      maxBytes: (50 * 1024 * 1024) + 250,
      multipart: true,
      timeout: false,
      output: 'stream',
      parse: true,
      allow: 'multipart/form-data'
    },
    validate: {
      payload: Joi.object({
        document: Joi.object({
          hapi: Joi.object({
            filename: Joi.string().regex(/^(.+)\.(doc|docx|pdf|txt)$/).message('Incorrect document file type. Must be .doc, .docx, .pdf or .txt .')
          }).required().unknown(true)
        }).required().unknown(true)
      }).required().unknown(true),
      failAction: (request, h, err) => {
        console.log(err)
        return h.response('failed').code(400)
      }
    }
  },
  handler: async (request, h) => {
    const fileBuffer = request.payload.document._data
    // console.log('fileBuffer', fileBuffer)

    const filename = uuid()
    // console.log('filename', filename)

    const stream = new Readable()
    stream.push(fileBuffer)
    stream.push(null)

    console.log('stream', stream)

    /*
      - To do:

        - upload to Azure blob storage
        - return fileName / UUID for use in document/uuid PUT endpoint
    */

    return h.response({ uuid: filename }).code(200)
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
