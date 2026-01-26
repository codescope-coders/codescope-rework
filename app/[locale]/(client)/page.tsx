import { About } from "./components/about";
import { Clients } from "./components/clients";
import { FeaturedProject } from "./components/featuredProject";
import { Hero } from "./components/Hero";
import { OurExpertises } from "./components/ourExpertises";
import { Preview } from "./components/Preview";
import { Tourscope } from "./components/Tourscope";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <OurExpertises />
      <FeaturedProject />
      <Clients />
      <Tourscope />
      <Preview />
    </main>
  );
}
