import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { MyTripsPage } from "./pages/MyTripsPage";
import { NewTripPage } from "./pages/NewTripPage";
import { TripDetailsPage } from "./pages/TripDetailsPage";
import { TripOverviewPage } from "./pages/TripOverviewPage";
import { TripItineraryPage } from "./pages/TripItineraryPage";
import { TripBudgetPage } from "./pages/TripBudgetPage";
import { TripPollPage } from "./pages/TripPollPage";
import { TripParticipantsPage } from "./pages/TripParticipantsPage";
import { JoinTripPage } from "./pages/JoinTripPage";
import { AboutPage } from "./pages/AboutPage";
import { HelpPage } from "./pages/HelpPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProfilePage } from "./pages/ProfilePage";
import { Navbar } from "./components/Navbar";
import { Toaster } from "sonner";
import { Footer } from "./components/Footer";

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/mytrips" element={<MyTripsPage />} />
          <Route path="/trips/:id" element={<TripDetailsPage />}>
            <Route index element={<TripOverviewPage />} />
            <Route path="polls" element={<TripPollPage />} />
            <Route path="itinerary" element={<TripItineraryPage />} />
            <Route path="participants" element={<TripParticipantsPage />} />
            <Route path="budget" element={<TripBudgetPage />} />
          </Route>
          <Route path="/newtrip" element={<NewTripPage />} />
          <Route path="/invitations/join/:token" element={<JoinTripPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </>
  );
}

export default App;
