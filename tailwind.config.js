const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,jsx,ts,tsx}",
        "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
        "./node_modules/@nextui-org/theme/dist/components/(button|snippet|code|input).js",
    ],
    darkMode: ["class", ".dark"],
    theme: {
        extend: {
            colors: {
                link: "#3498db",
                "metahkg-grey": "#aca9a9",
                "metahkg-yellow": "#f5bd1f",
            },
            height: {
                "10v": "10vh",
                "20v": "20vh",
                "30v": "30vh",
                "40v": "40vh",
                "50v": "50vh",
                "60v": "60vh",
                "70v": "70vh",
                "80v": "80vh",
                "90v": "90vh",
                "100v": "100vh",
            },
            width: {
                "10v": "10vw",
                "20v": "20vw",
                "30v": "30vw",
                "40v": "40vw",
                "50v": "50vw",
                "60v": "60vw",
                "70v": "70vw",
                "80v": "80vw",
                "90v": "90vw",
                "100v": "100vw",
            },
            minHeight: {
                "10v": "10vh",
                "20v": "20vh",
                "30v": "30vh",
                "40v": "40vh",
                "50v": "50vh",
                "60v": "60vh",
                "70v": "70vh",
                "80v": "80vh",
                "90v": "90vh",
                "100v": "100vh",
            },
            maxHeight: {
                "10v": "10vh",
                "20v": "20vh",
                "30v": "30vh",
                "40v": "40vh",
                "50v": "50vh",
                "60v": "60vh",
                "70v": "70vh",
                "80v": "80vh",
                "90v": "90vh",
                "100v": "100vh",
            },
            minWidth: {
                "10v": "10vw",
                "20v": "20vw",
                "30v": "30vw",
                "40v": "40vw",
                "50v": "50vw",
                "60v": "60vw",
                "70v": "70vw",
                "80v": "80vw",
                "90v": "90vw",
                "100v": "100vw",
            },
            maxWidth: {
                "10v": "10vw",
                "20v": "20vw",
                "30v": "30vw",
                "40v": "40vw",
                "50v": "50vw",
                "60v": "60vw",
                "70v": "70vw",
                "80v": "80vw",
                "90v": "90vw",
                "100v": "100vw",
            },
        },
    },
    plugins: [
        nextui({
            themes: {
                light: {
                    colors: {
                        background: "#FFFFFF", // or DEFAULT
                        foreground: "#11181C", // or 50 to 900 DEFAULT
                        primary: {
                            //... 50 to 900
                            foreground: "#FFFFFF",
                            DEFAULT: "#006FEE",
                        },
                        // ... rest of the colors
                    },
                },
                dark: {
                    colors: {
                        background: "#000000", // or DEFAULT
                        foreground: "#ECEDEE", // or 50 to 900 DEFAULT
                        primary: {
                            //... 50 to 900
                            foreground: "#FFFFFF",
                            DEFAULT: "#006FEE",
                        },
                    },
                    // ... rest of the colors
                },
                mytheme: {
                    // custom theme
                    extend: "dark",
                    colors: {
                        primary: {
                            DEFAULT: "#BEF264",
                            foreground: "#000000",
                        },
                        focus: "#BEF264",
                    },
                },
            },
        }),
    ],
};
