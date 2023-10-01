import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { buttonVariants } from "./ui/button";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRight } from "lucide-react";

const Navbar = () => {
	return (
		<nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
			<MaxWidthWrapper>
				<div className="flex h-14 items-center justify-between border-b border-zinc-200">
					<Link className="flex z-40 font-semibold" href="/">
						<span>Clouder</span>
					</Link>

					{/* TODO: add mobile auth */}

					<div className="sm:flex hidden items-center gap-x-4">
						<Link
							href="/pricing"
							className={buttonVariants({ variant: "ghost", size: "sm" })}
						>
							Pricing
						</Link>
						<LoginLink
							className={buttonVariants({ variant: "ghost", size: "sm" })}
						>
							Sign in
						</LoginLink>
						<RegisterLink
							className={buttonVariants({ size: "sm" })}
						>
							Get Started <ArrowRight className="ml-1.5 h-5 w-5" />
						</RegisterLink>
					</div>
				</div>
			</MaxWidthWrapper>
		</nav>
	);
};

export default Navbar;
