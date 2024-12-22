export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<head>
				<title>lv_oz2's Website</title>
			</head>
			<body>{children}</body>
		</html>
	)
}
