export const metadata = {
  title: 'IVY - Interview Virtual You',
  description: 'Master your interviews with yourself or the experts',
  icons: {
    icon: [{ url: '/assets/logo1.png', sizes: '32x32', type: 'image/png' }],
    shortcut: '/assets/logo1.png',
    apple: [{ url: '/assets/logo1.png', sizes: '180x180', type: 'image/png' }],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" />
      </head>
      <body>{children}</body>
    </html>
  )
}
