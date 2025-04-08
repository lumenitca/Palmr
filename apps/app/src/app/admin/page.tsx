"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";

function AdminPage() {
  return (
    <ProtectedRoute requireAdmin>
      <div>
        <h1>Admin Dashboard</h1>
        {/* Your admin content */}
      </div>
    </ProtectedRoute>
  );
}

export default AdminPage;
