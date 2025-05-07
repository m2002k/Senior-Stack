import { Box, Button, TextField, Typography, Link as MuiLink, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Link } from "react-router-dom";
import seniorStackLogo from "../Assets/Senior-Stack_Logo.png";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../services/firebase-config";
import { toast } from "react-toastify";
import { useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";

function LoginForm({ email, password, setEmail, setPassword, onSubmit }) {
  const [resetEmail, setResetEmail] = useState("");
  const [openResetDialog, setOpenResetDialog] = useState(false);

  const textFieldStyle = {
    mt: 2,
    "& .MuiInputBase-input": {
      color: "#2c3e50",
    },
    "& .MuiInputLabel-root": {
      color: "#546e7a",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#e0e0e0",
      },
      "&:hover fieldset": {
        borderColor: "#1976d2",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#1976d2",
      },
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast.error("Please enter your email address");
      return;
    }

    try {
     
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", resetEmail));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("No account found with this email address.");
        return;
      }

      
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success("Password reset email sent! Please check your inbox.");
      setOpenResetDialog(false);
      setResetEmail("");
    } catch (error) {
      console.error("Error sending reset email:", error);
      let errorMessage = "Failed to send reset email.";
      
      
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email address.";
          break;
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many attempts. Please try again later.";
          break;
        default:
          errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };

  const handleOpenResetDialog = () => {
    setOpenResetDialog(true);
  };

  const handleCloseResetDialog = () => {
    setOpenResetDialog(false);
    setResetEmail("");
  };
  
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Box
        sx={{
          maxWidth: 400,
          width: "90%",
          p: 3,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          borderRadius: 2,
          bgcolor: "#ffffff",
          textAlign: "center",
        }}
      >
        <img src={seniorStackLogo} alt="SeniorStack Logo" width="150" />
        <Typography variant="h5" sx={{ mt: 2, mb: 1, color: "#2c3e50" }}>
          Welcome to SeniorStack
        </Typography>
        <Typography variant="subtitle1" gutterBottom sx={{ color: "#546e7a" }}>
          Please log in
        </Typography>

        <TextField
          sx={textFieldStyle}
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          sx={textFieldStyle}
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Typography variant="body2" sx={{ mt: 2, mb: 1, color: "#546e7a" }}>
          Don't have an account?{" "}
          <MuiLink component={Link} to="/register" sx={{ color: "#1976d2" }}>
            Register here
          </MuiLink>
        </Typography>

        <Typography variant="body2" sx={{ mb: 2, color: "#546e7a" }}>
          Forgot your password?{" "}
          <MuiLink
            component="button"
            onClick={handleOpenResetDialog}
            sx={{
              cursor: "pointer",
              border: "none",
              background: "none",
              color: "#1976d2",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Reset it here
          </MuiLink>
        </Typography>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
          onClick={onSubmit}
        >
          Login
        </Button>

        <Dialog
          open={openResetDialog}
          onClose={handleCloseResetDialog}
          PaperProps={{
            sx: {
              bgcolor: "#ffffff",
              color: "#2c3e50",
            },
          }}
        >
          <DialogTitle>Reset Password</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Email Address"
              type="email"
              fullWidth
              variant="outlined"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              sx={textFieldStyle}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseResetDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={handleResetPassword} color="primary" variant="contained">
              Send Reset Link
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default LoginForm;
