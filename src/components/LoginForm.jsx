import { Box, Button, TextField, Typography, Link as MuiLink } from "@mui/material";
import { Link } from "react-router-dom";
import seniorStackLogo from "../Assets/Senior-Stack_Logo.png";

function LoginForm({ email, password, setEmail, setPassword, onSubmit }) {
  const textFieldStyle = {
    mt: 2,
    "& .MuiInputBase-input": {
      color: "white", // input text
    },
    "& .MuiInputLabel-root": {
      color: "gray", // label
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "gray", // border
      },
      "&:hover fieldset": {
        borderColor: "white", // border on hover
      },
      "&.Mui-focused fieldset": {
        borderColor: "#ffffff", // border on focus
      },
    }
  };
  
  return (
    <Box
      sx={{
        height: "100vh",              
        display: "flex",
        alignItems: "center",          
        justifyContent: "center",      
        backgroundColor: "#121212",   
      }}
    >
      <Box
        sx={{
          maxWidth: 400,
          width: "90%",
          p: 3,
          boxShadow: 3,
          borderRadius: 2,
          bgcolor: "#1e1e1e",
          textAlign: "center",
        }}
      >
        <img src={seniorStackLogo} alt="SeniorStack Logo" width="150" />
        <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
          Welcome to SeniorStack
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Please log in
        </Typography>

        <TextField   sx={textFieldStyle}
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField sx={textFieldStyle}
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Typography variant="body2" sx={{ mt: 2, }}>
          Don’t have an account?{" "}
          <MuiLink component={Link} to="/register">
            Register here
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
      </Box>
    </Box>
  );
}

export default LoginForm;
