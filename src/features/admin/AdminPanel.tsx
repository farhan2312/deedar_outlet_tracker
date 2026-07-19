"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { C } from "@/features/outlet-tracker/constants";

interface AdminUser {
  id: string;
  name: string;
  phone: string;
  role: "user" | "admin";
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export function AdminPanel({ adminName }: { adminName: string }) {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
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

  async function setStatus(id: string, status: "approved" | "rejected") {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed.");
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status } : u)),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  const pending = users.filter((u) => u.status === "pending");
  const approved = users.filter((u) => u.status === "approved");
  const rejected = users.filter((u) => u.status === "rejected");

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: C.cream,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        className="dz-shell"
        style={{
          width: "100%",
          minHeight: "100dvh",
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
              Admin · Access Requests
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
                    <UserRow key={u.id} user={u}>
                      <button
                        onClick={() => setStatus(u.id, "approved")}
                        disabled={busyId === u.id}
                        className="dz-tap"
                        style={pillBtn(C.green, "#fff")}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setStatus(u.id, "rejected")}
                        disabled={busyId === u.id}
                        className="dz-tap"
                        style={pillBtn("#fff", C.danger, C.dangerBorder)}
                      >
                        Reject
                      </button>
                    </UserRow>
                  ))
                )}
              </Section>

              <Section title={`Approved (${approved.length})`}>
                {approved.length === 0 ? (
                  <Empty>No approved users yet.</Empty>
                ) : (
                  approved.map((u) => (
                    <UserRow key={u.id} user={u}>
                      {u.role === "admin" ? (
                        <span style={{ ...tag(C.goldBg, C.gold) }}>ADMIN</span>
                      ) : (
                        <button
                          onClick={() => setStatus(u.id, "rejected")}
                          disabled={busyId === u.id}
                          className="dz-tap"
                          style={pillBtn("#fff", C.danger, C.dangerBorder)}
                        >
                          Revoke
                        </button>
                      )}
                    </UserRow>
                  ))
                )}
              </Section>

              {rejected.length > 0 ? (
                <Section title={`Rejected (${rejected.length})`}>
                  {rejected.map((u) => (
                    <UserRow key={u.id} user={u}>
                      <button
                        onClick={() => setStatus(u.id, "approved")}
                        disabled={busyId === u.id}
                        className="dz-tap"
                        style={pillBtn(C.green, "#fff")}
                      >
                        Approve
                      </button>
                    </UserRow>
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

function UserRow({
  user,
  children,
}: {
  user: AdminUser;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: 14,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>
          {user.name}
        </div>
        <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>
          {user.phone}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>{children}</div>
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
    padding: "6px 10px",
    borderRadius: 6,
    background: bg,
    color: fg,
    letterSpacing: 0.5,
  };
}
