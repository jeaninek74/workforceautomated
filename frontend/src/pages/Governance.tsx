import { useEffect, useState } from "react";
import { Shield, AlertTriangle, CheckCircle, Clock, Loader2 } from "lucide-react";
import { governanceApi } from "../lib/api";

export default function Governance() {
  const [escalations, setEscalations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});

  useEffect(() => {
    governanceApi.getEscalations()
      .then((r) => setEscalations(r.data?.escalations || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleResolve = async (id: number) => {
    setResolving(id);
    try {
      await governanceApi.resolveEscalation(id, notes[id] || "Reviewed and approved");
      setEscalations((prev) => prev.map((e) => e.id === id ? { ...e, status: "resolved" } : e));
    } catch (_) {}
    setResolving(null);
  };

  const pending = escalations.filter((e) => e.status === "pending");
  const resolved = escalations.filter((e) => e.status === "resolved");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Governance Center</h1>
        <p className="text-gray-400 text-sm mt-1">Human-in-the-loop review queue for escalated executions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="text-xs text-gray-400 mb-1">Pending Review</div>
          <div className="text-2xl font-bold text-orange-400">{pending.length}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="text-xs text-gray-400 mb-1">Resolved Today</div>
          <div className="text-2xl font-bold text-green-400">{resolved.length}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="text-xs text-gray-400 mb-1">Total Escalations</div>
          <div className="text-2xl font-bold text-white">{escalations.length}</div>
        </div>
      </div>

      {/* Pending Escalations */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-400" />
          <h2 className="font-semibold text-white">Pending Review ({pending.length})</h2>
        </div>
        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          </div>
        ) : pending.length === 0 ? (
          <div className="py-12 text-center">
            <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No pending escalations — all clear!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {pending.map((esc) => (
              <div key={esc.id} className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">Execution #{esc.executionId}</span>
                      <span className="text-xs bg-orange-950/50 text-orange-400 border border-orange-800 px-2 py-0.5 rounded-full">
                        {esc.riskLevel} risk
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{esc.reason}</p>
                    {esc.confidenceScore != null && (
                      <p className="text-xs text-gray-500 mt-1">Confidence: {Math.round(esc.confidenceScore)}%</p>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(esc.createdAt).toLocaleString()}
                  </div>
                </div>
                {esc.executionOutput && (
                  <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-300 max-h-32 overflow-y-auto">
                    {esc.executionOutput}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={notes[esc.id] || ""}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [esc.id]: e.target.value }))}
                    placeholder="Resolution notes (optional)..."
                    className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500"
                  />
                  <button
                    onClick={() => handleResolve(esc.id)}
                    disabled={resolving === esc.id}
                    className="flex items-center gap-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    {resolving === esc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved */}
      {resolved.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <h2 className="font-semibold text-white">Resolved ({resolved.length})</h2>
          </div>
          <div className="divide-y divide-gray-800">
            {resolved.map((esc) => (
              <div key={esc.id} className="px-6 py-4 flex items-center gap-4">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm text-gray-300">Execution #{esc.executionId}</div>
                  <div className="text-xs text-gray-500">{esc.reason}</div>
                </div>
                <div className="text-xs text-gray-500">{new Date(esc.updatedAt || esc.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
