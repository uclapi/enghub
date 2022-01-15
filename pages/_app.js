import { SessionProvider } from "next-auth/react";
import "rsuite/dist/rsuite.min.css";
import Layout from "../components/Layout.react";
import "../styles/globals.css";

function EngHub({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <Layout session={pageProps.session}>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
}

export default EngHub;
