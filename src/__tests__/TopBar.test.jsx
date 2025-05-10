import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, vi, expect, beforeEach } from "vitest";
import TopBar from "../components/TopBar"; // Adjust the path if needed
import { BrowserRouter } from "react-router-dom";

// 🧪 Mock Firebase auth
vi.mock("../services/firebase-config", () => ({
  auth: {
    signOut: vi.fn(),
  },
}));

// 🧪 Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// 🧪 Mock react-toastify
vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
  },
}));

// ✅ Import AFTER mocks
import { auth } from "../services/firebase-config";
import { toast } from "react-toastify";

describe("TopBar Component", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // 🔄 Reset mocks before each test
  });

  it("renders logo and title", () => {
    render(<TopBar />, { wrapper: BrowserRouter });

    expect(screen.getByAltText(/seniorstack logo/i)).toBeInTheDocument();
    expect(screen.getByText("SeniorStack")).toBeInTheDocument();
  });

  it("calls signOut and navigates on successful logout", async () => {
    auth.signOut.mockResolvedValueOnce(); // ✅ Mock success

    render(<TopBar />, { wrapper: BrowserRouter });

    fireEvent.click(screen.getByText("Logout"));

    expect(auth.signOut).toHaveBeenCalled();
    await Promise.resolve(); // Allow promise to resolve
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("shows error toast on logout failure", async () => {
    const error = new Error("Failed logout");
    auth.signOut.mockRejectedValueOnce(error); // ❌ Mock failure

    render(<TopBar />, { wrapper: BrowserRouter });

    fireEvent.click(screen.getByText("Logout"));

    // Wait for the async actions to complete
    await new Promise((resolve) => setTimeout(resolve, 0));
    
    // Assertions
    expect(auth.signOut).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith("Failed to logout. Please try again.");
  });
});
