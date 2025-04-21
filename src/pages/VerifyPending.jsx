import "./Login.css";
import { useEffect, useState } from "react";
import { auth } from "../services/firebase-config";
import { sendEmailVerification, reload } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function VerifyPending() {
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkVerification = async () => {
      await reload(auth.currentUser);
      setIsVerified(auth.currentUser.emailVerified);
      setLoading(false);
    };

    checkVerification();
  }, []);

  const handleResend = async () => {
    if (!auth.currentUser) return;

    try {
      await sendEmailVerification(auth.currentUser);
      alert("Verification email sent!");
      setTimer(120);
    } catch (error) {
      console.error("Resend failed:", error.message);
      alert("Failed to resend email.");
    }
  };

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  if (loading) return <p>Checking verification status...</p>;

  if (isVerified) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div>
      <h2>Please Verify Your Email</h2>
      <p>
        We’ve sent a verification email. Check your inbox or spam/junk folder.<br />
        After verifying, refresh or re-login.
      </p>

      <button onClick={handleResend} disabled={timer > 0}>
        {timer > 0 ? `Resend in ${timer}s` : "Resend Verification"}
      </button>
    </div>
  );
}

export default VerifyPending;
