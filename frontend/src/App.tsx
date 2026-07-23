import { Route, Routes } from "react-router";
import { JobList } from "./pages/JobList";
import { JobDetails } from "./pages/JobDetail";
import { Navbar } from "./components/Navbar";

export function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<JobList />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
      </Routes>
    </>
  );
}
