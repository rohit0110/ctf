# CTF Game

Welcome to the CTF (Capture The Flag) Game project!

## Overview

This project is a fight between users to be the last person holding the flag when the game ends. The Users are limited by their health which reduces on every capture they do.

## Getting Started in local

Run solana-test-validator in terminal

In /ctf
    ```
    anchor build
    anchor deploy
    ```

In /frontend
    ```
    yarn dev
    ```

## 🔑 Core Game Features
# 🎯 Capture The Flag Mechanics
A competitive game where players capture a flag by paying a fee and spending health.

The last player to hold the flag when the timer ends wins the prize.

# # ⏳ Timed Rounds
Games run for a fixed duration (e.g. 2 hours).

If a flag is captured in the final 5 minutes, the game auto-extends by 5 minutes.

# 🧮 Health-Based Strategy
Players have a limited amount of health.

Capturing the flag reduces health (base: 15, increases as global captures rise).

No health regeneration — forces strategic planning.

# 💰 Lamport-Based Payments
Each flag capture requires a lamport payment.

Funds are stored in a PDA vault and distributed to the winner and protocol at game end.

# 🏆 Prize Distribution
Winner receives 80% of the prize pool.

Protocol (or admin) gets 20% — can be used for future rewards, fees, etc.
