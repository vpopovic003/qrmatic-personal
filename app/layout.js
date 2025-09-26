import "./globals.css";

export const metadata = {
  title: "QRMatic - Personal QR Code Generator",
  description: "Generate and track QR codes with analytics",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
