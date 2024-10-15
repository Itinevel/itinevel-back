import prisma from "api/config/database";

export async function GET(){
    const users = await prisma.users.findMany()
    if(!users){
        return Response.json({status:200, messgae:"No users avalible"})
    }
    return Response.json({status:200, data:users})
}