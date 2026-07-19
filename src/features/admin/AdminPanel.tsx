"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { C, USER_DIVISIONS } from "@/features/outlet-tracker/constants";
import { Button, Field, Select, TextInput } from "@/features/outlet-tracker/ui";

type Role = "field_rep" | "admin";
type Status = "pending" | "approved" | "rejected";

interface AdminUser {
  id: string;
  name: string;
  phone: string;
  division: string;
  role: Role;
  status: Status;
  createdAt: string;
}

function roleLabel(role: Role): string {
  return role === "admin" ? "Admin" : "Field Rep";
}

interface PatchResult {
  ok: boolean;
  error?: string;
}

export function AdminPanel({ adminName }: { adminName: string }) {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load users.");
      setUsers(data.users);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const patchUser = useCallback(
    async (id: string, body: Record<string, unknown>): Promise<PatchResult> => {
      try {
        const res = await fetch(`/api/admin/users/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) return { ok: false, error: data.error ?? "Update failed." };
        setUsers((prev) => prev.map((u) => (u.id === id ? data.user : u)));
        return { ok: true };
      } catch {
        return { ok: false, error: "Something went wrong." };
      }
    },
    [],
  );

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  function onUserCreated(user: AdminUser) {
    setUsers((prev) => [user, ...prev]);
  }

  const pending = users.filter((u) => u.status === "pending");
  const approved = users.filter((u) => u.status === "approved");
  const rejected = users.filter((u) => u.status === "rejected");

  return (
    <div
      style={{
        minHeight: "100svh",
        background: C.cream,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        className="dz-shell"
        style={{
          width: "100%",
          minHeight: "100svh",
          background: C.panel,
          boxShadow: "0 0 40px rgba(0,0,0,0.08)",
        }}
      >
        <header
          style={{
            background: C.green,
            color: "#fff",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: C.gold,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 15,
                color: C.green,
              }}
            >
              D
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              Admin · Users &amp; Access
            </div>
          </div>
          <Link
            href="/"
            style={{ fontSize: 12, color: C.greenTint, fontWeight: 600 }}
          >
            App
          </Link>
          <button
            onClick={logout}
            className="dz-tap"
            style={{
              fontSize: 12,
              color: C.greenTint,
              cursor: "pointer",
              textDecoration: "underline",
              background: "none",
              border: "none",
            }}
          >
            Logout
          </button>
        </header>

        <main style={{ padding: 20, paddingBottom: 90 }}>
          <div style={{ fontSize: 13, color: C.sub, marginBottom: 2 }}>
            Signed in as
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 20,
              color: C.ink,
              marginBottom: 18,
            }}
          >
            {adminName}
          </div>

          <AddUserForm onCreated={onUserCreated} />

          {error ? (
            <div
              style={{
                background: C.dangerBg,
                border: `1px solid ${C.dangerBorder}`,
                color: C.danger,
                fontSize: 13,
                borderRadius: 10,
                padding: 12,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          ) : null}

          {loading ? (
            <div style={{ fontSize: 13, color: C.sub }}>Loading…</div>
          ) : (
            <>
              <Section title={`Pending (${pending.length})`}>
                {pending.length === 0 ? (
                  <Empty>No pending requests.</Empty>
                ) : (
                  pending.map((u) => (
                    <UserCard key={u.id} user={u} patchUser={patchUser} />
                  ))
                )}
              </Section>

              <Section title={`Approved (${approved.length})`}>
                {approved.length === 0 ? (
                  <Empty>No approved users yet.</Empty>
                ) : (
                  approved.map((u) => (
                    <UserCard key={u.id} user={u} patchUser={patchUser} />
                  ))
                )}
              </Section>

              {rejected.length > 0 ? (
                <Section title={`Rejected (${rejected.length})`}>
                  {rejected.map((u) => (
                    <UserCard key={u.id} user={u} patchUser={patchUser} />
                  ))}
                </Section>
              ) : null}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function UserCard({
  user,
  patchUser,
}: {
  user: AdminUser;
  patchUser: (id: string, body: Record<string, unknown>) => Promise<PatchResult>;
}) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function quick(status: Status) {
    setBusy(true);
    setError("");
    const res = await patchUser(user.id, { status });
    if (!res.ok) setError(res.error ?? "Update failed.");
    setBusy(false);
  }

  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>
              {user.name}
            </span>
            <span
              style={tag(
                user.role === "admin" ? C.goldBg : C.greenBg,
                user.role === "admin" ? C.gold : C.green,
              )}
            >
              {roleLabel(user.role)}
            </span>
          </div>
          <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>
            {user.phone}
            {user.division ? ` · ${user.division}` : ""}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {user.status === "pending" ? (
            <>
              <button
                onClick={() => quick("approved")}
                disabled={busy}
                className="dz-tap"
                style={pillBtn(C.green, "#fff")}
              >
                Approve
              </button>
              <button
                onClick={() => quick("rejected")}
                disabled={busy}
                className="dz-tap"
                style={pillBtn("#fff", C.danger, C.dangerBorder)}
              >
                Reject
              </button>
            </>
          ) : null}
          {user.status === "approved" ? (
            <button
              onClick={() => quick("rejected")}
              disabled={busy}
              className="dz-tap"
              style={pillBtn("#fff", C.danger, C.dangerBorder)}
            >
              Revoke
            </button>
          ) : null}
          {user.status === "rejected" ? (
            <button
              onClick={() => quick("approved")}
              disabled={busy}
              className="dz-tap"
              style={pillBtn(C.green, "#fff")}
            >
              Approve
            </button>
          ) : null}
          <button
            onClick={() => setEditing((v) => !v)}
            disabled={busy}
            className="dz-tap"
            style={pillBtn("#fff", C.ink, C.border)}
          >
            {editing ? "Close" : "Edit"}
          </button>
        </div>
      </div>

      {error ? (
        <div style={{ fontSize: 12, color: C.danger, marginTop: 8 }}>
          {error}
        </div>
      ) : null}

      {editing ? (
        <EditUserForm
          user={user}
          patchUser={patchUser}
          onDone={() => setEditing(false)}
        />
      ) : null}
    </div>
  );
}

function EditUserForm({
  user,
  patchUser,
  onDone,
}: {
  user: AdminUser;
  patchUser: (id: string, body: Record<string, unknown>) => Promise<PatchResult>;
  onDone: () => void;
}) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [role, setRole] = useState<Role>(user.role);
  const [division, setDivision] = useState(user.division);
  const [status, setStatus] = useState<Status>(user.status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await patchUser(user.id, {
      name,
      phone,
      role,
      division: role === "admin" ? "" : division,
      status,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Update failed.");
      return;
    }
    onDone();
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{
        marginTop: 14,
        paddingTop: 14,
        borderTop: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <Field label="Full Name">
        <TextInput value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Mobile Number">
        <TextInput
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))
          }
        />
      </Field>
      <Field label="Role">
        <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
          <option value="field_rep">Field Rep</option>
          <option value="admin">Admin</option>
        </Select>
      </Field>
      {role === "field_rep" ? (
        <Field label="Division">
          <Select
            value={division}
            onChange={(e) => setDivision(e.target.value)}
          >
            <option value="">Select</option>
            {USER_DIVISIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}
      <Field label="Access">
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as Status)}
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </Select>
      </Field>

      {error ? <div style={{ fontSize: 12, color: C.danger }}>{error}</div> : null}

      <div style={{ display: "flex", gap: 8 }}>
        <Button variant="ghost" onClick={onDone} style={{ flex: 1 }}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy} style={{ flex: 1 }}>
          {busy ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}

function AddUserForm({ onCreated }: { onCreated: (user: AdminUser) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>("field_rep");
  const [division, setDivision] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, role, division, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create user.");
        return;
      }
      onCreated(data.user);
      setSuccess(
        `Created ${name} (${phone}). Temporary password: ${password || phone} — they'll be asked to set a new one on first login.`,
      );
      setName("");
      setPhone("");
      setRole("field_rep");
      setDivision("");
      setPassword("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: 14,
        marginBottom: 20,
      }}
    >
      <div
        onClick={() => setOpen((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>
          Add User
        </div>
        <div style={{ fontSize: 12, color: C.green, fontWeight: 700 }}>
          {open ? "Close" : "+ Add"}
        </div>
      </div>

      {open ? (
        <form
          onSubmit={onSubmit}
          style={{
            marginTop: 14,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <Field label="Full Name">
            <TextInput value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Mobile Number">
            <TextInput
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))
              }
              placeholder="10-digit mobile number"
            />
          </Field>
          <Field label="Role">
            <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="field_rep">Field Rep</option>
              <option value="admin">Admin</option>
            </Select>
          </Field>
          {role === "field_rep" ? (
            <Field label="Division">
              <Select
                value={division}
                onChange={(e) => setDivision(e.target.value)}
              >
                <option value="">Select</option>
                {USER_DIVISIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </Field>
          ) : null}
          <Field label="Temporary Password (optional)">
            <TextInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Defaults to mobile number if left blank"
            />
          </Field>

          {error ? (
            <div style={{ fontSize: 12, color: C.danger }}>{error}</div>
          ) : null}
          {success ? (
            <div style={{ fontSize: 12, color: C.green }}>{success}</div>
          ) : null}

          <Button type="submit" disabled={busy}>
            {busy ? "Creating…" : "Create User"}
          </Button>
        </form>
      ) : null}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: C.sub,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 13, color: C.muted }}>{children}</div>;
}

function pillBtn(bg: string, fg: string, border?: string) {
  return {
    padding: "8px 14px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    background: bg,
    color: fg,
    border: `1px solid ${border ?? bg}`,
  };
}

function tag(bg: string, fg: string) {
  return {
    fontSize: 10,
    fontWeight: 700,
    padding: "4px 8px",
    borderRadius: 6,
    background: bg,
    color: fg,
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
  };
}
