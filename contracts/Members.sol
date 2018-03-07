pragma solidity ^0.4.17;

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

	function isRegularOrBoardMember(address memberAddress) public view returns (bool) {
		MemberStatus status = members[memberAddress].status;
		return status == MemberStatus.REGULAR || status == MemberStatus.BOARD;
	}

	/**
	 * Resign membership - Deletes sender address from list of members 
	 * (as long as it is not the last remaining member)
	 */
	function resignOwnMembership() public {
		require(isRegularOrBoardMember(msg.sender));
	
		// don't allow last man standing to resign
		if (getNumberOfMembers() == 1) {
			revert();
		}

		// reset membership status
		members[msg.sender].status = MemberStatus.NONE;
		
		// delete address of (ex) member from list of member addresses
		uint numberOfMembers = getNumberOfMembers();
		for (uint index = 0; index < numberOfMembers; index++) {
			address memberAddress = memberAddresses[index];
			if (memberAddress == msg.sender) {
				// delete by replacing item with last element of the array
				memberAddresses[index] = memberAddresses[numberOfMembers-1];
				memberAddresses.length--;
				break;
			}
		}
	}
}
