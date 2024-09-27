import { Link } from "@remix-run/react";
import type { RemixLinkProps } from "@remix-run/react/dist/components";
import * as nav from "./ui/navigation-menu";
export default function () {
	return (
		<nav.NavigationMenu>
			<nav.NavigationMenuList>
				<nav.NavigationMenuItem>
					<L to="/">Home</L>
					<L to="/songs">Songs</L>
					<L to="/upload">Upload</L>
					<L to="/auth">Auth</L>
				</nav.NavigationMenuItem>
			</nav.NavigationMenuList>
		</nav.NavigationMenu>
	);
}

function L({
	to,
	...props
}: RemixLinkProps & React.RefAttributes<HTMLAnchorElement>) {
	const p = {};
	return (
		<nav.NavigationMenuLink asChild>
			<Link to={to} className={nav.navigationMenuTriggerStyle()} {...props} />
		</nav.NavigationMenuLink>
	);
}
