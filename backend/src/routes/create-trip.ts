import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import dayjs from "dayjs";

import { z } from "zod"; 
import { prisma } from "../lib/prisma";

export async function createTrip(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post('/trips', 
        {
            schema: {
                body: z.object({
                    destination: z.string().min(4),
                    starts_at: z.coerce.date(),
                    ends_at: z.coerce.date(), // zod não tem um tipo para data, então usamos o coerce para converter para data
                    owner_name: z.string(),
                    owner_email: z.string().email(),
                })
         },
        }, 
    async (request) => { // isso permite que o fastify saiba que o tipo de retorno é um zod
        const { destination, starts_at, ends_at, owner_name, owner_email } = request.body;

        if (dayjs(starts_at).isBefore(new Date())) { //se a data de inicio for antes de hoje
            throw new Error('Invalid start date')
        }

        if(dayjs(ends_at).isBefore(starts_at)) { // se a data de fim for antes da data de inicio
            throw new Error('Invalid end date')
        }

        const trip = await prisma.trip.create({
            data: {
                destination,
                starts_at,
                ends_at,
                 
                
            }
        })

        return {
            tripId: trip.id,
        }
    })
}

// esse codigo serve para criar uma rota que recebe um post com um 
// body que tem destination, start_at e end_at