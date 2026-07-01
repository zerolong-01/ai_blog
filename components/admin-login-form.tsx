"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { type AdminAuthState, loginAdminAction } from "@/app/admin/actions";

const initialState: AdminAuthState = {
  error: null
};

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="primaryButton" disabled={pending}>
      {pending ? "Signing in..." : "Sign in"}
    </button>
  );
}

export function AdminLoginForm() {
  const [state, formAction] = useActionState(loginAdminAction, initialState);

  return (
    <form action={formAction} className="adminLoginForm">
      <label className="fieldGroup fieldSpanFull">
        <span>Admin password</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {state.error ? <p className="formError">{state.error}</p> : null}
      <LoginButton />
    </form>
  );
}
