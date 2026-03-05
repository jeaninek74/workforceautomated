import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users, Plus, Play, Edit, Trash2, Bot, ArrowDown, Layers,
  GitBranch, Zap, ChevronRight, AlertCircle
} from "lucide-react";
import { teamsApi } from "../lib/api";

const MODE_CONFIG = {
  sequential: {
    icon: ArrowDown,
    label: "Sequential",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    description: "Agents run in order, passing output forward",
  },
  parallel: {
    icon: Layers,
    label: "Parallel",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
    description: "All agents run simultaneously",
  },
  conditional: {
    icon: GitBranch,
    label: "Conditional",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
    description: "Agents route based on conditions",
  },
};

export default function Teams() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teamsApi.list().then((r) => setTeams(r.data?.teams || [])).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this team? This cannot be undone.")) return;
    await teamsApi.delete(id);
    setTeams((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Agent Teams</h1>
          <p className="text-gray-400 text-sm mt-1">Multi-agent workflow orchestration — sequential, parallel, or conditional</p>
        </div>
        <Link
          to="/teams/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> New Team
        </Link>
      </div>

      {/* How it works callout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {Object.entries(MODE_CONFIG).map(([mode, cfg]) => {
          const Icon = cfg.icon;
          return (
            <div key={mode} className={`flex items-start gap-3 p-3 rounded-xl border ${cfg.bg}`}>
              <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cfg.color}`} />
              <div>
                <div className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{cfg.description}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Teams list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse h-52" />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl py-20 text-center">
          <Users className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2">No teams yet</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
            Combine multiple agents into a pipeline. Each agent specialises in one step — together they handle complex workflows.
          </p>
          <Link
            to="/teams/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Create First Team
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team) => {
            const mode = (team.executionMode || "sequential") as keyof typeof MODE_CONFIG;
            const cfg = MODE_CONFIG[mode] || MODE_CONFIG.sequential;
            const ModeIcon = cfg.icon;
            const memberAgents: any[] = team.memberAgents || [];
            const branchingRules: any[] = team.branchingRules || [];

            return (
              <div
                key={team.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors flex flex-col"
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{team.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${cfg.color}`}>
                          <ModeIcon className="w-3 h-3" /> {cfg.label}
                        </span>
                        <span className="text-gray-600 text-xs">·</span>
                        <span className="text-xs text-gray-500">{memberAgents.length} agent{memberAgents.length !== 1 ? "s" : ""}</span>
                        {team.totalExecutions > 0 && (
                          <>
                            <span className="text-gray-600 text-xs">·</span>
                            <span className="text-xs text-gray-500">{team.totalExecutions} run{team.totalExecutions !== 1 ? "s" : ""}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {team.description && (
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">{team.description}</p>
                )}

                {/* Agent pipeline preview */}
                {memberAgents.length > 0 && (
                  <div className="mb-3">
                    {mode === "parallel" ? (
                      <div className="flex flex-wrap gap-1.5">
                        {memberAgents.map((a) => (
                          <div key={a.id} className="flex items-center gap-1 bg-green-600/10 border border-green-600/20 rounded-lg px-2 py-1">
                            <Bot className="w-3 h-3 text-green-400" />
                            <span className="text-xs text-green-300">{a.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 flex-wrap">
                        {memberAgents.map((a, idx) => (
                          <div key={a.id} className="flex items-center gap-1">
                            <div className="flex items-center gap-1 bg-gray-800 rounded-lg px-2 py-1">
                              <Bot className="w-3 h-3 text-blue-400" />
                              <span className="text-xs text-gray-300">{a.name}</span>
                            </div>
                            {idx < memberAgents.length - 1 && (
                              <ChevronRight className="w-3 h-3 text-gray-600 flex-shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Branching rules count */}
                {mode === "conditional" && branchingRules.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-purple-400 mb-3">
                    <GitBranch className="w-3 h-3" />
                    {branchingRules.length} branching rule{branchingRules.length !== 1 ? "s" : ""} configured
                  </div>
                )}

                {mode === "conditional" && branchingRules.length === 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-yellow-500 mb-3">
                    <AlertCircle className="w-3 h-3" />
                    No branching rules — add rules to enable conditional routing
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-800 mt-auto">
                  <Link
                    to={`/teams/${team.id}/run`}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 text-xs font-medium py-2 rounded-lg transition-colors"
                  >
                    <Play className="w-3 h-3" /> Run
                  </Link>
                  <Link
                    to={`/teams/${team.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium py-2 rounded-lg transition-colors"
                  >
                    <Edit className="w-3 h-3" /> Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(team.id)}
                    className="flex items-center justify-center w-8 h-8 bg-gray-800 hover:bg-red-950/50 hover:text-red-400 text-gray-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
