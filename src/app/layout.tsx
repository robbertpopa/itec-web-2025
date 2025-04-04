import "./globals.css"

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>OfCoursely</title>
    </head>
    <body className="h-svh overflow-hidden">
        {children}
    </body>
    </html>
  )
}
