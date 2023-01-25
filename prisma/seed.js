const { PrismaClient } = require("@prisma/client")
const { editTokenList } = require("./listOfTokens")

const prisma = new PrismaClient()

async function main() {
    const data = await editTokenList()
    await prisma.token.createMany({ data: data })
    //await prisma.token.deleteMany({})
}

main()
    .catch((e) => {
        console.log(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
