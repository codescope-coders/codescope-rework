import { Counters } from "./components/Counters";
import { JobApplications } from "./components/JobApplications";

export default function page() {
  return (
    <main>
      <div className="bg-white p-4 rounded-md mb-4">
        <header className="flex justify-between gap-4 mb-3">
          <h1 className="font-semibold text-4xl mb-4">Applications</h1>
        </header>
        <Counters />
      </div>
      <JobApplications />
    </main>
  );
}
