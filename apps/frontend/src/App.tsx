import { Toaster } from "sonner";
import { AppRoutes } from "./routes";

export default function App() {
  return (
    <>
      <AppRoutes />
      <Toaster richColors closeButton position="top-right" />
    </>
  );
}
