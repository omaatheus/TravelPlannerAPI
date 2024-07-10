import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from '../lib/dayjs'


export async function getParticipants(app: FastifyInstance) { // aqui eu crio uma função que recebe um app do tipo FastifyInstance
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/participants', // aqui eu defino o tipo de retorno do post que é um zod
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
                participants: {
                    select:{
                        id: true,
                        name: true,
                        email: true,
                        isConfirmed: true,
                        
                    }
                }
            },
        })

        if (!trip) {
            throw new Error('Trip not found')
        }

        return {
            participants: trip.participants
        }

        

    })
}

// esse codigo serve para criar uma rota que recebe um post com um 
// body que tem destination, start_at e end_at