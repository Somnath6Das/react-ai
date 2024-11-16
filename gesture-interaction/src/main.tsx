import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ContentView from "./ContentView";
import GlobalStyle from "./globalStyles";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlobalStyle />
    <ContentView />
  </StrictMode>
);
