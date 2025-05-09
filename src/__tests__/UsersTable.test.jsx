import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, vi, expect, beforeEach } from "vitest";
import UsersTable from "../components/UsersTable"; // Adjust path as needed
import { toast } from "react-toastify";

// ✅ Mock external modules
vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  }
}));

vi.mock("firebase/firestore", () => ({
  doc: vi.fn(() => "docRef"),
  getDoc: vi.fn(),
  deleteDoc: vi.fn(),
  updateDoc: vi.fn(),
  arrayRemove: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({
    currentUser: { uid: "user1" }
  })),
  deleteUser: vi.fn(),
}));

// ✅ Sample users
const mockUsers = [
  {
    id: "user1",
    fullName: "Eyad Fageera",
    studentId: "4250001",
    email: "eyad@example.com",
    phone: "0551234567",
    role: "student",
  },
  {
    id: "admin1",
    fullName: "Admin User",
    email: "admin@example.com",
    role: "admin",
  },
];

describe("UsersTable Component", () => {
  const fetchUsersMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state", () => {
    render(<UsersTable users={[]} loading={true} fetchUsers={fetchUsersMock} />);
    expect(screen.getByText(/loading users/i)).toBeInTheDocument();
  });

  it("shows empty state when no users", () => {
    render(<UsersTable users={[]} loading={false} fetchUsers={fetchUsersMock} />);
    expect(screen.getByText(/no users found/i)).toBeInTheDocument();
  });

  it("renders users correctly", () => {
    render(<UsersTable users={mockUsers} loading={false} fetchUsers={fetchUsersMock} />);
    expect(screen.getByText("Eyad Fageera")).toBeInTheDocument();
    expect(screen.getByText("4250001")).toBeInTheDocument();
    expect(screen.getByText("eyad@example.com")).toBeInTheDocument();
    expect(screen.getByText("student")).toBeInTheDocument();
    expect(screen.getByText("Admin User")).toBeInTheDocument();
    expect(screen.getByText("Cannot Delete")).toBeInTheDocument();
  });

  it("does not allow deleting admin", () => {
    render(<UsersTable users={mockUsers} loading={false} fetchUsers={fetchUsersMock} />);
    expect(screen.queryByRole("button", { name: /delete/i })).toBeTruthy(); // only 1 for student
    expect(screen.queryByText(/cannot delete/i)).toBeInTheDocument();
  });

  it("calls confirm and then delete when clicking delete on a user", async () => {
    // mock confirmation dialog
    vi.stubGlobal("window", {
      confirm: vi.fn(() => true),
    });

    // Mock Firestore + Auth behavior
    const { getDoc, deleteDoc, updateDoc, arrayRemove } = await import("firebase/firestore");
    const { deleteUser } = await import("firebase/auth");

    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ teamId: "team1" }),
    });

    render(<UsersTable users={[mockUsers[0]]} loading={false} fetchUsers={fetchUsersMock} />);
    const deleteBtn = screen.getByRole("button");
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(getDoc).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalled();
      expect(arrayRemove).toHaveBeenCalled();
      expect(deleteDoc).toHaveBeenCalled();
      expect(deleteUser).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("User deleted successfully!");
    });
  });
});
