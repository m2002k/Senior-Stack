import React, { useState, useEffect } from 'react';
import { Typography, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { toast } from 'react-toastify';
import { auth, db } from '../services/firebase-config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import '../styles/StudentProfile.css';

const StudentProfile = ({ userData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    expertise: '',
    major: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData) {
      setProfile({
        fullName: userData.fullName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        expertise: userData.expertise || '',
        major: userData.major || '',
      });
      setLoading(false);
    }
  }, [userData]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(profile.email)) {
      toast.error("Invalid email format. Please enter a valid email address.");
      return;
    }

    // Phone number validation
    if (!/^\d{10}$/.test(profile.phone)) {
      toast.error("Invalid phone number: Phone number must be exactly 10 digits.");
      return;
    }

    // Major validation
    if (!profile.major) {
      toast.error("Please select your major.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("User not authenticated");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        expertise: profile.expertise,
        major: profile.major,
      });

      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handleCancel = () => {
    setProfile({
      fullName: userData.fullName || '',
      email: userData.email || '',
      phone: userData.phone || '',
      expertise: userData.expertise || '',
      major: userData.major || '',
    });
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <Typography variant="h4" component="h1" className="profile-title">
          Student Profile
        </Typography>
        {!isEditing ? (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Edit Profile
          </Button>
        ) : (
          <div>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              style={{ marginRight: '8px' }}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="form-container">
        <div>
          <Typography variant="subtitle1" className="field-label">
            Full Name
          </Typography>
          <input
            type="text"
            name="fullName"
            value={profile.fullName}
            onChange={handleChange}
            disabled={!isEditing}
            className="field-input"
          />
        </div>

        <div>
          <Typography variant="subtitle1" className="field-label">
            Email
          </Typography>
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            disabled={!isEditing}
            className="field-input"
          />
        </div>

        <div>
          <Typography variant="subtitle1" className="field-label">
            Phone Number
          </Typography>
          <input
            type="tel"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            disabled={!isEditing}
            className="field-input"
          />
        </div>

        <div>
          <Typography variant="subtitle1" className="field-label">
            Major
          </Typography>
          <FormControl fullWidth disabled={!isEditing}>
            <Select
              name="major"
              value={profile.major}
              onChange={handleChange}
              className="field-input"
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select your major
              </MenuItem>
              <MenuItem value="CS">Computer Science (CS)</MenuItem>
              <MenuItem value="IT">Information Technology (IT)</MenuItem>
              <MenuItem value="IS">Information Systems (IS)</MenuItem>
            </Select>
          </FormControl>
        </div>

        <div>
          <Typography variant="subtitle1" className="field-label">
            Areas of Expertise
          </Typography>
          <textarea
            name="expertise"
            value={profile.expertise}
            onChange={handleChange}
            disabled={!isEditing}
            className="field-input"
            rows={3}
          />
          <Typography variant="caption" className="helper-text">
            List your skills, technologies, or areas you excel in
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile; 