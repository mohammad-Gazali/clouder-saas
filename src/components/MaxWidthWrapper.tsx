import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MaxWidthWrapperProps {
	className?: string;
	children: ReactNode;
}

const MaxWidthWrapper = ({ className, children }: MaxWidthWrapperProps) => {
	return (
		<div className={cn("mx-auto w-full max-w-screen-xl md:px-20 px-2.5", className)}>
			{children}
		</div>
	);
};

export default MaxWidthWrapper;
