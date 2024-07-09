import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient({ // estou exportando uma log com uma query, cada vez que eu fizer uma query, irá mostrar uma log
    log: ['query'], 
})