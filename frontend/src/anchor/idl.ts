export type Ctf = {
  "version": "0.1.0",
  "name": "ctf",
  "instructions": [
    {
      "name": "initializeGameRegistry",
      "docs": [
        "Initializes the game registry account with the given game_id.",
        "Only the admin who owns the registry can update it."
      ],
      "accounts": [
        {
          "name": "gameRegistry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateGameRegistry",
      "docs": [
        "Updates the current game_id in the game registry."
      ],
      "accounts": [
        {
          "name": "gameRegistry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeGame",
      "docs": [
        "Initializes a new game account and its associated vault.",
        "Sets up the game parameters and creates a rent-exempt vault PDA."
      ],
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "u64"
        },
        {
          "name": "gameDuration",
          "type": "i64"
        },
        {
          "name": "baseCaptureCost",
          "type": "u64"
        },
        {
          "name": "baseFeeLamports",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializePlayer",
      "docs": [
        "Initializes a new player account with default health."
      ],
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "startGame",
      "docs": [
        "Starts the game, transitioning its state from Pending to Active."
      ],
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "startFinalPhase",
      "docs": [
        "Starts the final phase of the game, transitioning from Active to FinalPhase."
      ],
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "endGame",
      "docs": [
        "Ends the game, distributes the prize pool, and marks the game as Completed."
      ],
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "winner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "captureFlag",
      "docs": [
        "Allows a player to capture the flag if the game is active.",
        "Deducts health, charges a fee, updates the game state, and extends the game if needed."
      ],
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "game",
      "docs": [
        "Game account storing all game state and configuration."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "state",
            "type": {
              "defined": "GameState"
            }
          },
          {
            "name": "startTime",
            "type": "i64"
          },
          {
            "name": "duration",
            "type": "i64"
          },
          {
            "name": "baseCaptureCost",
            "type": "u64"
          },
          {
            "name": "baseFeeLamports",
            "type": "u64"
          },
          {
            "name": "globalCaptures",
            "type": "u64"
          },
          {
            "name": "currentFlagHolder",
            "type": "publicKey"
          },
          {
            "name": "winner",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "lastCaptureTime",
            "type": "i64"
          },
          {
            "name": "prizePool",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "vault",
            "type": "publicKey"
          },
          {
            "name": "vaultBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "player",
      "docs": [
        "Player account storing player-specific state."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "health",
            "type": "u64"
          },
          {
            "name": "state",
            "type": {
              "defined": "PlayerState"
            }
          }
        ]
      }
    },
    {
      "name": "gameRegistry",
      "docs": [
        "Game registry account for tracking the current game."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "currentGameId",
            "type": "u64"
          },
          {
            "name": "admin",
            "type": "publicKey"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "GameState",
      "docs": [
        "Enum representing the state of the game."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Pending"
          },
          {
            "name": "Active"
          },
          {
            "name": "FinalPhase"
          },
          {
            "name": "Completed"
          }
        ]
      }
    },
    {
      "name": "PlayerState",
      "docs": [
        "Enum representing the state of a player."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Active"
          },
          {
            "name": "Critical"
          },
          {
            "name": "Eliminated"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "GameNotActive",
      "msg": "Game is not active."
    },
    {
      "code": 6001,
      "name": "GameOver",
      "msg": "The game has ended."
    },
    {
      "code": 6002,
      "name": "InvalidStateTransition",
      "msg": "Invalid game state transition."
    },
    {
      "code": 6003,
      "name": "AlreadyCompleted",
      "msg": "Game already completed."
    },
    {
      "code": 6004,
      "name": "NotEnoughHealth",
      "msg": "Not enough health to capture the flag."
    },
    {
      "code": 6005,
      "name": "InvalidVaultOwner",
      "msg": "Invalid vault owner."
    },
    {
      "code": 6006,
      "name": "InvalidAuthToUpdateGameRegistry",
      "msg": "Invalid autth to update game registry."
    }
  ]
};

export const IDL: Ctf = {
  "version": "0.1.0",
  "name": "ctf",
  "instructions": [
    {
      "name": "initializeGameRegistry",
      "docs": [
        "Initializes the game registry account with the given game_id.",
        "Only the admin who owns the registry can update it."
      ],
      "accounts": [
        {
          "name": "gameRegistry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateGameRegistry",
      "docs": [
        "Updates the current game_id in the game registry."
      ],
      "accounts": [
        {
          "name": "gameRegistry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeGame",
      "docs": [
        "Initializes a new game account and its associated vault.",
        "Sets up the game parameters and creates a rent-exempt vault PDA."
      ],
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "u64"
        },
        {
          "name": "gameDuration",
          "type": "i64"
        },
        {
          "name": "baseCaptureCost",
          "type": "u64"
        },
        {
          "name": "baseFeeLamports",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializePlayer",
      "docs": [
        "Initializes a new player account with default health."
      ],
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "startGame",
      "docs": [
        "Starts the game, transitioning its state from Pending to Active."
      ],
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "startFinalPhase",
      "docs": [
        "Starts the final phase of the game, transitioning from Active to FinalPhase."
      ],
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "endGame",
      "docs": [
        "Ends the game, distributes the prize pool, and marks the game as Completed."
      ],
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "winner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "captureFlag",
      "docs": [
        "Allows a player to capture the flag if the game is active.",
        "Deducts health, charges a fee, updates the game state, and extends the game if needed."
      ],
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "game",
      "docs": [
        "Game account storing all game state and configuration."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "state",
            "type": {
              "defined": "GameState"
            }
          },
          {
            "name": "startTime",
            "type": "i64"
          },
          {
            "name": "duration",
            "type": "i64"
          },
          {
            "name": "baseCaptureCost",
            "type": "u64"
          },
          {
            "name": "baseFeeLamports",
            "type": "u64"
          },
          {
            "name": "globalCaptures",
            "type": "u64"
          },
          {
            "name": "currentFlagHolder",
            "type": "publicKey"
          },
          {
            "name": "winner",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "lastCaptureTime",
            "type": "i64"
          },
          {
            "name": "prizePool",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "vault",
            "type": "publicKey"
          },
          {
            "name": "vaultBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "player",
      "docs": [
        "Player account storing player-specific state."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "health",
            "type": "u64"
          },
          {
            "name": "state",
            "type": {
              "defined": "PlayerState"
            }
          }
        ]
      }
    },
    {
      "name": "gameRegistry",
      "docs": [
        "Game registry account for tracking the current game."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "currentGameId",
            "type": "u64"
          },
          {
            "name": "admin",
            "type": "publicKey"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "GameState",
      "docs": [
        "Enum representing the state of the game."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Pending"
          },
          {
            "name": "Active"
          },
          {
            "name": "FinalPhase"
          },
          {
            "name": "Completed"
          }
        ]
      }
    },
    {
      "name": "PlayerState",
      "docs": [
        "Enum representing the state of a player."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Active"
          },
          {
            "name": "Critical"
          },
          {
            "name": "Eliminated"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "GameNotActive",
      "msg": "Game is not active."
    },
    {
      "code": 6001,
      "name": "GameOver",
      "msg": "The game has ended."
    },
    {
      "code": 6002,
      "name": "InvalidStateTransition",
      "msg": "Invalid game state transition."
    },
    {
      "code": 6003,
      "name": "AlreadyCompleted",
      "msg": "Game already completed."
    },
    {
      "code": 6004,
      "name": "NotEnoughHealth",
      "msg": "Not enough health to capture the flag."
    },
    {
      "code": 6005,
      "name": "InvalidVaultOwner",
      "msg": "Invalid vault owner."
    },
    {
      "code": 6006,
      "name": "InvalidAuthToUpdateGameRegistry",
      "msg": "Invalid autth to update game registry."
    }
  ]
};
