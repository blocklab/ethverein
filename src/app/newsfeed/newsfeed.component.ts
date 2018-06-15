import { MemberContractService } from './../services/member-contract.service';
import { Web3Service } from './../services/web3.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-newsfeed',
  templateUrl: './newsfeed.component.html',
  styleUrls: ['./newsfeed.component.css']
})
export class NewsfeedComponent implements OnInit {
  web3: any;
  memberContractAddress;
  membersContract;
  events;
  filter;

  constructor(
    private web3Service: Web3Service,
    private memberContractService: MemberContractService
  ) {

    this.web3 = this.web3Service.getWeb3();
    this.memberContractAddress = this.memberContractService.getAddress();
    this.filter = this.web3.eth.filter({ fromBlock: 0, toBlock: 'latest', address: this.memberContractAddress });
    this.membersContract = this.memberContractService.getContract();

    for (let i = 0; i < 50; i++) {
      this.web3.eth.getStorageAt(this.memberContractAddress, i, (err, res) => {
        console.log(res);
      });
    }
  }



  ngOnInit() {

  }


}


