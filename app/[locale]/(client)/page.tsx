import { About } from "./components/about";
import { FeaturedProject } from "./components/featuredProject";
import { Hero } from "./components/Hero";
import { OurExpertises } from "./components/ourExpertises";
import { Partners } from "./components/partners";
import { Preview } from "./components/Preview";
import { Tourscope } from "./components/Tourscope";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <OurExpertises />
      <FeaturedProject />
      <Partners />
      <Tourscope />
      <Preview />
    </main>
  );
}
