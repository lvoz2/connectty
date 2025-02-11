import "@/app/globals.css";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<head>
				<script
					src="https://unpkg.com/react-scan/dist/auto.global.js"
					async
				/>
				<title>lv_oz2&apos;s Website</title>
			</head>
			<body>{children}</body>
		</html>
	);
}
