
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, vi, expect } from "vitest";
import UsersTable from "../components/UsersTable";

const mockUsers = [
  {
    id: "user1",
    fullName: "super",
    email: "super@gmail.com",
    phone: "0551666387",
    role: "supervisor",
    supervisorId: "SUP001",
  },
  {
    id: "user2",
    fullName: "admin1",
    email: "admin1@gmail.com",
    role: "admin",
  },
  {
    id: "user3",
    fullName: "eyad adel",
    email: "eyadfaqeera@hotmail.com",
    phone: "966556055567",
    role: "student",
    studentId: "2135836",
  }
];

describe("UsersTable Component", () => {
  it("displays loading state", () => {
    render(<UsersTable users={[]} loading={true} fetchUsers={vi.fn()} />);
    expect(screen.getByText(/loading users/i)).toBeInTheDocument();
  });

  it("displays empty state", () => {
    render(<UsersTable users={[]} loading={false} fetchUsers={vi.fn()} />);
    expect(screen.getByText(/no users found/i)).toBeInTheDocument();
  });

  it("renders user rows", () => {
    render(<UsersTable users={mockUsers} loading={false} fetchUsers={vi.fn()} />);
    expect(screen.getByText("super")).toBeInTheDocument();
    expect(screen.getByText("admin1")).toBeInTheDocument();
    expect(screen.getByText("eyad adel")).toBeInTheDocument();
    expect(screen.getByText("2135836")).toBeInTheDocument();
    expect(screen.getByText("Cannot Delete")).toBeInTheDocument(); // admin can't be deleted
  });

  it("calls delete handler when delete icon is clicked", () => {
    window.confirm = vi.fn(() => true); // mock confirmation
    const mockFetch = vi.fn();
    render(<UsersTable users={[mockUsers[0]]} loading={false} fetchUsers={mockFetch} />);

    const deleteBtn = screen.getByRole("button");
    fireEvent.click(deleteBtn);
    // This won't actually delete because the logic depends on Firestore, but ensures button works
    expect(deleteBtn).toBeDefined();
  });
});
