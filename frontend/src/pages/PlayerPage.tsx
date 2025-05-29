import CaptureFlagButton from "../components/CaptureFlagButton";
import GameStateViewer from "../components/ctf-state";
import { useCurrentGameId } from "../components/GetActiveGameId";
import { usePlayerProfile } from "../components/GetPlayerProfile";
import { useWallet } from "@solana/wallet-adapter-react";

export default function PlayerPage() {
  const { gameId, loading } = useCurrentGameId();
  const { profile, loading: profileLoading } = usePlayerProfile();
  const { gameData } = GameStateViewer();
  const { publicKey } = useWallet();

  const isGameOver =
    gameData?.state && Object.keys(gameData.state)[0] === "completed";
  const isWinner =
    publicKey &&
    gameData?.currentFlagHolder &&
    gameData.currentFlagHolder.toBase58() === publicKey.toBase58();

  if (isGameOver && isWinner) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-green-600">🎉 You Won! 🎉</h1>
        <p className="mt-4 text-lg">Congratulations on holding the flag until the end. Check your account for the winnings, stay on the page till next game starts</p>
      </div>
    );
  }

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

      {/* Game State */}
      <div className="text-lg">
        {loading ? (
          <p>Loading game state...</p>
        ) : gameData && gameId ? (
          <>
            <p>Game ID: {gameId}</p>
            <p>State: {Object.keys(gameData.state)[0]}</p>
            <p>Prize Pool: {gameData.prizePool.toString()} lamports</p>
            <p>Current Holder: {gameData.currentFlagHolder.toBase58()}</p>
          </>
        ) : (
          <p>No game data found.</p>
        )}
      </div>

      {/* Display current Game ID */}
      <div className="mb-6">
        {loading ? (
          <p>Loading current game ID...</p>
        ) : gameId ? (
          <p className="text-lg">
            Current Game ID: <strong>{gameId}</strong>
          </p>
        ) : (
          <p className="text-red-500">No active game found.</p>
        )}
      </div>

      {/* Capture Button */}
      <div className="mt-4">
        <CaptureFlagButton />
      </div>

      {/* Player Profile */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Player Profile</h2>
        {profileLoading ? (
          <p>Loading profile...</p>
        ) : profile ? (
          <div className="border p-4 rounded bg-gray-100">
            <p>Health: {profile.health?.toString?.() ?? "N/A"}</p>
            <p>
              State:{" "}
              {profile.state ? Object.keys(profile.state)[0] : "Unknown"}
            </p>
          </div>
        ) : (
          <p className="text-red-500">No player profile found.</p>
        )}
      </div>
    </div>
  );
}
