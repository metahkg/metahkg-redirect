import React from "react";
import {
    DocumentContext,
    Html,
    Head,
    Main,
    NextScript,
    DocumentProps,
} from "next/document";
import {
    DocumentHeadTags,
    documentGetInitialProps,
    DocumentHeadTagsProps,
} from "@mui/material-nextjs/v14-pagesRouter";

/**
 * @description Custom Next.js document
 */
const MyDocument = (props: DocumentProps & DocumentHeadTagsProps) => {
    return (
        <Html lang="en">
            <Head>
                <DocumentHeadTags {...props} />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
};

MyDocument.getInitialProps = async (ctx: DocumentContext) => {
    const finalProps = await documentGetInitialProps(ctx);
    return finalProps;
};

export default MyDocument;
