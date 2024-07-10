import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { dayjs } from '../lib/dayjs';
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";


export async function updateTrip(app: FastifyInstance) { // aqui eu crio uma função que recebe um app do tipo FastifyInstance
    app.withTypeProvider<ZodTypeProvider>().put('/trips/:tripId', // aqui eu defino o tipo de retorno do post que é um zod
        {
            schema: {
                params: z.object({
                    tripId: z.string().uuid(),
                }),
                body: z.object({ // aqui eu defino o schema do body
                    destination: z.string().min(4), // aqui eu defino que o campo destination é uma string e tem que ter no minimo 4 caracteres
                    starts_at: z.coerce.date(),
                    ends_at: z.coerce.date(), // zod não tem um tipo para data, então usamos o coerce para converter para data
                })
            },
        }, 
    async (request) => { // isso permite que o fastify saiba que o tipo de retorno é um zod
        const { tripId } = request.params
        const { destination, starts_at, ends_at } = request.body;

        const trip = await prisma.trip.findUnique({
            where: {
                 id: tripId 
            }
        })

        if (!trip) {
            throw new ClientError('Trip not found')
        }

        if (dayjs(starts_at).isBefore(new Date())) { //se a data de inicio for antes de hoje
            throw new ClientError('Invalid start date')
        }

        if(dayjs(ends_at).isBefore(starts_at)) { // se a data de fim for antes da data de inicio
            throw new ClientError('Invalid end date')
        }

        await prisma.trip.update({
            where: {
                id: tripId
            },
            data: {
                destination,
                starts_at,
                ends_at
            },
        })

        return {
            trip_id: trip.id,
        }
    })
}

// esse codigo serve para criar uma rota que recebe um post com um 
// body que tem destination, start_at e end_at