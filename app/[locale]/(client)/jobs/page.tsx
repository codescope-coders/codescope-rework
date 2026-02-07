import Container from "@/components/Container";
import { Content } from "./components/Content";

export default function page() {
  return (
    <main className="min-h-[calc(100vh-4.625rem)] bg-secondary text-white pt-25" dir="ltr">
      <Container>
        <h1 className="font-bold text-5xl mb-10">
          Discover Your Next Career Move
        </h1>
        <Content />
      </Container>
    </main>
  );
}
