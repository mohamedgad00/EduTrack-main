"use client";

import ReduxProvider from "../base/reduxProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import LanguageToggle from "@/components/i18n/LanguageToggle";

type Props = {
  children: React.ReactNode;
};

function MainProvider({ children }: Props) {
  return (
    <ReduxProvider>
      <LanguageProvider>
        {children}
        <LanguageToggle />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
        />
      </LanguageProvider>
    </ReduxProvider>
  );
}

export default MainProvider;
