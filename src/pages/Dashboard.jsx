import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase-config";
import { doc, getDoc } from "firebase/firestore";
import StudentTools from "../components/StudentTools";
import SupervisorTools from "../components/SupervisorTools";
import { toast } from "react-toastify";

function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const uid = auth.currentUser.uid;
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        toast.error("No user data found.");
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  function handleLogout() {
    signOut(auth)
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        console.error("Logout error:", error);
      });
  }

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h1>Welcome to your Dashboard {userData.fullName} 🎓</h1>
      <p>Role: {userData.role}</p>
      <p>You’re successfully logged in 🎉</p>
      {userData.role === "student" && <StudentTools />}
      {userData.role === "supervisor" && <SupervisorTools />}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;
