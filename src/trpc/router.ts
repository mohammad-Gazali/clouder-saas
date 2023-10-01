import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";

export const appRouter = router({
    authCallback: publicProcedure.query(async () => {
        const { getUser } = getKindeServerSession();

        const user = getUser();

        if (!user.email || !user.id) throw new TRPCError({ code: "UNAUTHORIZED" });

        // check if the user is in the database
        const dbUser = await db.user.findUnique({
            where: {
                id: user.id,
            }
        })

        if (!dbUser) {
            // create user in db
            await db.user.create({
                data: {
                    id: user.id,
                    email: user.email,
                }
            })
        }

        return { success: true };
    }),
    getUserFiles: privateProcedure.query(async ({ ctx: { user } }) => {
        return await db.file.findMany({
            where: {
                userId: user.id,
            }
        })
    }),
    deleteFile: privateProcedure.input(z.object({ id: z.string().nonempty() })).mutation(async ({ ctx: { user }, input }) => {
        const file = await db.file.findUnique({
            where: {
                id: input.id,
                userId: user.id,
            }
        });

        if (!file) throw new TRPCError({ code: "NOT_FOUND" });

        await db.file.delete({
            where: {
                id: file.id,
            }
        });

        return file;
    }),
    
})

export type AppRouter = typeof appRouter;