import React from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import {
  Button,
  Container,
  createTheme,
  NextUIProvider,
  Tooltip,
} from "@nextui-org/react";
import "../styles/globals.css";
import AppContextProvider, { useDarkMode } from "../components/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/free-regular-svg-icons";

export function MyApp({ Component, pageProps }: AppProps) {
  const [darkMode, setDarkMode] = useDarkMode();

  return (
    <>
      <Head>
        <title>Metahkg Redirect</title>
        <meta name="description" content="Metahkg Redirect" />
      </Head>
      <NextUIProvider
        theme={createTheme({
          type: darkMode ? "dark" : "light",
          theme: {
            colors: {
              primary: "#0072f5",
              secondary: "#9750dd",
              selection: "#9750dd",
            },
          },
        })}
      >
        <Container className="dark:bg-[#222] bg-[white] min-h-[100vh] w-[100vw] max-w-[100vw] max-h-full overflow-y-scroll flex relative justify-center">
          <Tooltip
            content={`Switch to ${darkMode ? "light" : "dark"} mode`}
            className="flex absolute top-5 right-5"
            rounded
            placement="bottom"
            keepMounted
          >
            <Button
              auto
              rounded
              light
              onPress={() => {
                setDarkMode(!darkMode);
              }}
            >
              <FontAwesomeIcon size="lg" icon={darkMode ? faMoon : faSun} />{" "}
            </Button>
          </Tooltip>
          <Component {...pageProps} />
        </Container>
      </NextUIProvider>
    </>
  );
}

export default function App(props: AppProps) {
  return (
    <AppContextProvider>
      <MyApp {...props} />
    </AppContextProvider>
  );
}
