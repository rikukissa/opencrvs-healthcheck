import React from "react";
import ReactDOM from "react-dom/client";

import { createBrowserRouter, RouterProvider, Route } from "react-router-dom";

import { TokenGenerator } from "./TokenGenerator";
import { MyEnvironment } from "./MyEnvironment";
import "./index.css";
import {
  getTheme,

} from "@riku/opencrvs-components";
import { ThemeProvider } from "styled-components";
const router = createBrowserRouter([
  {
    path: "/",
    element: <MyEnvironment />,
  },
  {
    path: "/token",
    element: <TokenGenerator />,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <React.StrictMode>
      <ThemeProvider theme={getTheme()}>
        <div className="App">
          <RouterProvider router={router} />
        </div>
      </ThemeProvider>
    </React.StrictMode>
  </React.StrictMode>
);
