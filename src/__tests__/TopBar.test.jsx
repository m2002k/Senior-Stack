import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, vi, expect, beforeEach } from "vitest";
import TopBar from "../components/TopBar";
import { BrowserRouter } from "react-router-dom";

vi.mock("../services/firebase-config", () => ({
  auth: {
    signOut: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
  },
}));

import { auth } from "../services/firebase-config";
import { toast } from "react-toastify";

describe("TopBar Component", () => {
  beforeEach(() => {
    vi.clearAllMocks(); 
  });

  it("renders logo and title", () => {
    render(<TopBar />, { wrapper: BrowserRouter });

    expect(screen.getByAltText(/seniorstack logo/i)).toBeInTheDocument();
    expect(screen.getByText("SeniorStack")).toBeInTheDocument();
  });

  it("calls signOut and navigates on successful logout", async () => {
    auth.signOut.mockResolvedValueOnce(); 

    render(<TopBar />, { wrapper: BrowserRouter });

    fireEvent.click(screen.getByText("Logout"));

    expect(auth.signOut).toHaveBeenCalled();
    await Promise.resolve(); 
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("shows error toast on logout failure", async () => {
    const error = new Error("Failed logout");
    auth.signOut.mockRejectedValueOnce(error); 

    render(<TopBar />, { wrapper: BrowserRouter });

    fireEvent.click(screen.getByText("Logout"));

    await new Promise((resolve) => setTimeout(resolve, 0));
    
    expect(auth.signOut).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith("Failed to logout. Please try again.");
  });
});
