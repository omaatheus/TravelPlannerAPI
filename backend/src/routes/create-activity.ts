import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from '../lib/dayjs'
import { ClientError } from "../errors/client-error";


export async function createActivity(app: FastifyInstance) { // aqui eu crio uma função que recebe um app do tipo FastifyInstance
    app.withTypeProvider<ZodTypeProvider>().post('/trips/:tripId/activities', // aqui eu defino o tipo de retorno do post que é um zod
        { 
            schema: {
                params: z.object({
                    tripId: z.string().uuid(),
                }),
                body: z.object({ // aqui eu defino o schema do body
                    title: z.string().min(4), // aqui eu defino que o campo destination é uma string e tem que ter no minimo 4 caracteres
                    occurs_at: z.coerce.date(),
                })
            },
        }, 
    async (request) => { // isso permite que o fastify saiba que o tipo de retorno é um zod
        const { title, occurs_at } = request.body;

        const { tripId } = request.params

        const trip = await prisma.trip.findUnique({
            where: {
                 id: tripId 
            }
        })

        if (!trip) {
            throw new ClientError('Trip not found')
        }

        if (dayjs(occurs_at).isBefore(trip.created_at)) {
            throw new ClientError('Invalid activity date')
        }

        if (dayjs(occurs_at).isAfter(trip.ends_at)) {
            throw new ClientError('Invalid activity date')
        }

        const activity = await prisma.activity.create({
            data: {
                title,
                occurs_at,
                trip_id: tripId
            }
        })


        return {
            activityId: activity.id,
        }

        

    })
}

// esse codigo serve para criar uma rota que recebe um post com um 
// body que tem destination, start_at e end_at