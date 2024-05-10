const Joi = require('joi')
const statuses = require('../../constants/document-status')

const valid = [
  statuses.NEW,
  statuses.TRIAGING,
  statuses.GENERATING,
  statuses.NOT_STARTED,
  statuses.IN_PROGRESS,
  statuses.COMPLETE
]

const schema = Joi.object({
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
  sentiment: Joi.string().optional(),
  status: Joi.string().valid(...valid).optional()
})

module.exports = schema
