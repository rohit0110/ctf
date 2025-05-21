import { useState } from "react";
import InitializeGameButton from "../components/InitializeGameButton";
import StartGameButton from "../components/StartGameButton";

export default function AdminPage() {
  const [gameId, setGameId] = useState("1");
  const [duration, setDuration] = useState("7200");
  const [captureCost, setCaptureCost] = useState("1000000");
  const [baseFee, setBaseFee] = useState("10000");

  return (
    <div className="p-6 space-y-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold">Admin Panel - Start New Game</h2>

      <label className="block">
        Game ID
        <input
          type="number"
          className="w-full mt-1 p-2 border rounded"
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
        />
      </label>

      <label className="block">
        Duration (seconds)
        <input
          type="number"
          className="w-full mt-1 p-2 border rounded"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
      </label>

      <label className="block">
        Base Capture Cost (lamports)
        <input
          type="number"
          className="w-full mt-1 p-2 border rounded"
          value={captureCost}
          onChange={(e) => setCaptureCost(e.target.value)}
        />
      </label>

      <label className="block">
        Base Fee (lamports)
        <input
          type="number"
          className="w-full mt-1 p-2 border rounded"
          value={baseFee}
          onChange={(e) => setBaseFee(e.target.value)}
        />
      </label>

      {/* Pass form values as props */}
      <InitializeGameButton
        gameId={gameId}
        duration={duration}
        captureCost={captureCost}
        baseFee={baseFee}
      />

      <StartGameButton
        gameId={gameId}
      />
    </div>
  );
}
