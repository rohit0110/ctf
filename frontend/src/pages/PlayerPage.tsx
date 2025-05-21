// import CaptureFlagButton from "../components/CaptureFlagButton";
import GameStateViewer from "../components/ctf-state";

export default function PlayerPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Player Dashboard</h1>

      <div className="mb-4">
        <GameStateViewer />
      </div>

      {/* <div className="mt-4">
        <CaptureFlagButton />
      </div> */}

      {/* Placeholder for more player info */}
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
