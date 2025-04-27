import { useState } from "react";
import { db, auth } from "../services/firebase-config"; 
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../styles/CreateTeamView.css";

const CreateTeamView = () => {
  const [teamName, setTeamName] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const teamsRef = collection(db, "teams");

    
      const teamDocRef = await addDoc(teamsRef, {
        teamName,
        projectTitle,
        projectDescription,
        createdBy: auth.currentUser.uid,
        teamMembers: [auth.currentUser.uid],
        maxTeamSize: 3,
        createdAt: new Date()
      });

      
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userDocRef, {
        teamId: teamDocRef.id, 
      });

      await fetchUserData();

      toast.success("Team created successfully! 🎉");
      
      setTimeout(() => {
        navigate("/dashboard"); 
      }, 1500);
      

      setTeamName("");
      setProjectTitle("");
      setProjectDescription("");
      
    } catch (error) {
      console.error("Error creating team:", error);
      toast.error("Failed to create team. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-team-view">
      <h2>Create Your Team</h2>
      <form className="create-team-form" onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Team Name" 
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          required 
        />
        <input 
          type="text" 
          placeholder="Project Title" 
          value={projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
          required 
        />
        <textarea 
          placeholder="Project Description" 
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Team"}
        </button>
      </form>
    </div>
  );
};

export default CreateTeamView;
