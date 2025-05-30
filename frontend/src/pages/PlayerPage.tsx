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
        className="absolute top-4 right-4 bg-blue-800 hover:bg-blue-500 text-white font-semibold px-5 py-3 rounded-lg shadow-lg transition-colors duration-300"
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
