const express = require('express');
const app = express();
app.use(express.static('dist'))
const cors = require('cors');
app.use(cors());
const morgan = require('morgan')
app.use(express.json());
morgan.token('bodycontent', (req, res) => JSON.stringify(req.body))
//app.use(morgan('tiny'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :bodycontent',
    {skip: (req) => req.method !== 'POST'}
))
app.use(morgan('tiny',
    {skip: (req) => req.method === 'POST'}
))



let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523"
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345"
    },
    {
        id: 4,
        name: "Mary Poppendieck",
        number: "39-23-6423122"
    }
]


app.get('/', (request, response) => {
	response.send('<h1>Welcome to the Phonebook!</>')
})

app.get('/api/persons', (request, response) => {
	response.json(persons)
    console.log("Personen-Array im GET: ", persons);
})

app.get('/api/persons/:id', (request, response) => {
	const id = request.params.id
	const person = persons.find(person => String(person.id) === id)

	if(person){
		response.json(person)
	}
	else{
		response.status(404).end()
	}
})

app.get('/api/info', (request, response) => {
    const jetzt = new Date();
    const text = `Phonebook has info for ${persons.length} people<br><br>
   ${new Date()}`;
	response.send(text);
})

app.delete('/api/persons/:id', (request, response) => {
	const id = request.params.id
    console.log("ID: ", id)
	persons = persons.filter(person => String(person.id) !== id)

	response.status(204).end()

    console.log("Personen-Array nach DELETE: ", persons);
})

const generateId = () => {
    let id;
    do{
        id = Math.floor(Math.random()*100000)
    } while (persons.find(p => p.id === String(id)))
    return id;
}

app.post('/api/persons/', (request, response) => {
    const body = request.body;
    console.log("Body-Content: ", body)

    if(!body.name || !body.number){
		return !body.name && !body.number ? response.status(400).json({error: 'name and number missing!'}) : (!body.name ? response.status(400).json({error: 'name is missing!'})
        : response.status(400).json({error: 'number is missing!'}))
	}

    if(persons.some(p => p.name.toLowerCase() === body.name.toLowerCase())){
        return response.status(400).json({error: 'name already exists!'})
    }
	
	const person = {
        id: generateId(),
		name: body.name || null,
		number: body.number || null
	}
	persons = persons.concat(person)
	response.json(person)

    console.log("Personen-Array im POST: ", persons);

})

app.put('/api/persons/:id', (request, response) => {
    //console.log(typeof request.body.id);
    const person = {
        id: Number(request.params.id),
        name: request.body.name,
        number: request.body.number}
        
    console.log("Body-Content", request.body);
    console.log("Person im Server: ", person);
    persons = persons.map(p => p.id === person.id ? person : p);
    response.json(person);
    console.log("Personen-Array im PUT: ", persons);
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)