import { Form } from "@remix-run/react";
import * as button from "../components/ui/button";
import * as card from "../components/ui/card";

export default function auth() {
	return (
		<card.Card>
			<card.CardHeader>
				<card.CardTitle>Connect</card.CardTitle>
				<card.CardDescription>
					using one of the following providers:
				</card.CardDescription>
			</card.CardHeader>
			<card.CardContent>
				<Form method="get" action="/auth/google">
					<button.Button type="submit">Google</button.Button>
				</Form>
			</card.CardContent>
			<card.CardFooter />
		</card.Card>
	);
}
