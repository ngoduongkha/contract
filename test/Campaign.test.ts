import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Campaign Contract", () => {
  async function deployContractFixture() {
    const accounts = await ethers.getSigners();
    const CampaignFactory = await ethers.getContractFactory("CampaignFactory");
    const Campaign = await ethers.getContractFactory("Campaign");

    const campaignFactory = await CampaignFactory.deploy();
    campaignFactory.deployed();
    await campaignFactory.createCampaign(ethers.utils.parseEther("0.01"));
    const [campaignAddress] = await campaignFactory.getDeployedCampaigns();
    const campaign = Campaign.attach(campaignAddress);

    return { campaignFactory, campaign, accounts };
  }
  describe("Deployment", () => {
    it("should deploy a factory and a campaign", async () => {
      const { campaignFactory, campaign } = await loadFixture(
        deployContractFixture
      );

      expect(campaignFactory).to.be.ok;
      expect(campaign.address).to.be.ok;
    });

    it("should mark caller as the campaign manager", async () => {
      const { campaign, accounts } = await loadFixture(deployContractFixture);
      const manager = await campaign.owner();
      expect(manager).to.be.equal(accounts[0].address);
    });
  });

  describe("Contribution", () => {
    it("should allow people to contribute and mark as approvers", async () => {
      const { campaign, accounts } = await loadFixture(deployContractFixture);
      await campaign.contribute({ value: ethers.utils.parseEther("0.02") });
      const isContributor = await campaign.approvers(accounts[0].address);
      expect(isContributor).to.be.true;
    });

    it("should require minimum contribution", async () => {
      const { campaign } = await loadFixture(deployContractFixture);

      await expect(
        campaign.contribute({ value: ethers.utils.parseEther("0.01") })
      ).to.be.reverted;
    });

    it("should allow multiple people to contribute and mark as approvers", async () => {
      const { campaign, accounts } = await loadFixture(deployContractFixture);

      await campaign
        .connect(accounts[1])
        .contribute({ value: ethers.utils.parseEther("0.02") });
      await campaign
        .connect(accounts[2])
        .contribute({ value: ethers.utils.parseEther("0.02") });
      await campaign
        .connect(accounts[3])
        .contribute({ value: ethers.utils.parseEther("0.02") });

      expect(await campaign.approvers(accounts[1].address)).to.be.true;
      expect(await campaign.approvers(accounts[2].address)).to.be.true;
      expect(await campaign.approvers(accounts[3].address)).to.be.true;
    });
  });

  describe("Request process", () => {
    describe("Request creation", () => {
      it("should only manager can create request", async () => {
        const { campaign, accounts } = await loadFixture(deployContractFixture);

        await campaign.createRequest(
          "Buy something",
          ethers.utils.parseEther("0.00001"),
          accounts[1].address
        );
        const request = await campaign.requests(0);

        expect(request.description).to.be.equal("Buy something");
      });
      it("should restrict when stranger create request", async () => {
        const { campaign, accounts } = await loadFixture(deployContractFixture);

        await expect(
          campaign
            .connect(accounts[1])
            .createRequest(
              "Buy something",
              ethers.utils.parseEther("0.00001"),
              accounts[1].address
            )
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    async function createRequestFixture() {
      const { campaign, accounts } = await loadFixture(deployContractFixture);
      await campaign.contribute({ value: ethers.utils.parseEther("0.02") });
      await campaign.createRequest(
        "Buy something",
        ethers.utils.parseEther("0.00001"),
        accounts[1].address
      );
      return { campaign, accounts };
    }

    describe("Request approval", () => {
      it("should fail if not a approver", async () => {
        const { campaign, accounts } = await loadFixture(createRequestFixture);
        await expect(campaign.connect(accounts[1]).approveRequest(0)).to.be
          .reverted;
      });
      it("should fail if approve twice", async () => {
        const { campaign } = await loadFixture(createRequestFixture);
        await campaign.approveRequest(0);
        await expect(campaign.approveRequest(0)).to.be.reverted;
      });
      it("should increase request approval count", async () => {
        const { campaign } = await loadFixture(createRequestFixture);
        await campaign.approveRequest(0);
        const request = await campaign.requests(0);
        expect(request.approvalCount).to.be.equal(1);
      });
    });

    describe("Request finalization", () => {
      it("should restrict when stranger finalize request", async () => {
        const { campaign, accounts } = await loadFixture(createRequestFixture);
        await expect(
          campaign.connect(accounts[1]).finalizeRequest(0)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
      it("should finalize request successfully", async () => {
        const { campaign, accounts } = await loadFixture(createRequestFixture);
        await campaign.approveRequest(0);
        await expect(campaign.finalizeRequest(0)).to.changeEtherBalance(
          accounts[1],
          ethers.utils.parseEther("0.00001")
        );
      });
      it("should fail when request already completed", async () => {
        const { campaign } = await loadFixture(createRequestFixture);

        await campaign.approveRequest(0);
        await campaign.finalizeRequest(0);

        await expect(campaign.finalizeRequest(0)).to.be.reverted;
      });
      it("should fail when request doesn't have enough approvers", async () => {
        const { campaign, accounts } = await loadFixture(createRequestFixture);

        await campaign
          .connect(accounts[1])
          .contribute({ value: ethers.utils.parseEther("0.02") });

        await expect(campaign.finalizeRequest(0)).to.be.reverted;
      });
    });
  });
});
