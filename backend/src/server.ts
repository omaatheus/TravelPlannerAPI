import fastify from "fastify";
import cors from '@fastify/cors'

import { serializerCompiler, validatorCompiler}  from "fastify-type-provider-zod";

import { createTrip } from "./routes/create-trip";
import { confirmTrip } from "./routes/confirm-trip";
import { updateTrip } from "./routes/update-trip";
import { getTripDetails } from "./routes/get-trip-details";

import { confirmParticipant } from "./routes/confirm-participant";
import { getParticipants } from "./routes/get-participan";
import { getParticipant } from "./routes/get-participant";

import { createActivity } from "./routes/create-activity";
import { getActivity } from "./routes/get-activities";

import { createLink } from "./routes/create-link";
import { getLinks } from "./routes/get-links";

import { createInvite } from "./routes/create-invite";

import { errorHandler } from "./error-handler";

import { env } from "./env";

const app = fastify()

app.register(cors, { // estou definindo que qualquer origem pode acessar a minha API
    origin: '*',
})

app.setValidatorCompiler(validatorCompiler) // estou definindo o compilador de validação
app.setSerializerCompiler(serializerCompiler) // estou definindo o compilador de serialização

//-------------------------------------------------------------| Erros |-------------------------------------------------------------//

app.setErrorHandler(errorHandler)

//-------------------------------------------------------------| Rotas |-------------------------------------------------------------//

// Rotas de criação de viagem
app.register(createTrip) 
app.register(confirmTrip)
app.register(updateTrip)
app.register(getTripDetails)

// Rotas de participantes
app.register(confirmParticipant)
app.register(getParticipants)
app.register(getParticipant)

// Rotas de atividades
app.register(createActivity)
app.register(getActivity)

// Rotas de links
app.register(createLink)
app.register(getLinks)

// Rotas de convites
app.register(createInvite)


//-------------------------------------------------------------| Server |-------------------------------------------------------------//

app.listen({ port: env.PORT }, () => { 
    console.log('<-------------| 🚀 | Server is running on port 3333 |------------->')
})
