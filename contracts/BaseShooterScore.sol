// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BaseShooterScore is Ownable, ReentrancyGuard {
    struct Score {
        address player;
        uint256 score;
        uint256 timestamp;
        string username;
    }

    mapping(address => Score) public playerScores;
    address[] public players;
    
    event ScoreSubmitted(address indexed player, uint256 score, string username, uint256 timestamp);
    event ScoreUpdated(address indexed player, uint256 oldScore, uint256 newScore);

    constructor() Ownable(msg.sender) {}

    function submitScore(uint256 _score, string memory _username) external nonReentrant {
        require(_score > 0, "Score must be greater than 0");
        require(bytes(_username).length > 0, "Username required");
        require(bytes(_username).length <= 32, "Username too long");

        if (playerScores[msg.sender].score == 0) {
            players.push(msg.sender);
        }

        uint256 oldScore = playerScores[msg.sender].score;
        
        if (_score > oldScore) {
            playerScores[msg.sender] = Score({
                player: msg.sender,
                score: _score,
                timestamp: block.timestamp,
                username: _username
            });

            if (oldScore == 0) {
                emit ScoreSubmitted(msg.sender, _score, _username, block.timestamp);
            } else {
                emit ScoreUpdated(msg.sender, oldScore, _score);
            }
        }
    }

    function getPlayerScore(address _player) external view returns (Score memory) {
        return playerScores[_player];
    }

    function getTopScores(uint256 _limit) external view returns (Score[] memory) {
        uint256 limit = _limit > players.length ? players.length : _limit;
        Score[] memory allScores = new Score[](players.length);
        
        for (uint256 i = 0; i < players.length; i++) {
            allScores[i] = playerScores[players[i]];
        }

        // Bubble sort (good enough for reasonable player counts)
        for (uint256 i = 0; i < allScores.length; i++) {
            for (uint256 j = i + 1; j < allScores.length; j++) {
                if (allScores[j].score > allScores[i].score) {
                    Score memory temp = allScores[i];
                    allScores[i] = allScores[j];
                    allScores[j] = temp;
                }
            }
        }

        Score[] memory topScores = new Score[](limit);
        for (uint256 i = 0; i < limit; i++) {
            topScores[i] = allScores[i];
        }

        return topScores;
    }

    function getTotalPlayers() external view returns (uint256) {
        return players.length;
    }
}
