import React, { useEffect, useState } from "react";
import { auth, db } from "../services/firebase-config";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const snapshot = await getDocs(collection(db, "teams"));
      const currentSupervisorId = auth.currentUser?.uid;

      const filteredProjects = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();

        if (data.supervisorId === currentSupervisorId) {
          // Optionally fetch full student names from `users` collection
          const memberNames = await Promise.all(
            (data.teamMembers || []).map(async (uid) => {
              const userDoc = await getDoc(doc(db, "users", uid));
              return userDoc.exists() ? userDoc.data().fullName : "Unknown";
            })
          );

          filteredProjects.push({
            id: docSnap.id,
            ...data,
            memberNames,
          });
        }
      }

      setProjects(filteredProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="projects-container">
      <h1>My Supervised Projects</h1>
      {loading ? (
        <p>Loading...</p>
      ) : projects.length === 0 ? (
      <p>No projects assigned to you.</p>
    ) : (
      <div className="projects-list">
        {projects.map((project) => (
          <div key={project.id} className="project-item">
            <h2>{project.name}</h2>
            <p>{project.description}</p>
            <p>Due Date: {project.dueDate}</p>
          </div>
        ))}
      </div>)}
    </div>
  );
};

export default Projects;
