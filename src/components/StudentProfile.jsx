import React, { useState } from 'react';
import { Typography, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { toast } from 'react-toastify';
import '../styles/StudentProfile.css'; 

const StudentProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    expertise: '',
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
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

    // save functionality when backend is ready
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
            name="name"
            value={profile.name}
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