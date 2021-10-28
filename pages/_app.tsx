import "../styles/globals.css";
import { AppProps } from "next/app";
import Default from "@components/layout/Default";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Default>
      <Component {...pageProps} />
    </Default>
  );
}

export default MyApp;
