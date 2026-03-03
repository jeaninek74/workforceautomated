import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Plus, Play, Edit, Trash2, Bot, ArrowRight } from "lucide-react";
import { teamsApi } from "../lib/api";

export default function Teams() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teamsApi.list().then((r) => setTeams(r.data?.teams || [])).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this team?")) return;
    await teamsApi.delete(id);
    setTeams((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Agent Teams</h1>
          <p className="text-gray-400 text-sm mt-1">Multi-agent workflow orchestration</p>
        </div>
        <Link to="/teams/new" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          New Team
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse h-40" />)}
        </div>
      ) : teams.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl py-20 text-center">
          <Users className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2">No teams yet</h3>
          <p className="text-gray-400 text-sm mb-6">Compose agents into powerful multi-step workflows</p>
          <Link to="/teams/new" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Create First Team
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team) => (
            <div key={team.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{team.name}</h3>
                    <p className="text-xs text-gray-500">{team.memberCount || 0} agents</p>
                  </div>
                </div>
              </div>
              {team.description && <p className="text-sm text-gray-400 mb-4 line-clamp-2">{team.description}</p>}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-800">
                <Link to={`/teams/${team.id}/run`} className="flex-1 flex items-center justify-center gap-1.5 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 text-xs font-medium py-2 rounded-lg transition-colors">
                  <Play className="w-3 h-3" /> Run
                </Link>
                <Link to={`/teams/${team.id}/edit`} className="flex-1 flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium py-2 rounded-lg transition-colors">
                  <Edit className="w-3 h-3" /> Edit
                </Link>
                <button onClick={() => handleDelete(team.id)} className="flex items-center justify-center w-8 h-8 bg-gray-800 hover:bg-red-950/50 hover:text-red-400 text-gray-400 rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
