// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

contract CampaignFactory {
    address[] public deployedCampaigns;

    function createCampaign(uint256 minimum) public {
        Campaign newCampaign = new Campaign(minimum, msg.sender);
        deployedCampaigns.push(address(newCampaign));
    }

    function getDeployedCampaigns() public view returns (address[] memory) {
        return deployedCampaigns;
    }
}

contract Campaign is Ownable {
    struct Request {
        string description;
        uint256 value;
        address recipient;
        bool complete;
        uint256 approvalCount;
        mapping(address => bool) approvals;
    }

    uint256 public minimumContribution;
    mapping(address => bool) public approvers;
    uint256 approversCount;
    Request[] public requests;

    constructor(uint256 minimum, address owner) {
        minimumContribution = minimum;
        _transferOwnership(owner);
    }

    function contribute() public payable {
        require(msg.value > minimumContribution);
        approvers[msg.sender] = true;
        approversCount++;
    }

    function createRequest(
        string memory description,
        uint256 value,
        address recipient
    ) public onlyOwner {
        Request storage newReq = requests.push();
        newReq.description = description;
        newReq.value = value;
        newReq.recipient = recipient;
        newReq.complete = false;
        newReq.approvalCount = 0;
    }

    function approveRequest(uint256 index) public {
        Request storage request = requests[index];

        require(approvers[msg.sender]);
        require(!request.approvals[msg.sender]);

        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }

    function finalizeRequest(uint256 index) public onlyOwner {
        Request storage request = requests[index];

        require(request.approvalCount > (approversCount / 2));
        require(!request.complete);

        payable(request.recipient).transfer(request.value);
        request.complete = true;
    }
}
