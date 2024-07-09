import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { dayjs } from '../lib/dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { getMailClient } from "../lib/mail";
import nodemailer from 'nodemailer'
import { z } from "zod"; 
import { prisma } from "../lib/prisma";
import { get } from "http";


export async function createTrip(app: FastifyInstance) { // aqui eu crio uma função que recebe um app do tipo FastifyInstance
    app.withTypeProvider<ZodTypeProvider>().post('/trips', // aqui eu defino o tipo de retorno do post que é um zod
        {
            schema: {
                body: z.object({ // aqui eu defino o schema do body
                    destination: z.string().min(4), // aqui eu defino que o campo destination é uma string e tem que ter no minimo 4 caracteres
                    starts_at: z.coerce.date(),
                    ends_at: z.coerce.date(), // zod não tem um tipo para data, então usamos o coerce para converter para data
                    owner_name: z.string(),
                    owner_email: z.string().email(), // aqui eu defino que o campo owner_email é uma string e tem que ser um email
                    emails_to_invite: z.array(z.string().email()) // aqui eu defino que o campo emails_to_invite é um array de strings que tem que ser um email,
                })
            },
        }, 
    async (request) => { // isso permite que o fastify saiba que o tipo de retorno é um zod
        const { destination, starts_at, ends_at, owner_name, owner_email, emails_to_invite } = request.body;

        if (dayjs(starts_at).isBefore(new Date())) { //se a data de inicio for antes de hoje
            throw new Error('Invalid start date')
        }

        if(dayjs(ends_at).isBefore(starts_at)) { // se a data de fim for antes da data de inicio
            throw new Error('Invalid end date')
        }

        
        

        const trip = await prisma.trip.create({ // aqui o usuario cria uma viagem
            data: { // data é um objeto que tem os campos que eu quero criar
                destination, 
                starts_at,
                ends_at,
                participants: { //participante é um array de objetos contendo informações do participante
                    createMany: {
                        data: [
                            {
                                name: owner_name,
                                email: owner_email,
                                isOwner: true,
                                isConfirmed: true,
                            },
                            
                            ...emails_to_invite.map(email => { // aqui eu mapeio os emails para criar os participantes
                                return { email }
                            })

                        ],
                    }
                
                }
            }
        })

        const formattedStartDate = dayjs(starts_at).format('LL') // aqui eu formato a data de inicio
        const formattedEndDate = dayjs(ends_at).format('LL') // aqui eu formato a data de inicio

        const confirmationLink = `http://localhost:3333/trips/${trip.id}/confirm`

        const mail = await getMailClient() // aqui eu pego o mail client

        const message = await mail.sendMail({ // aqui eu envio o email
            from: { // quem está enviando o email
                name: 'Equipe Travel Planner',
                address: 'auxiliar@travelplanner.com'
            },
            to: {   // quem está recebendo o email
                name: owner_name,
                address: owner_email
            },
            subject: `Confirme a sua viagem para ${destination} em ${formattedStartDate}`, // assunto do email
            html: `
                <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
                    <p>Você solicitou a criação de uma viagem para <strong>${destination}</strong> nas datas de <strong>${formattedStartDate}</strong> até <strong>${formattedEndDate}</strong></p>
                    <p></p>
                    <p>para confirmar a viagem, clique no link abaixo:</p>
                    <p></p>
                    <p> <a href="${confirmationLink}"> confirmar viagem </a></p>
                    <p></p>
                    <p> Caso esteja usando o dispositivo movel, você também pode confirmar a viagem pelo aplicativo: </p>
                    <p></p>
                    <p> App Store </p>
                    <p> Google Play </p>

                    <p>Se você não solicitou essa viagem, por favor ignore esse email</p>
                <div>
            `.trim() // corpo do email
        })

        console.log(nodemailer.getTestMessageUrl(message)) // isso é para pegar a url do email que foi enviado

        return {
            trip_id: trip.id,
        }
    })
}

// esse codigo serve para criar uma rota que recebe um post com um 
// body que tem destination, start_at e end_at