import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TeamTable from "../components/TeamTable"; // Adjust the path if needed

const mockTeams = [
  {
    id: "team1",
    teamName: "Alpha Team",
    projectTitle: "Smart Assistant",
    projectDescription: "AI-powered assistant for seniors.",
    supervisorName: "Dr. Omar",
    memberDetails: [
      { name: "Eyad", studentId: "4250001" },
      { name: "Osama", studentId: "4250002" },
    ],
  },
];

describe("TeamTable Component", () => {
  it("renders loading state", () => {
    render(<TeamTable loading={true} teams={[]} onDelete={vi.fn()} />);
    expect(screen.getByText(/loading teams/i)).toBeInTheDocument();
  });

  it("renders empty state", () => {
    render(<TeamTable loading={false} teams={[]} onDelete={vi.fn()} />);
    expect(screen.getByText(/no teams available/i)).toBeInTheDocument();
  });

  it("renders a team row with all fields", () => {
    render(<TeamTable loading={false} teams={mockTeams} onDelete={vi.fn()} />);
    expect(screen.getByText("Alpha Team")).toBeInTheDocument();
    expect(screen.getByText("Smart Assistant")).toBeInTheDocument();
    expect(screen.getByText("AI-powered assistant for seniors.")).toBeInTheDocument();
    expect(screen.getByText("Dr. Omar")).toBeInTheDocument();
    expect(screen.getByText((_, el) => el.textContent === "Eyad (4250001)")).toBeInTheDocument();
    expect(screen.getByText((_, el) => el.textContent === "Osama (4250002)")).toBeInTheDocument();
  });

  it("calls onDelete when delete icon is clicked", () => {
    const onDeleteMock = vi.fn();
    render(<TeamTable loading={false} teams={mockTeams} onDelete={onDeleteMock} />);
    const deleteButton = screen.getByRole("button");
    fireEvent.click(deleteButton);
    expect(onDeleteMock).toHaveBeenCalledWith("team1");
  });

  it("renders 'No Supervisor' if supervisorName is missing", () => {
    const teamWithoutSupervisor = {
      ...mockTeams[0],
      supervisorName: undefined,
      id: "team2",
    };

    render(<TeamTable loading={false} teams={[teamWithoutSupervisor]} onDelete={vi.fn()} />);
    expect(screen.getByText("No Supervisor")).toBeInTheDocument();
  });

  it("renders no members if memberDetails is empty", () => {
    const teamWithoutMembers = {
      ...mockTeams[0],
      memberDetails: [],
      id: "team3",
    };

    render(<TeamTable loading={false} teams={[teamWithoutMembers]} onDelete={vi.fn()} />);
    const list = screen.getByRole("list");
    const items = screen.queryAllByRole("listitem");
    expect(list).toBeInTheDocument();
    expect(items.length).toBe(0);
  });

  it("renders members even with missing name or studentId", () => {
    const malformedMembers = [
      { name: "Eyad" }, // missing ID
      { studentId: "4259999" }, // missing name
    ];

    const teamWithMalformed = {
      ...mockTeams[0],
      memberDetails: malformedMembers,
      id: "team4",
    };

    render(<TeamTable loading={false} teams={[teamWithMalformed]} onDelete={vi.fn()} />);

    expect(
      screen.getAllByText((_, el) => el.textContent?.includes("Eyad")).some(Boolean)
    ).toBe(true);

    expect(
      screen.getAllByText((_, el) => el.textContent?.includes("4259999")).some(Boolean)
    ).toBe(true);
  });
});
