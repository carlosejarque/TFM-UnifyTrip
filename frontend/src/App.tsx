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
import { Navbar } from "./components/Navbar";
import { Toaster } from "sonner";

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/mytrips" element={<MyTripsPage />} />
          <Route path="/trips/:id" element={<TripDetailsPage />}>
            <Route index element={<TripOverviewPage />} />
            <Route path="polls" element={<TripPollPage />} />
            <Route path="itinerary" element={<TripItineraryPage />} />
            <Route path="budget" element={<TripBudgetPage />} />
          </Route>
          <Route path="/newtrip" element={<NewTripPage />} />
          <Route path="*" element={<h2>404 - Página no encontrada</h2>} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </>
  );
}

export default App;
