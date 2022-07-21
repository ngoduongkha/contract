import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Lottery Contract", () => {
  async function deployContractFixture() {
    const Lottery = await ethers.getContractFactory("Lottery");
    const accounts = await ethers.getSigners();

    const lottery = await Lottery.deploy();

    await lottery.deployed();

    return { Lottery, lottery, accounts };
  }
  describe("Deployment", function () {
    it("should deploy contract", async () => {
      const { lottery } = await loadFixture(deployContractFixture);

      expect(lottery).to.be.ok;
    });
    it("should set the right manager", async function () {
      const { lottery, accounts } = await loadFixture(deployContractFixture);

      expect(await lottery.manager()).to.equal(accounts[0].address);
    });
  });
  describe("Transaction", function () {
    it("should allow one account join the game", async () => {
      const { lottery, accounts } = await loadFixture(deployContractFixture);

      await lottery
        .connect(accounts[0])
        .enter({ value: ethers.utils.parseEther("0.02") });
      const players = await lottery.getPlayers();

      expect(players[0]).to.be.equal(accounts[0].address);
    });
    it("should allow multiple accounts join the game", async () => {
      const { lottery, accounts } = await loadFixture(deployContractFixture);

      // Multi accounts join the game
      await lottery
        .connect(accounts[0])
        .enter({ value: ethers.utils.parseEther("0.02") });
      await lottery
        .connect(accounts[1])
        .enter({ value: ethers.utils.parseEther("0.02") });
      await lottery
        .connect(accounts[2])
        .enter({ value: ethers.utils.parseEther("0.02") });

      // Get player array
      const players = await lottery.getPlayers();

      expect(players[0]).to.be.equal(accounts[0].address);
      expect(players[1]).to.be.equal(accounts[1].address);
      expect(players[2]).to.be.equal(accounts[2].address);
      expect(players.length).to.be.equal(3);
    });
    it("should have a minimum amount of ether to enter", async () => {
      const { lottery, accounts } = await loadFixture(deployContractFixture);

      await expect(
        lottery.connect(accounts[0]).enter({ value: 0 })
      ).to.be.revertedWith("Don't enough ethers");
    });
    it("should only manager can call pickWinner", async () => {
      const { lottery, accounts } = await loadFixture(deployContractFixture);

      await expect(
        lottery.connect(accounts[1]).pickWinner()
      ).to.be.revertedWith("Just manager can do this");
    });
    it("should send money to the winner and resets the players array", async () => {
      const { lottery, accounts } = await loadFixture(deployContractFixture);

      await lottery.enter({ value: ethers.utils.parseEther("2") });

      await expect(lottery.pickWinner()).to.changeEtherBalance(
        accounts[0],
        ethers.utils.parseEther("2")
      );
    });
  });
});
