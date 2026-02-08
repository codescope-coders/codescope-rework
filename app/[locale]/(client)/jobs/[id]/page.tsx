import { Content } from "./components/Content";

export default function page() {
  return (
    <main
      className="min-h-[calc(100vh-4.625rem)] bg-secondary text-white"
      dir="ltr"
    >
      <Content />
    </main>
  );
}
