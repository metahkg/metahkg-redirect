import React from "react";
import Document, {
    DocumentContext,
    DocumentInitialProps,
    Head,
    Html,
    Main,
    NextScript,
} from "next/document";

/**
 * @description Custom Next.js document
 */
class MyDocument extends Document {
    /**
     * @description get initial props
     */
    static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
        const initialProps = await Document.getInitialProps(ctx);

        return initialProps;
    }

    /**
     * @description Renders the document
     */
    render() {
        return (
            <Html lang="en">
                <Head>
                    <title>Metahkg Redirect</title>
                    <meta name="description" content="Metahkg Redirect" />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;
