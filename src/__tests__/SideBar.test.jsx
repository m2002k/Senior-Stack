import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SideBar from "../components/SideBar"; 

describe("SideBar Component", () => {
  const setup = (type = "student", activeTab = "", setActiveTab = vi.fn()) => {
    render(<SideBar type={type} activeTab={activeTab} setActiveTab={setActiveTab} />);
    return { setActiveTab };
  };

  it("renders student tabs", () => {
    setup("student");
    expect(screen.getByText("Progress")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("My Team")).toBeInTheDocument();
    expect(screen.getByText("Calendar")).toBeInTheDocument();
  });

  it("renders supervisor tabs", () => {
    setup("supervisor");
    expect(screen.getByText("Assigned Teams")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Calendar")).toBeInTheDocument();
  });

  it("renders admin tabs", () => {
    setup("admin");
    expect(screen.getByText("Manage Users")).toBeInTheDocument();
    expect(screen.getByText("Manage Teams")).toBeInTheDocument();
    expect(screen.getByText("Manage Tasks")).toBeInTheDocument();
    expect(screen.getByText("Calendar")).toBeInTheDocument();
  });

  it("calls setActiveTab when a tab is clicked", () => {
    const { setActiveTab } = setup("student");
    fireEvent.click(screen.getByText("Profile"));
    expect(setActiveTab).toHaveBeenCalledWith("profile");
  });

  it("applies 'active' class to the selected tab", () => {
    setup("student", "profile");
    const profileTab = screen.getByText("Profile");
    expect(profileTab.className).toMatch(/active/);
  });
});
