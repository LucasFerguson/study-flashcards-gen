import { type AppType } from "next/app";
import { Geist } from "next/font/google";

import { api } from "~/utils/api";
import NavBar from "~/components/NavBar";

import "~/styles/globals.css";
import "highlight.js/styles/github.css";

const geist = Geist({
  subsets: ["latin"],
});

const MyApp: AppType = ({ Component, pageProps }) => {

  return (
    <div className={geist.className}>
      <NavBar />
      <Component {...pageProps} />
    </div>
  );
};

export default api.withTRPC(MyApp);
