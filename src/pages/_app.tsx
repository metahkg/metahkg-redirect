import type { AppProps } from "next/app";
import { createTheme, NextUIProvider } from "@nextui-org/react";
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
      <Component {...pageProps} />
    </NextUIProvider>
  );
}
