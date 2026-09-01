import { Route, Routes } from "react-router";
import { JobBoardPage } from "./features/jobs/JobBoardPage";
import { JobDetails } from "./features/jobs/JobDetail";
import { ScrollToTop } from "./shared/layout/ScrollToTop";
import { Header } from "./shared/layout/Header";
import { Footer } from "./shared/layout/Footer";
import { PostFormPage, PostPage } from "./features/post";
import { FaqPage } from "./features/faq";
import { MarketPage } from "./features/market";
import { MarketItemPage } from "./features/market/MarketItemPage";
import { ServicesPage } from "./features/services";

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
          <Route path="/post" element={<PostPage />} />
          <Route path="/post/:kind" element={<PostFormPage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/market/:id" element={<MarketItemPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/faq" element={<FaqPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
