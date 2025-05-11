
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TeamTable from "../components/TeamTable";

Object.defineProperty(window, "open", {
  value: vi.fn(),
  writable: true,
});

const mockTeams = [
  {
    id: "team1",
    teamName: "tst",
    projectTitle: "testing",
    projectDescription: "just for testing",
    supervisorId: "super123",
    memberDetails: [
      { name: "Eyad", studentId: "2135836" },
    ],
    submitted_task: [],
  },
];

describe("TeamTable Component (Latest)", () => {
  it("renders loading state", () => {
    render(<TeamTable loading={true} teams={[]} onDelete={vi.fn()} />);
    expect(screen.getByText(/loading teams/i)).toBeInTheDocument();
  });

  it("renders empty state", () => {
    render(<TeamTable loading={false} teams={[]} onDelete={vi.fn()} />);
    expect(screen.getByText(/no teams available/i)).toBeInTheDocument();
  });

  it("renders a team row correctly", () => {
    render(<TeamTable loading={false} teams={mockTeams} onDelete={vi.fn()} />);
    expect(screen.getByText("tst")).toBeInTheDocument();
    expect(screen.getByText("testing")).toBeInTheDocument();
    expect(screen.getByText("just for testing")).toBeInTheDocument();
    expect(screen.getByText((_, el) => el.textContent.includes("Eyad"))).toBeTruthy();
    expect(screen.getByText((_, el) => el.textContent.includes("2135836"))).toBeTruthy();
  });

  it("calls onDelete when delete icon is clicked", () => {
    const onDeleteMock = vi.fn();
    render(<TeamTable loading={false} teams={mockTeams} onDelete={onDeleteMock} />);
    const deleteBtn = screen.getByRole("button", { hidden: true });
    fireEvent.click(deleteBtn);
    expect(onDeleteMock).toHaveBeenCalledWith("team1");
  });

  it("opens task dialog when team name is clicked", async () => {
    render(<TeamTable loading={false} teams={mockTeams} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /tst/i }));
    await waitFor(() => {
      expect(screen.getByText(/submitted tasks/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/no tasks submitted yet/i)).toBeInTheDocument();
  });
});