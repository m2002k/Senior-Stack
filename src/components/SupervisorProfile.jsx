import React, { useState, useEffect } from 'react';
import { Typography, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { toast } from 'react-toastify';
import { auth, db } from '../services/firebase-config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import '../styles/SupervisorProfile.css';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const SupervisorProfile = ({ userData, fetchUserData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    supervisorId: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData) {
      setProfile({
        name: userData.name || '',
        supervisorId: userData.supervisorId || '',
        email: userData.email || '',
        phone: userData.phone || ''
      });
      setLoading(false);
    }
  }, [userData]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!profile.name || !profile.email || !profile.phone) {
      toast.error("Please fill in all fields");
      return;
    }

    
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(profile.name)) {
      toast.error("Invalid name: Name can only contain letters and spaces.");
      return;
    }

   
    if (!profile.phone) {
      toast.error("Phone number is required");
      return;
    }
    
    
    const cleanPhone = profile.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      toast.error("Invalid phone number: Please enter a valid phone number");
      return;
    }

    try {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userDocRef, {
        name: profile.name,
        supervisorId: profile.supervisorId,
        email: profile.email,
        phone: profile.phone
      });

      
      setProfile(prev => ({
        ...prev,
        name: profile.name,
        supervisorId: profile.supervisorId,
        email: profile.email,
        phone: profile.phone
      }));
      
      setIsEditing(false);
      
      
      try {
        await fetchUserData();
      } catch (fetchError) {
        console.error("Error fetching updated data:", fetchError);
      }
      
      toast.success('Profile updated successfully! ✅');
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setProfile({
      name: userData.name || '',
      supervisorId: userData.supervisorId || '',
      email: userData.email || '',
      phone: userData.phone || ''
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
          Supervisor Profile
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
            Name
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
            Supervisor ID
          </Typography>
          <input
            type="text"
            name="supervisorId"
            value={profile.supervisorId}
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

        <div className="form-group">
          <label htmlFor="phone" style={{ color: "#1e293b" }}>Phone Number</label>
          <PhoneInput
            country={'sa'}
            value={profile.phone}
            onChange={phone => setProfile({ ...profile, phone })}
            disabled={!isEditing}
            inputStyle={{
              width: '100%',
              height: '40px',
              paddingLeft: '48px',
              backgroundColor: 'transparent',
              color: 'black',
              border: '1px solid gray',
              opacity: !isEditing ? 0.7 : 1
            }}
            containerStyle={{
              marginBottom: '20px'
            }}
            buttonStyle={{
              backgroundColor: 'transparent',
              border: '1px solid gray',
              opacity: !isEditing ? 0.7 : 1
            }}
            dropdownStyle={{
              backgroundColor: '#1e1e1e',
              color: 'white'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SupervisorProfile; 