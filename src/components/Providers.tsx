"use client";

import { PropsWithChildren, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/react-query";
import { trpc } from "@/trpc";
import { absoluteUrl } from "@/lib/utlis";


const queryClient = new QueryClient();


export const trpcClient = trpc.createClient({
	links: [
		httpBatchLink({
			url: absoluteUrl("/api/trpc"),
		}),
	],
});

const Providers = ({ children }: PropsWithChildren) => {
	return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </trpc.Provider>
    );
};

export default Providers;
