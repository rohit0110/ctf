export type Ctf = {
  "version": "0.1.0",
  "name": "ctf",
  "instructions": [
    {
      "name": "initializeGameRegistry",
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
      "name": "initializeGame",
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
      "args": []
    },
    {
      "name": "startGame",
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
    }
  ]
};

export const IDL: Ctf = {
  "version": "0.1.0",
  "name": "ctf",
  "instructions": [
    {
      "name": "initializeGameRegistry",
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
      "name": "initializeGame",
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
      "args": []
    },
    {
      "name": "startGame",
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
    }
  ]
};
