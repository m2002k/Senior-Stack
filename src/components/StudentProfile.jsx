import React, { useState, useEffect } from 'react';
import { Typography, Button, Select, MenuItem, FormControl } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { toast } from 'react-toastify';
import { auth, db } from '../services/firebase-config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import '../styles/StudentProfile.css';

const allSkills = [
  "React", "Firebase", "Node.js", "UI/UX", "Python",
  "Machine Learning", "Java", "C++", "Figma", "Git",
  "SQL", "MongoDB", "TypeScript", "Docker", "Network",
  "Linux", "REST APIs", "Agile", "Scrum", "PHP",
  "HTML", "CSS", "JavaScript"
];

const skillColors = {
  React: '#61dafb',
  Firebase: '#ffcb2b',
  'Node.js': '#68a063',
  'UI/UX': '#ff69b4',
  Python: '#3572A5',
  'Machine Learning': '#facc15',
  Java: '#f89820',
  'C++': '#004482',
  Figma: '#a259ff',
  Git: '#f1502f',
  SQL: '#4479a1',
  MongoDB: '#4db33d',
  TypeScript: '#3178c6',
  Docker: '#0db7ed',
  Network: '#326ce5',
  Linux: '#fbc02d',
  'REST APIs': '#10b981',
  Agile: '#f97316',
  Scrum: '#22d3ee',
  PHP: '#8993be',
  HTML: '#e44d26',
  CSS: '#264de4',
  JavaScript: '#f7df1e'
};

const StudentProfile = ({ userData, fetchUserData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    expertise: [],
    major: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData) {
      setProfile({
        fullName: userData.fullName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        expertise: userData.expertise || [],
        major: userData.major || '',
      });
      setLoading(false);
    }
  }, [userData]);

  const handleEdit = () => setIsEditing(true);

  const handleSave = async () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(profile.email)) {
      toast.error("Invalid email format.");
      return;
    }
    if (!/^\d{10}$/.test(profile.phone)) {
      toast.error("Phone number must be exactly 10 digits.");
      return;
    }
    if (!profile.major) {
      toast.error("Please select your major.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) return toast.error("User not authenticated");

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        expertise: profile.expertise,
        major: profile.major,
      });

      setIsEditing(false);
      if (typeof fetchUserData === 'function') {
        await fetchUserData();
      }
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    }
  };

  const handleCancel = () => {
    setProfile({
      fullName: userData.fullName || '',
      email: userData.email || '',
      phone: userData.phone || '',
      expertise: userData.expertise || [],
      major: userData.major || '',
    });
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const toggleSkill = (skill) => {
    setProfile(prev => ({
      ...prev,
      expertise: prev.expertise.includes(skill)
        ? prev.expertise.filter(s => s !== skill)
        : [...prev.expertise, skill],
    }));
  };

  if (loading) return <div>Loading profile...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <Typography variant="h4" className="profile-title">Student Profile</Typography>
        {!isEditing ? (
          <Button variant="contained" startIcon={<EditIcon />} onClick={handleEdit}>Edit Profile</Button>
        ) : (
          <div>
            <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={handleSave} style={{ marginRight: '8px' }}>Save</Button>
            <Button variant="outlined" color="error" startIcon={<CancelIcon />} onClick={handleCancel}>Cancel</Button>
          </div>
        )}
      </div>

      <div className="form-container">
        <div>
          <Typography variant="subtitle1" className="field-label">Full Name</Typography>
          <input type="text" name="fullName" value={profile.fullName} onChange={handleChange} disabled={!isEditing} className="field-input" />
        </div>

        <div>
          <Typography variant="subtitle1" className="field-label">Email</Typography>
          <input type="email" name="email" value={profile.email} onChange={handleChange} disabled={!isEditing} className="field-input" />
        </div>

        <div>
          <Typography variant="subtitle1" className="field-label">Phone Number</Typography>
          <input type="tel" name="phone" value={profile.phone} onChange={handleChange} disabled={!isEditing} className="field-input" />
        </div>

        <div>
          <Typography variant="subtitle1" className="field-label">Major</Typography>
          <FormControl fullWidth disabled={!isEditing}>
            <Select name="major" value={profile.major} onChange={handleChange} className="field-input" displayEmpty>
              <MenuItem value="" disabled>Select your major</MenuItem>
              <MenuItem value="CS">Computer Science (CS)</MenuItem>
              <MenuItem value="IT">Information Technology (IT)</MenuItem>
              <MenuItem value="IS">Information Systems (IS)</MenuItem>
            </Select>
          </FormControl>
        </div>

        <div>
          <Typography variant="subtitle1" className="field-label">Skills / Expertise</Typography>
          {isEditing ? (
            <div className="skills-selector">
              {allSkills.map(skill => (
                <button
                  key={skill}
                  type="button"
                  className={`skill-tag ${profile.expertise.includes(skill) ? 'selected' : ''}`}
                  onClick={() => toggleSkill(skill)}
                  style={{ backgroundColor: profile.expertise.includes(skill) ? skillColors[skill] : '#1e293b', color: '#fff' }}
                >
                  {skill}
                </button>
              ))}
            </div>
          ) : (
            <div className="readonly-skills">
              {profile.expertise.map(skill => (
                <span key={skill} className="skill-tag readonly" style={{ backgroundColor: skillColors[skill] || '#374151', color: '#fff' }}>{skill}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
