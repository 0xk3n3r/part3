require('dotenv').config()
const PORT = process.env.PORT
const express = require('express')
const app = express()
const repl = require('repl')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const person = require('./models/person')
app.use(cors())

// Custom morgan token to log request body
morgan.token('body', (req) =>
  {if (req.method === 'POST' || req.method === 'PUT')
    {return JSON.stringify(req.body)}
    return ''
  })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.static('build'))

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(requestLogger)
app.use(express.json())

/*
const mongoose = require('mongoose')

const password = 

// DO NOT SAVE YOUR PASSWORD TO GITHUB!!
const url =
  `mongodb+srv://adminer:${password}@cluster0.zffjt2e.mongodb.net/personApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})
*/

let persons = [   ]

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {
      console.log(error)
      response.status(400).send({ error: 'malformatted id' })
    })
})

app.delete('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  }).catch(error => {
    console.error('Error fetching data:', error)
    response.status(404).end()
  })
})

const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => n.id))
    : 0
  return maxId + 1
}

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number missing'
    })
  }

  const nameExists = persons.some(person => person.name === body.name);

  if (nameExists) {
    return response.status(400).json({ 
      error: 'name must be unique'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })

})

app.get('/info', (request, response) => {
  const maxId = persons.length
  response.send(`Phonebook has info for ${maxId} people<br> ${new Date()}`)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})