import Script from "next/script";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<head>
				<title>lv_oz2's Website</title>
				<Script strategy="lazyOnload" src="https://www.google.com/recaptcha/api.js?render=6LdHimkqAAAAAOXLRndbYvcmN3dzYjvLz7-5QBAD"></Script>
			</head>
			<body>{children}</body>
		</html>
	)
}
