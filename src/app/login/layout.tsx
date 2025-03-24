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
			</head>
			<body>{children}</body>
		</html>
	);
}
