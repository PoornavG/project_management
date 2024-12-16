import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";
import LoginSignUp from "./Login";
import HomePage from "./HomePage";
import ProfilePage from "./profile"; // Renamed to match the import
import StudentDetails from "./StudentDetails";
import FacultyDetails from "./FacultyDetails";
function App() {
  const [userId, setUserId] = useState(null); // Tracks the logged-in user's ID

  return (
    <Router>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Routes>
          {/* Default Route */}
          <Route
            path="/"
            element={
              <LoginSignUp onLoginSuccess={(id) => setUserId(id)} />
            }
          />
          {/* Home Route */}

          <Route
            path="/home"
            element={
              userId ? (
                <HomePage userId={userId} />
              ) : (
                <div className="text-center">Please log in to access this page.</div>
              )
            }
          />
          {/* stuentdetails */}
          <Route
            path="/studentdetails"
            element={<StudentDetails userId={userId} />}
          />
          {/*facultydetaiils*/}
          <Route path="/facultydetails"
            element={<FacultyDetails userId={userId} />}
          />

          {/* Profile Route */}
          <Route
            path="/profile/:userId"
            element={<ProfileWrapper />}
          />
        </Routes>
      </div>
    </Router>
  );
}

// Wrapper to extract `userId` from URL and pass it to ProfilePage
function ProfileWrapper() {
  const { userId } = useParams();
  return <ProfilePage userId={parseInt(userId, 10)} />;
}

export default App;
