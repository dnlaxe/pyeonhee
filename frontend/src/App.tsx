import { Navigate, Route, Routes } from "react-router";
import { JobDetails, MarketDetail, ServiceDetail } from "./features/listings";
import { ScrollToTop } from "./shared/layout/ScrollToTop";
import { Navbar } from "./shared/layout/Navbar";
import { ShareCta } from "./shared/layout/ShareCta";
import { Footer } from "./shared/layout/Footer";
import { PostFormPage, PostPage } from "./features/post";
import { FaqPage } from "./features/faq";
import { NotFound } from "./features/not-found/NotFound";
import { FeedPage } from "./features/feed";
import { ReportPage } from "./features/report";
import { PayFailPage, PayPage, PaySuccessPage } from "./features/payment/PayPage";

export function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <div className="flex flex-1 flex-col">
        <Routes>
          <Route path="/" element={<FeedPage />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route
            path="/jobs"
            element={<Navigate to="/?kind=job" replace />}
          />
          <Route path="/market/:id" element={<MarketDetail />} />
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
          <Route path="/pay/:kind/:id" element={<PayPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/report/:kind/:id" element={<ReportPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <ShareCta />
      <Footer />
    </div>
  );
}
