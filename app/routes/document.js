module.exports = [{
  method: 'POST',
  path: '/document',
  handler: (request, h) => {
    console.log('Document POST endpoint hit')
    return h.response('ok').code(200)
  }
},
{
  method: 'PUT',
  path: '/document/{id}',
  handler: (request, h) => {
    console.log(`Document PUT endpoint hit with id ${request.params.id}`)
    return h.response(`${request.params.id}`).code(200)
  }
}]
