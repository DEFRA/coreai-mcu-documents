const processPayloadDocument = async (payload) => {
    // const stream = new Readable()
    // stream.push(fileBuffer)
    // stream.push(null)

    const chunks = []
    
    for await (const chunk of payload) 
    {
      chunks.push(chunk)
    }

    return Buffer.concat(chunks)
  }
  
  module.exports = {
    processPayloadDocument
  }