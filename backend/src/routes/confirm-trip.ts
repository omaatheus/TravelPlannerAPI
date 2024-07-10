import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from '../lib/dayjs'
import { getMailClient } from "../lib/mail";
import nodemailer from 'nodemailer'
import { ClientError } from "../errors/client-error";
import { env } from "../env";

export async function confirmTrip(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/confirm', {
        schema: {
            params: z.object({
                tripId: z.string().uuid(),
            }),
        },
    }, async (request, reply) => {

        const { tripId } = request.params

        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId
            },
            include: {
                participants: {
                    where: {
                        isOwner: false,
                    }
                }
            }
        })

        if (!trip) {
            throw new ClientError('Trip not found')
        }

        if (trip.isConfirmed) {
            return reply.redirect(`${env.WEB_BASE_URL}/trips/${tripId}`) //colocar link para redirecionar
        }

        await prisma.trip.update({
            where: {
                id: tripId
            },
            data: {
                isConfirmed: true
            }
        })



        const formattedStartDate = dayjs(trip.starts_at).format('LL') // aqui eu formato a data de inicio
        const formattedEndDate = dayjs(trip.ends_at).format('LL') // aqui eu formato a data de inicio

        

        const mail = await getMailClient() // aqui eu pego o mail client

        await Promise.all( //promisse all é uma função que executa todas as promisses ao mesmo tempo, ou seja vou enviar todos emails ao mesmo tempo
            trip.participants.map(async (participant) => {

                const confirmationLink = `${env.API_BASE_URL}/participants/${participant.id}/confirm`

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
        
            })
        )

        return reply.redirect(`${env.WEB_BASE_URL}/trips/${tripId}`)
        
    })

}