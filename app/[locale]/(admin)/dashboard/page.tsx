import { Counters } from "./components/Counters";
import { JobsTable } from "./components/jobs-table";
import { Header } from "./components/Header";

export default function page() {
  return (
    <main>
      <div className="bg-white p-4 rounded-md mb-4">
        <Header />
        <Counters />
      </div>
      <JobsTable />
    </main>
  );
}
