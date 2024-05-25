"use client";
import { Roboto } from "next/font/google";
import { createTheme } from "@mui/material/styles";
import { blue, purple } from "@mui/material/colors";

const roboto = Roboto({
    weight: ["300", "400", "500", "700"],
    subsets: ["latin"],
    display: "swap",
});

export const theme = createTheme({
    typography: {
        fontFamily: roboto.style.fontFamily,
    },
    palette: {
        mode: "light",
        primary: {
            main: blue[500],
        },
        secondary: {
            main: purple[400],
        },
    },
});

export const darkTheme = createTheme({
    typography: {
        fontFamily: roboto.style.fontFamily,
    },
    palette: {
        mode: "dark",
        primary: {
            main: blue[500],
        },
        secondary: {
            main: purple[400],
        },
    },
});
