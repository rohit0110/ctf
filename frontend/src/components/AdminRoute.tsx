import { useWallet } from "@solana/wallet-adapter-react";
import { Navigate } from "react-router-dom";
import { ADMIN_PUBLIC_KEY } from "../constant/constant";
import type { JSX } from "react";

export const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { publicKey } = useWallet();

  if (!publicKey) {
    return <Navigate to="/" />;
  }

  const isAdmin = publicKey.toBase58() === ADMIN_PUBLIC_KEY.toBase58();

  return isAdmin ? children : <Navigate to="/" />;
};
