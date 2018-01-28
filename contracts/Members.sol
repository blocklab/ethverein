pragma solidity ^0.4.17;

import "./ConvertLib.sol";

// This is just a simple example of a coin-like contract.
// It is not standards compatible and cannot be expected to talk to other
// coin/token contracts. If you want to create a standards-compliant
// token, see: https://github.com/ConsenSys/Tokens. Cheers!

contract Members {

	enum MemberStatus {
		// not a member or applicant
		NONE,
		// account applied for membership
		APPLIED,
		// regular, confirmed member
		REGULAR,
		// member with board voting rights
		BOARD
	}

	struct Member {
		string name;
		MemberStatus status;
	}

	mapping (address => Member) public members;
	address[] public memberAddresses;
	mapping (address => address[]) confirmations;

	function Members(address[] initialMemberAddresses) public {
		for (uint index = 0; index < initialMemberAddresses.length; index++) {
			// all initial members are board members
			members[initialMemberAddresses[index]] = Member({name: "???", status: MemberStatus.BOARD});
			memberAddresses.push(initialMemberAddresses[index]);
		}
	}

	function getNumberOfMembers() public view returns (uint) {
		return memberAddresses.length;
	}

	function applyForMembership(string memberName) public {
		require (members[tx.origin].status == MemberStatus.NONE);
		members[tx.origin] = Member({name: memberName, status: MemberStatus.APPLIED});
		memberAddresses.push(tx.origin);
	}

	function confirmApplication(address applicant) public {
		require (members[tx.origin].status == MemberStatus.BOARD);
		require (members[applicant].status == MemberStatus.APPLIED);
		confirmations[applicant].push(tx.origin);
		bool allBoardMembersConfirmed = true;
		for (uint index = 0; index < getNumberOfMembers(); index++) {
			address memberAddress = memberAddresses[index];
			if (members[memberAddress].status == MemberStatus.BOARD && !hasConfirmedApplicant(memberAddress, applicant)) {
				allBoardMembersConfirmed = false;
				break;
			}
		}
		if (allBoardMembersConfirmed) {
			members[applicant].status = MemberStatus.REGULAR;
			delete confirmations[applicant];
		}
	}

	function hasConfirmedApplicant(address boardMember, address applicant) private view returns (bool) {
		for (uint index = 0; index < confirmations[applicant].length; index++) {
			if (confirmations[applicant][index] == boardMember)
				return true;
		}
		return false;
	}

	function changeName(string newName) public {
		members[tx.origin].name = newName;
	}
}
