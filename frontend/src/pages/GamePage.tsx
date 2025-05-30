import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CaptureFlagButton from "../components/CaptureFlagButton";
import GameStateViewer from "../components/ctf-state";
import { useCurrentGameId } from "../components/GetActiveGameId";
import { usePlayerProfile } from "../components/GetPlayerProfile";
import { useWallet } from "@solana/wallet-adapter-react";

export default function GamePage() {
  const { gameId, loading } = useCurrentGameId();
  const { profile, loading: profileLoading } = usePlayerProfile();
  const { gameData } = GameStateViewer();
  const { publicKey } = useWallet();
  const navigate = useNavigate();

  const isGameOver =
    gameData?.state && Object.keys(gameData.state)[0] === "completed";
  const isWinner =
    publicKey &&
    gameData?.currentFlagHolder &&
    gameData.currentFlagHolder.toBase58() === publicKey.toBase58();

  const isCurrentHolder = isWinner;

  // Redirect 5 seconds after showing game over message
  useEffect(() => {
    if (isGameOver) {
      const timeout = setTimeout(() => {
        navigate("/player");
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [isGameOver, navigate]);

  if (isGameOver) {
    return (
      <div className="p-6">
        {isWinner ? (
          <>
            <h1 className="text-3xl font-bold text-green-600">🎉 You Won! 🎉</h1>
            <p className="mt-4 text-lg">
              You held the flag at the end of the game. You'll be redirected shortly...
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-red-600">Game Over</h1>
            <p className="mt-4 text-lg">
              You didn't win this time. Better luck next game! Redirecting in 5 seconds...
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Game Dashboard</h1>

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
        {isCurrentHolder ? (
          <button
            disabled
            className="w-full bg-gray-400 text-white rounded py-2 cursor-not-allowed"
          >
            Already Captured
          </button>
        ) : (
          <CaptureFlagButton />
        )}
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
