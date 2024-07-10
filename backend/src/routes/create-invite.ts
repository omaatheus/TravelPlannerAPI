import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from '../lib/dayjs'	
import { getMailClient } from "../lib/mail";
import nodemailer from 'nodemailer'


export async function createInvite(app: FastifyInstance) { // aqui eu crio uma função que recebe um app do tipo FastifyInstance
    app.withTypeProvider<ZodTypeProvider>().post('/trips/:tripId/invites', // aqui eu defino o tipo de retorno do post que é um zod
        { 
            schema: {
                params: z.object({
                    tripId: z.string().uuid(),
                }),
                body: z.object({ // aqui eu defino o schema do body
                    email: z.string().email(), // aqui eu defino que o campo destination é uma string e tem que ter no minimo 4 caracteres
                   
                })
            },
        }, 
    async (request) => { // isso permite que o fastify saiba que o tipo de retorno é um zod
        const { email } = request.body;

        const { tripId } = request.params

        const trip = await prisma.trip.findUnique({
            where: {
                 id: tripId 
            }
        })

        if (!trip) {
            throw new Error('Trip not found')
        }

        const participant = await prisma.participant.create({
            data: {
                email,
                trip_id: tripId
            }
        })

        const formattedStartDate = dayjs(trip.starts_at).format('LL') // aqui eu formato a data de inicio
        const formattedEndDate = dayjs(trip.ends_at).format('LL') // aqui eu formato a data de inicio

        

        const mail = await getMailClient() // aqui eu pego o mail client


                const confirmationLink = `http://localhost:3333/participants/${participant.id}/confirm`

                const message = await mail.sendMail({ // aqui eu envio o email
                    from: { // quem está enviando o email
                        name: 'Equipe Travel Planner',
                        address: 'auxiliar@travelplanner.com'
                    },
                    to: participant.email,

                    subject: `Confirme a sua presença na viagem para ${trip.destination} em ${formattedStartDate} 🎉`, // assunto do email
                    html: `
                        <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
                            <p>Você foi convidado(a) para participar de uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formattedStartDate}</strong> a <strong>${formattedEndDate}</strong></p>
                            <p></p>
                            <p>Para confirmar a sua presença na viagem, clique no link abaixo: 😁</p>
                            <p></p>
                            <p> <a href="${confirmationLink}"> Confirmar presença </a></p>
                            <p></p>
                            <p> Caso esteja usando o dispositivo movel, você também pode confirmar a presença na viagem pelo aplicativo: </p>
                            <p></p>
                            <p> App Store </p>
                            <p> Google Play </p>
        
                            <p>Caso você não saiba do que se trata esse e-mail ou não poderá comparecer, apenas ignore esse e-mail.</p>
                        <div>
                    `.trim() // corpo do email
                })
        
                console.log(nodemailer.getTestMessageUrl(message)) // isso é para pegar a url do email que foi enviado
        



        return {
            participantId: participant.id,
        }

        

    })
}

// esse codigo serve para criar uma rota que recebe um post com um 
// body que tem destination, start_at e end_at