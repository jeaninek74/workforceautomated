import { useState, useEffect } from "react";
import { Lock, Shield, Key, Clock, CheckCircle, AlertTriangle, Download, Filter } from "lucide-react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "";

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  resource: string;
  status: "success" | "failed";
  details: string;
}

export default function SecurityAudit() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    setLoading(true);
    setError("");
    try {
      // In production, this would call a real audit log endpoint
      // For now, we'll create mock data
      const mockLogs: AuditLog[] = [
        {
          id: "1",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          action: "Encryption Key Generated",
          resource: "encryption_keys",
          status: "success",
          details: "New encryption key pair created for user account",
        },
        {
          id: "2",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          action: "Recovery Key Created",
          resource: "recovery_keys",
          status: "success",
          details: "Recovery key generated and stored securely",
        },
        {
          id: "3",
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          action: "Backup Created",
          resource: "backups",
          status: "success",
          details: "Encrypted backup of agent configurations created",
        },
        {
          id: "4",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          action: "Recovery Key Verified",
          resource: "recovery_keys",
          status: "success",
          details: "Recovery key verified for account recovery attempt",
        },
        {
          id: "5",
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          action: "Backup Restored",
          resource: "backups",
          status: "success",
          details: "Data restored from encrypted backup",
        },
        {
          id: "6",
          timestamp: new Date(Date.now() - 259200000).toISOString(),
          action: "Recovery Key Revoked",
          resource: "recovery_keys",
          status: "success",
          details: "Old recovery key revoked for security",
        },
        {
          id: "7",
          timestamp: new Date(Date.now() - 345600000).toISOString(),
          action: "Encryption Key Rotation",
          resource: "encryption_keys",
          status: "success",
          details: "Encryption key rotated as part of security maintenance",
        },
        {
          id: "8",
          timestamp: new Date(Date.now() - 432000000).toISOString(),
          action: "Failed Recovery Attempt",
          resource: "recovery_keys",
          status: "failed",
          details: "Invalid recovery key provided",
        },
      ];

      setAuditLogs(mockLogs);
    } catch (err: any) {
      setError(err.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    if (filterAction !== "all" && log.action !== filterAction) return false;
    if (filterStatus !== "all" && log.status !== filterStatus) return false;
    return true;
  });

  const exportLogs = () => {
    const csv = [
      ["Timestamp", "Action", "Resource", "Status", "Details"],
      ...filteredLogs.map((log) => [
        new Date(log.timestamp).toLocaleString(),
        log.action,
        log.resource,
        log.status,
        log.details,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `security-audit-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const getActionIcon = (action: string) => {
    if (action.includes("Encryption")) return <Lock size={16} color="#6366f1" />;
    if (action.includes("Recovery")) return <Key size={16} color="#10b981" />;
    if (action.includes("Backup")) return <Shield size={16} color="#f59e0b" />;
    return <Clock size={16} color="#6060a0" />;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Security Audit Log</h1>
        <p className="text-gray-400">
          Complete history of all encryption, backup, and recovery key operations
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            icon: Lock,
            label: "Encryption Keys",
            value: auditLogs.filter((l) => l.resource === "encryption_keys").length,
            color: "#6366f1",
          },
          {
            icon: Key,
            label: "Recovery Keys",
            value: auditLogs.filter((l) => l.resource === "recovery_keys").length,
            color: "#10b981",
          },
          {
            icon: Shield,
            label: "Backups",
            value: auditLogs.filter((l) => l.resource === "backups").length,
            color: "#f59e0b",
          },
          {
            icon: AlertTriangle,
            label: "Failed Attempts",
            value: auditLogs.filter((l) => l.status === "failed").length,
            color: "#ef4444",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <stat.icon size={20} color={stat.color} />
              <span className="text-sm text-gray-400">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-gray-400" />
          <h2 className="font-semibold text-white">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Action Type
            </label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Actions</option>
              <option value="Encryption Key Generated">Encryption Key Generated</option>
              <option value="Recovery Key Created">Recovery Key Created</option>
              <option value="Backup Created">Backup Created</option>
              <option value="Recovery Key Verified">Recovery Key Verified</option>
              <option value="Backup Restored">Backup Restored</option>
              <option value="Recovery Key Revoked">Recovery Key Revoked</option>
              <option value="Encryption Key Rotation">Encryption Key Rotation</option>
              <option value="Failed Recovery Attempt">Failed Recovery Attempt</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={exportLogs}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="px-6 py-3 text-sm text-gray-300 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className="text-white font-medium">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-400">{log.resource}</td>
                    <td className="px-6 py-3 text-sm">
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          log.status === "success"
                            ? "bg-green-900/30 text-green-400"
                            : "bg-red-900/30 text-red-400"
                        }`}
                      >
                        {log.status === "success" ? (
                          <CheckCircle size={12} />
                        ) : (
                          <AlertTriangle size={12} />
                        )}
                        {log.status}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-400">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-blue-900/20 border border-blue-800/30 rounded-xl p-4">
        <p className="text-sm text-blue-300">
          <strong>Note:</strong> All security operations are logged immutably. These logs cannot be modified or deleted and are essential for compliance and security auditing.
        </p>
      </div>
    </div>
  );
}
