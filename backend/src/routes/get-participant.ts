import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";


export async function getParticipant(app: FastifyInstance) { // aqui eu crio uma função que recebe um app do tipo FastifyInstance
    app.withTypeProvider<ZodTypeProvider>().get('/participants/:participantId', // aqui eu defino o tipo de retorno do post que é um zod
        { 
            schema: {
                params: z.object({
                    participantId: z.string().uuid(),
                }),
                
            },
        }, 
    async (request) => { // isso permite que o fastify saiba que o tipo de retorno é um zod


        const { participantId } = request.params

        const participant = await prisma.participant.findUnique({
            select: {
                id: true,
                name: true,
                email: true,
                isConfirmed: true,
            },
            where: {
                 id: participantId 
            }, 
        })

        if (!participant) {
            throw new Error('Participant not found')
        }

        return {
            participant
        }

        

    })
}

// esse codigo serve para criar uma rota que recebe um post com um 
// body que tem destination, start_at e end_at