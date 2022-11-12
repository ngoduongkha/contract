import { expect } from "chai";
import { ethers } from "hardhat";
import { Inbox__factory, Inbox } from "../typechain-types";

let Inbox: Inbox__factory;
let inbox: Inbox;

describe("Inbox", function () {
  describe("Deployment", function () {
    before(async function () {
      Inbox = await ethers.getContractFactory("Inbox");
      inbox = await Inbox.deploy("initString");
    });
    it("Should provide initialized message", async function () {
      expect(inbox.address).to.be.ok;
    });
    it("Should has a message", async function () {
      const message = await inbox.message();
      expect(message).to.be.equal("initString");
    });
    it("Should update new message", async function () {
      const newMessage = "new message";
      await inbox.updateMessage(newMessage);
      const message = await inbox.message();
      expect(message).to.be.equal(newMessage);
    });
    it("Should get new message after updated", async function () {
      const message = await inbox.message();
      expect(message).to.be.equal("new message");
    });
  });
});
