import { Form } from "@remix-run/react";
export default function Upload() {
	return (
		<>
			<h1>FileUpload</h1>
			<Form method="post" encType="multipart/form-data">
				<input type="file" name="file" />
				<button type="submit">Upload</button>
			</Form>
		</>
	);
}
