import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  WalletModalProvider,
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "@solana/wallet-adapter-react-ui/styles.css";
import "./App.css";

// Pages
import Home from "./pages/Home";
import AdminPage from "./pages/AdminPage";
import { AdminRoute } from "./components/AdminRoute";
import PlayerPage from "./pages/PlayerPage";
import { ErrorProvider } from "./components/ErrorContext";
import { ErrorToast } from "./components/ErrorToast";

function App() {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <ErrorProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute> } />
                <Route path="/player" element={<PlayerPage />} />
              </Routes>
            </Router>
            <ErrorToast />
          </ErrorProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
