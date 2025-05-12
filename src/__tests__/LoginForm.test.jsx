import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoginForm from "../components/LoginForm";

describe("LoginForm Component", () => {
  const mockSubmit = vi.fn();
  const setEmail = vi.fn();
  const setPassword = vi.fn();

  const renderForm = (props = {}) =>
    render(
      <MemoryRouter>
        <LoginForm
          email="super@gmail.com"
          password="super1"
          setEmail={setEmail}
          setPassword={setPassword}
          onSubmit={mockSubmit}
          {...props}
        />
      </MemoryRouter>
    );

  it("renders email and password fields", () => {
    renderForm();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("calls onSubmit when login button is clicked", () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    expect(mockSubmit).toHaveBeenCalled();
  });

  it("opens and closes reset password dialog", () => {
    renderForm();
    fireEvent.click(screen.getByText(/reset it here/i));
    expect(screen.getByText(/reset password/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByText(/reset password/i)).not.toBeVisible(); // or .not.toBeInTheDocument() after transition
  });
});