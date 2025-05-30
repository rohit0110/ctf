import { useCurrentGameId } from "../components/GetActiveGameId";
import JoinGameButton from "../components/JoinGameButton";


export default function PlayerPage() {
  const { gameId, loading } = useCurrentGameId();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Player Dashboard</h1>

      <a
        href="https://faucet.solana.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
      >
        Faucet Devnet for SOL
      </a>

      {/* Join Game Button */}
      <div className="mb-6">
        {loading ? (
          <p>Loading current game ID...</p>
        ) : gameId ? (
          <JoinGameButton gameId={gameId} />
        ) : (
          <p className="text-red-500">No active game found.</p>
        )}
      
      </div>
    </div>
  );
}
