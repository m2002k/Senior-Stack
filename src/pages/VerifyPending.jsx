import { useState, useEffect } from "react";
import { auth } from "../services/firebase-config";
import { sendEmailVerification, reload } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Button, Typography, Box } from "@mui/material";
import { toast } from "react-toastify";

function VerifyPending() {
  const [cooldown, setCooldown] = useState(0);
  const [checking, setChecking] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkVerification = async () => {
      await reload(auth.currentUser);
      setIsVerified(auth.currentUser.emailVerified);
      setChecking(false);
    };
    checkVerification();
  }, []);

  useEffect(() => {
    if (isVerified) {
      navigate("/dashboard");
    }
  }, [isVerified]);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await sendEmailVerification(user);
        toast.success("Verification email resent!");
        setCooldown(60);
      } catch (error) {
        toast.error("Failed to resend email: " + error.message);
      }
    }
  };

  if (checking) return <p>Checking verification status...</p>;

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#121212",
        padding: 3,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Please Verify Your Email
      </Typography>
      <Typography align="center" maxWidth={500} sx={{ mb: 2 }}>
        We’ve sent a verification email. Check your inbox or spam/junk folder.
        After verifying, <b>refresh or re-login.</b>
      </Typography>

      <Button
        variant="contained"
        onClick={handleResend}
        disabled={cooldown > 0}
        sx={{
          mt: 2,
          opacity: cooldown > 0 ? 0.6 : 1,
          cursor: cooldown > 0 ? "not-allowed" : "pointer",
          color: cooldown > 0 ? "red" : "white",
          backgroundColor: cooldown > 0 ? "#ddd" : "#1976d2",
        }}
      >
        {cooldown > 0 ? `Wait ${cooldown}s` : "Resend Verification Email"}
      </Button>
    </Box>
  );
}

export default VerifyPending;
