"use client";

import { trpc } from "@/trpc";
import { ChevronLeft, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import Notes from "./Notes";
import NoteInput from "./NoteInput";
import { NoteContextProvider } from "./NoteContext";
// import { PLANS } from "@/config/stripe";

interface NoteWrapperProps {
	fileId: string;
	isSubscribed: boolean;
}

const NoteWrapper = ({ fileId, isSubscribed }: NoteWrapperProps) => {
	return (
		<NoteContextProvider fileId={fileId}>
			<div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
				<div className="flex-1 justify-between flex flex-col mb-28">
					<Notes fileId={fileId} />
				</div>

				<NoteInput />
			</div>
		</NoteContextProvider>
	);
};

export default NoteWrapper;
