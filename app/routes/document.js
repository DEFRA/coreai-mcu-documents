const Joi = require('joi')

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
    console.log('Document POST endpoint hit')

    const { payload } = request
    console.log('payload', payload)
    return payload
    // return h.response('ok').code(200)
  }
},
{
  method: 'PUT',
  path: '/document/{id}',
  options: {
    tags: ['api', 'document'],
  },
  handler: (request, h) => {
    console.log(`Document PUT endpoint hit with id ${request.params.id}`)
    return h.response(`${request.params.id}`).code(200)
  }
}]
