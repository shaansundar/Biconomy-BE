import { Component, OnInit } from '@angular/core';
import { ethers } from 'ethers';
import { ContractService } from '../services/contract.service';
import { WalletService } from '../services/wallet.service';

@Component({
  selector: 'app-deposit-card',
  templateUrl: './deposit-card.component.html',
  styleUrls: ['./deposit-card.component.css'],
})
export class DepositCardComponent implements OnInit {
  public contractInstance: any;
  public erc20Instance: any;
  public isLoading: boolean = true;
  public USDCDepositData: any;
  public EtherDepositData: any;
  public chosenAsset = '1';
  public depositValue: number = 0;

  constructor(public contract: ContractService, public wallet: WalletService) {}

  async ngOnInit(): Promise<void> {
    await new Promise(f => setTimeout(f, 1000));
    let instances: any = await this.contract.getContract();
    this.contractInstance = instances[0]
    this.erc20Instance = instances[1]
    this.getUserStats();
  }

  async getUserStats() {
    this.isLoading = true;
    this.USDCDepositData = await this.contractInstance.depositData(
      this.wallet.walletAddress,
      this.wallet.USDCAddress
    );
    this.EtherDepositData = await this.contractInstance.depositData(
      this.wallet.walletAddress,
      ethers.constants.AddressZero
    );
    this.isLoading = false;
  }

  changeAsset(e:any){
    console.log(e)
  }

  async approve(){
    await this.erc20Instance.approve(this.wallet.ContractAddress, ethers.utils.parseEther(`10000`))
  }

  async deposit(){
    if(this.chosenAsset == '1'){
      await this.contractInstance.depositEther({
        value: ethers.utils.parseEther(`${this.depositValue}`)
      })
    } else if(this.chosenAsset == '2'){
      try{await this.contractInstance.depositERC20(
        this.wallet.USDCAddress,
        ethers.utils.parseEther(`${this.depositValue}`)
      )}catch(e){
        alert(e)
      }
    }
  }
}
