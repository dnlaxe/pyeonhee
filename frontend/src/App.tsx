import { Navigate, Route, Routes } from "react-router";
import { JobDetails } from "./features/jobs/JobDetail";
import { ScrollToTop } from "./shared/layout/ScrollToTop";
import { Header } from "./shared/layout/Header";
import { Footer } from "./shared/layout/Footer";
import { PostFormPage, PostPage } from "./features/post";
import { FaqPage } from "./features/faq";
import { MarketItemPage } from "./features/market/MarketItemPage";
import { ServiceDetail } from "./features/services/ServiceDetail";
import { NotFound } from "./features/not-found/NotFound";
import { LandingPage } from "./features/landing";
import { ReportPage } from "./features/report";
import {
  PayFailPage,
  PayPage,
  PaySuccessPage,
} from "./features/payment/PayPage";

export function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header />
      <div className="flex flex-1 flex-col">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route
            path="/jobs"
            element={<Navigate to="/?kind=job" replace />}
          />
          <Route path="/market/:id" element={<MarketItemPage />} />
          <Route
            path="/market"
            element={<Navigate to="/?kind=market" replace />}
          />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route
            path="/services"
            element={<Navigate to="/?kind=service" replace />}
          />
          <Route path="/post" element={<PostPage />} />
          <Route path="/post/:kind" element={<PostFormPage />} />
          <Route path="/pay" element={<PayPage />} />
          <Route path="/pay/success" element={<PaySuccessPage />} />
          <Route path="/pay/fail" element={<PayFailPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/report/:kind/:id" element={<ReportPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
