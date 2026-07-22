import { Route, Routes } from "react-router";
import { JobList } from "./pages/JobList";
import { JobDetails } from "./pages/JobDetail";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<JobList />} />
      <Route path="/jobs/:id" element={<JobDetails />} />
    </Routes>
  );
}
