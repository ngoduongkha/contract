// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "hardhat/console.sol";

contract Lottery {
    address public manager;
    address[] public players;

    constructor() {
        manager = msg.sender;
    }

    function enter() public payable {
        require(msg.value > .01 ether, "Don't enough ethers");
        players.push(msg.sender);
    }

    function random() private view returns (uint result) {
        return
            uint(
                keccak256(
                    abi.encodePacked(block.difficulty, block.timestamp, players)
                )
            );
    }

    function pickWinner() public onlyOwner {
        uint index = random() % players.length;
        payable(players[index]).transfer(address(this).balance);
        players = new address[](0);
    }

    function getPlayers() public view returns (address[] memory) {
        return players;
    }

    modifier onlyOwner() {
        require(msg.sender == manager, "Just manager can do this");
        _;
    }
}
