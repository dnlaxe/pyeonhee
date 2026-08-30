import { Route, Routes } from "react-router";
import { JobBoardPage } from "./features/jobs/JobBoardPage";
import { JobDetails } from "./features/jobs/JobDetail";
import { ScrollToTop } from "./shared/layout/ScrollToTop";
import { Header } from "./shared/layout/Header";
import { Footer } from "./shared/layout/Footer";

export function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header />
      <div className="flex flex-1 flex-col">
        <Routes>
          <Route path="/" element={<main />} />
          <Route path="/jobs" element={<JobBoardPage />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
