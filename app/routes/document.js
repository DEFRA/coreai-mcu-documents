const Joi = require('joi')
const { v4: uuid } = require('uuid')
const { Readable } = require('stream')
const { BlockBlobClient } = require('@azure/storage-blob')

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

    const blobName = uuid()
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
    const blobService = new BlockBlobClient(
      process.env.AZURE_STORAGE_CONNECTION_STRING, 
      process.env.AZURE_STORAGE_CONTAINER_NAME,
      blobName
    )

    const streamLength = fileBuffer.length
  
    blobService.uploadStream(stream, streamLength)
    .then(
        ()=>{
          return h
            .response({ uuid: blobName })
            .code(200)
        }
    ).catch(
        (err)=>{
        if(err) {
            handleError(err);
            return;
        }
    })
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
