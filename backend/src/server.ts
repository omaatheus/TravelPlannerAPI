import fastify from "fastify";
import { prisma } from "./lib/prisma";
import { createTrip } from "./routes/create-trip";
import { confirmTrip } from "./routes/confirm-trip";
import { confirmParticipant } from "./routes/confirm-participant";
import { serializerCompiler, validatorCompiler}  from "fastify-type-provider-zod";
import cors from '@fastify/cors'

const app = fastify()

app.register(cors, { // estou definindo que qualquer origem pode acessar a minha API
    origin: '*',
})

app.setValidatorCompiler(validatorCompiler) // estou definindo o compilador de validação
app.setSerializerCompiler(serializerCompiler) // estou definindo o compilador de serialização

app.register(createTrip) 
app.register(confirmTrip)
app.register(confirmParticipant)

app.listen({ port: 3333 }, () => { 
    console.log('<-------------| 🚀 | Server is running on port 3333 |------------->')
})
