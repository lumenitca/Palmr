import App from "./App.tsx";
import { Providers } from "./providers.tsx";
import "@/styles/globals.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Providers>
        <App />
        <Toaster />
      </Providers>
    </BrowserRouter>
  </React.StrictMode>
);
