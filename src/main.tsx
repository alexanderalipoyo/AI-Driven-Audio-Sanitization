
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import { Toaster } from "sonner";
  import "./index.css";

  createRoot(document.getElementById("root")!).render(
    <>
      <App />
      <Toaster
        theme="dark"
        richColors
        position="top-right"
        toastOptions={{
          classNames: {
            toast: "border border-slate-700 bg-slate-950 text-slate-100",
            description: "text-slate-400",
          },
        }}
      />
    </>,
  );
  