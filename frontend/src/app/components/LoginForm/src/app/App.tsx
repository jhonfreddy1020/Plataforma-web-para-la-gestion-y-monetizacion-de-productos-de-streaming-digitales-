import { LoginForm } from "./components/LoginForm";

export default function App() {
  return (
    <div
      className="size-full flex items-center justify-center"
      style={{
        background: "#000000",
        minHeight: "100vh",
        width: "100vw",
      }}
    >
      <LoginForm />
    </div>
  );
}