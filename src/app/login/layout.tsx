import Script from "next/script";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<head>
				<title>lv_oz2&apos;s Website</title>
				<script
					src="https://unpkg.com/react-scan/dist/auto.global.js"
					async
				/>
				<Script
					strategy="lazyOnload"
					src="https://www.google.com/recaptcha/api.js?render=6LdHimkqAAAAAOXLRndbYvcmN3dzYjvLz7-5QBAD"
				></Script>
			</head>
			<body>{children}</body>
		</html>
	);
}
