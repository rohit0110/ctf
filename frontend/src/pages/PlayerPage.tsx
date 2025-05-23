// import CaptureFlagButton from "../components/CaptureFlagButton";
import CaptureFlagButton from "../components/CaptureFlagButton";
import GameStateViewer from "../components/ctf-state";
import { useCurrentGameId } from "../components/GetActiveGameId";

export default function PlayerPage() {
  const { gameId, loading } = useCurrentGameId();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Player Dashboard</h1>

      <div>
        <GameStateViewer />
      </div>

      {/* Display current Game ID */}
      <div className="mb-6">
        {loading ? (
          <p>Loading current game ID...</p>
        ) : gameId ? (
          <p className="text-lg">Current Game ID: <strong>{gameId}</strong></p>
        ) : (
          <p className="text-red-500">No active game found.</p>
        )}
      </div>

        {/* Placeholder for Capture Flag button */}
        <div className="mt-4">
            <CaptureFlagButton />
        </div>

      {/* Placeholder for more */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold">Your Stats</h2>
        <ul className="list-disc ml-6">
          <li>Health: coming soon</li>
          <li>Flag Status: coming soon</li>
          <li>Capture Cost: based on game state</li>
        </ul>
      </div>
    </div>
  );
}

