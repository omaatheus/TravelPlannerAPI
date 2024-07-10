
import z from "zod";

const envSchema = z.object({ // aqui eu defino um objeto que tem as variaveis de ambiente que eu quero
    DATABASE_URL: z.string().url(),
    API_BASE_URL: z.string().url(), 
    PORT: z.coerce.number().default(3333), // aqui eu defino que a variavel PORT é um numero e tem um valor padrão de 3333
    WEB_BASE_URL: z.string().url(),

    });

export const env = envSchema.parse(process.env); // aqui eu faço o parse das variaveis de ambiente