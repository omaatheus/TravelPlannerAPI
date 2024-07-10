import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";


export async function createLink(app: FastifyInstance) { // aqui eu crio uma função que recebe um app do tipo FastifyInstance
    app.withTypeProvider<ZodTypeProvider>().post('/trips/:tripId/links', // aqui eu defino o tipo de retorno do post que é um zod
        { 
            schema: {
                params: z.object({
                    tripId: z.string().uuid(),
                }),
                body: z.object({ // aqui eu defino o schema do body
                    title: z.string().min(4), // aqui eu defino que o campo destination é uma string e tem que ter no minimo 4 caracteres
                    url: z.string().url(),
                })
            },
        }, 
    async (request) => { // isso permite que o fastify saiba que o tipo de retorno é um zod
        const { title, url } = request.body;

        const { tripId } = request.params

        const trip = await prisma.trip.findUnique({
            where: {
                 id: tripId 
            }
        })

        if (!trip) {
            throw new ClientError('Trip not found')
        }


        const link = await prisma.link.create({
            data: {
                title,
                url,
                trip_id: tripId
            }
        })


        return {
            linkId: link.id,
        }

        

    })
}

// esse codigo serve para criar uma rota que recebe um post com um 
// body que tem destination, start_at e end_at