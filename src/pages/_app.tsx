import type { AppProps } from "next/app";
import { Container, createTheme, NextUIProvider } from "@nextui-org/react";
import "../styles/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NextUIProvider
      theme={createTheme({
        type: "dark",
        theme: {
          colors: {
            primary: "#0072f5",
            secondary: "#9750dd",
            selection: "#9750dd",
          },
        },
      })}
    >
      <Container className="bg-[#222] min-h-[100vh] w-[100vw] max-w-[100vw] max-h-full overflow-y-scroll flex justify-center">
        <Component {...pageProps} />
      </Container>
    </NextUIProvider>
  );
}
