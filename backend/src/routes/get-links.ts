import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";


export async function getLinks(app: FastifyInstance) { // aqui eu crio uma função que recebe um app do tipo FastifyInstance
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/links', // aqui eu defino o tipo de retorno do post que é um zod
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
                links: true,
            },
        })

        if (!trip) {
            throw new ClientError('Trip not found')
        }

        return {
            links: trip.links
        }

        

    })
}
