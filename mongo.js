const mongoose = require('mongoose')
if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const url =
  `mongodb+srv://adminer:${password}@cluster0.zffjt2e.mongodb.net/personApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

/*
Note.find({}).then(result => {
  result.forEach(note => {
    console.log(note)
  })
  mongoose.connection.close()
})
*/
if (process.argv.length === 3) {
      Person.find({}).then(result => {
        console.log('phonebook:')
        result.forEach(person => {
          console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
      }).catch(error => {
        console.error('Error fetching data:', error)
        mongoose.connection.close()
      })
    } else if (process.argv.length === 5) {
      const name = process.argv[3]
      const number = process.argv[4]
      const person = new Person({ name, number })

      person.save()
        .then(() => {
          console.log(`Added ${name} number ${number} to the phonebook`)
        })
        .catch(error => {
          console.error('Error saving person:', error)
        })
        .finally(() => {
          mongoose.connection.close()
        })
    } else {
      console.log('Invalid arguments')
      mongoose.connection.close()
    }

