const personRouter = require('express').Router()
const Person = require('../models/person')
const morgan = require('morgan')
require('dotenv').config()
morgan.token('body', (req) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    return JSON.stringify(req.body)
  }
  return ''
})
personRouter.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
personRouter.get('/', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

personRouter.get('/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

personRouter.put('/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

personRouter.delete('/:id', (request, response) => {
  Person.findByIdAndDelete(request.params.id)
  .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => n.id))
    : 0
  return maxId + 1
}

personRouter.post('/', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number missing'
    })
  }

  Person.exists({ name: body.name })
    .then(exists => {
      if (exists) {
        return response.status(400).json({ 
          error: 'name must be unique' 
        });
      }

      const person = new Person({
        name: body.name,
        number: body.number,
      });

      return person.save();
    })
    .then(savedPerson => {
      response.json(savedPerson);
    })
    .catch(error => next(error))
})

personRouter.get('/info', (request, response) => {
  //const maxId = persons.length
  //response.send(`Phonebook has info for ${maxId} people<br> ${new Date()}`)
  Person.countDocuments({})
    .then(count => {
      response.send(`Phonebook has info for ${count} people<br> ${new Date()}`)
    })
})

module.exports = personRouter