import React, { useState } from 'react';
import { Box, TextField, Button, Typography, MenuItem } from "@mui/material";
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase-config';

function RegisterForm({
  fullName,
  studentId,
  phone,
  email,
  password,
  confPassword,
  major,
  setFullName,
  setStudentId,
  setPhone,
  setEmail,
  setPassword,
  setConfPassword,
  setMajor,
  onSubmit,
  loading,
}) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    department: '',
    role: 'student'
  });

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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
        padding: "20px 0",
      }}
    >
      <Box
        sx={{
          maxWidth: 450,
          width: "90%",
          p: 4,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          borderRadius: 2,
          bgcolor: "#ffffff",
          maxHeight: "90vh",
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f5f5f5",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#e0e0e0",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#bdbdbd",
          },
        }}
      >
        <Typography variant="h4" align="center" gutterBottom sx={{ color: "#2c3e50" }}>
          Register
        </Typography>

        <TextField
          sx={textFieldStyle}
          label="Full Name"
          fullWidth
          margin="normal"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <TextField
          sx={textFieldStyle}
          label="Student ID"
          fullWidth
          margin="normal"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />

        <div className="form-group">
          <label htmlFor="phone" style={{ color: "#546e7a" }}>Phone Number</label>
          <PhoneInput
            country={"sa"}
            value={phone}
            onChange={setPhone}
            inputStyle={{
              width: "100%",
              height: "40px",
              paddingLeft: "48px",
              backgroundColor: "transparent",
              color: "#2c3e50",
              border: "1px solid #e0e0e0",
            }}
            containerStyle={{
              marginBottom: "20px",
            }}
            buttonStyle={{
              backgroundColor: "transparent",
              border: "1px solid #e0e0e0",
            }}
            dropdownStyle={{
              backgroundColor: "#ffffff",
              color: "#2c3e50",
            }}
          />
        </div>

        <TextField
          sx={textFieldStyle}
          label="Email"
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

        <TextField
          sx={textFieldStyle}
          label="Confirm Password"
          type="password"
          fullWidth
          margin="normal"
          value={confPassword}
          onChange={(e) => setConfPassword(e.target.value)}
        />

        <TextField
          sx={textFieldStyle}
          select
          fullWidth
          label="Major"
          value={major}
          onChange={(e) => setMajor(e.target.value)}
          margin="normal"
        >
          <MenuItem value="CS">Computer Science (CS)</MenuItem>
          <MenuItem value="IT">Information Technology (IT)</MenuItem>
          <MenuItem value="IS">Information Systems (IS)</MenuItem>
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
