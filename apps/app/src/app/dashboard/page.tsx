"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";

function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>
        <h1>Dashboard</h1>
        {/* Your dashboard content */}
      </div>
    </ProtectedRoute>
  );
}

export default DashboardPage;