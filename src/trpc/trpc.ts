import { db } from '@/db';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { TRPCError, initTRPC } from '@trpc/server';

const t = initTRPC.create();

const middleware = t.middleware

const isAuth = middleware(async (opts) => {
    const { getUser } = getKindeServerSession();
    const user = getUser();

    if (!user || !user.id || !user.email) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const dbUser = await db.user.findUnique({
        where: {
            id: user.id,
        }
    });

    if (!dbUser) {
        await db.user.create({
            data: {
                id: user.id,
                email: user.email,
            }
        })
    }

    return opts.next({
        // here we can add to the ctx object after running this middlreware
        ctx: {
            user,
        }
    })
})

export const router = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuth);