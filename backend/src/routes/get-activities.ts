import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from '../lib/dayjs'
import { ClientError } from "../errors/client-error";


export async function getActivity(app: FastifyInstance) { // aqui eu crio uma função que recebe um app do tipo FastifyInstance
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/activities', // aqui eu defino o tipo de retorno do post que é um zod
        { 
            schema: {
                params: z.object({
                    tripId: z.string().uuid(),
                }),
                
            },
        }, 
    async (request) => { // isso permite que o fastify saiba que o tipo de retorno é um zod


        const { tripId } = request.params

        const trip = await prisma.trip.findUnique({
            where: {
                 id: tripId 
            }, 
            include: {
                activities: {
                    orderBy: {
                        occurs_at: 'asc'
                    }
                }
            },
        })

        if (!trip) {
            throw new ClientError('Trip not found')
        }

        const differenceInDaysBetweenTripStartAndEnd = dayjs(trip.ends_at).diff(dayjs(trip.starts_at), 'days')

        const activities = Array.from({length: differenceInDaysBetweenTripStartAndEnd + 1}).map((_, index) =>  {
            const date = dayjs(trip.starts_at).add(index, 'days')

            return {
                date: date.toDate(),
                activities: trip.activities.filter(activity => {
                    return dayjs(activity.occurs_at).isSame(date, 'day')
                })
            }
        })

        return {
            activities
        }

        

    })
}

// esse codigo serve para criar uma rota que recebe um post com um 
// body que tem destination, start_at e end_at