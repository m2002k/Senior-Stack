import { Box, TextField, Button, Typography, MenuItem } from "@mui/material";

function RegisterForm({
  fullName,
  studentId,
  phone,
  email,
  password,
  confPassword,
  role,
  setFullName,
  setStudentId,
  setPhone,
  setEmail,
  setPassword,
  setConfPassword,
  setRole,
  onSubmit,
  loading,
}) {
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
          maxWidth: 450,
          width: "90%",
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
          bgcolor: "#1e1e1e",
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Register
        </Typography>

        <TextField sx={textFieldStyle}
          label="Full Name"
          fullWidth
          margin="normal"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <TextField sx={textFieldStyle}
          label="Student ID"
          fullWidth
          margin="normal"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />

        <TextField sx={textFieldStyle}
          label="Phone Number"
          fullWidth
          margin="normal"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <TextField sx={textFieldStyle}
          label="Email"
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

        <TextField sx={textFieldStyle}
          label="Confirm Password"
          type="password"
          fullWidth
          margin="normal"
          value={confPassword}
          onChange={(e) => setConfPassword(e.target.value)}
        />

        <TextField sx={textFieldStyle}
          select
          fullWidth
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          margin="normal"
        >
          <MenuItem value="student">Student</MenuItem>
          <MenuItem value="supervisor">Supervisor</MenuItem>
        </TextField>

        <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            onClick={onSubmit}
            disabled={loading}
        >
            {loading ? "Registering..." : "Register"}
        </Button>

      </Box>
    </Box>
  );
}

export default RegisterForm;
