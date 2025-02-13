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
				<script
					src="https://challenges.cloudflare.com/turnstile/v0/api.js?compat=recaptcha"
					async
					defer
				></script>
			</head>
			<body>{children}</body>
		</html>
	);
}
