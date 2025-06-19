import { useState } from "react";
import AdminSidebar from "@/components/admin/sidebar";

export default function AdminLeadsMinimal() {
  console.log('AdminLeadsMinimal rendering...');
  
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="flex">
        <AdminSidebar />
        
        <div className="flex-1 lg:ml-64 p-4 lg:p-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
              Lead Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              This is a minimal test version to debug the blank screen issue.
            </p>
            <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              <p>✓ If you can see this, the routing and basic components are working.</p>
              <p>✓ The issue is likely in the complex useLeads hook or data handling.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}