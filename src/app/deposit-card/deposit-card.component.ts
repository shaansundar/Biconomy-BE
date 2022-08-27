import { Component, OnInit } from '@angular/core';
import { BigNumber } from 'ethers';
import { ethers } from 'ethers';
import { Subscription, interval } from 'rxjs';
import { ContractService } from '../services/contract.service';
import { WalletService } from '../services/wallet.service';

@Component({
  selector: 'app-deposit-card',
  templateUrl: './deposit-card.component.html',
  styleUrls: ['./deposit-card.component.css'],
})
export class DepositCardComponent implements OnInit {
  public subscription: Subscription | any;
  public USDCCountdown: any;
  public EtherCountdown: any;
  public contractInstance: any;
  public erc20Instance: any;
  public isLoading: boolean = true;
  public USDCDepositData: any;
  public EtherDepositData: any;
  public chosenAsset = '1';
  public depositValue: number = 0;

  constructor(public contract: ContractService, public wallet: WalletService) {}

  async ngOnInit(): Promise<void> {
    await new Promise((f) => setTimeout(f, 1000));
    let instances: any = await this.contract.getContract();
    this.contractInstance = instances[0];
    this.erc20Instance = instances[1];
    this.getUserStats();
    this.subscription = interval(1000).subscribe((x) => {
      this.getTimeDifference();
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private getTimeDifference() {
    let usdcDiff = this.USDCDepositData[1] * 1000 - new Date().getTime();
    let ethDiff = this.EtherDepositData[1] * 1000 - new Date().getTime();
    this.USDCCountdown = this.allocateTimeUnits(usdcDiff > 0 ? usdcDiff : 0);
    this.EtherCountdown = this.allocateTimeUnits(ethDiff > 0 ? ethDiff : 0);
  }

  private allocateTimeUnits(timeDifference: any) {
    return Math.floor((timeDifference / 1000) % 60);
  }

  public formatEther(e: string) {
    return ethers.utils.formatEther(e);
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

  changeAsset(e: any) {
    console.log(e);
  }

  async approve() {
    await this.erc20Instance.approve(
      this.wallet.ContractAddress,
      ethers.utils.parseEther(`10000`)
    );
  }

  async deposit() {
    this.isLoading = true;
    if (this.chosenAsset == '1') {
      let tx = await this.contractInstance.depositEther({
        value: ethers.utils.parseEther(`${this.depositValue}`),
      });
      await tx.wait();
    } else if (this.chosenAsset == '2') {
      try {
        let tx = await this.contractInstance.depositERC20(
          this.wallet.USDCAddress,
          ethers.utils.parseEther(`${this.depositValue}`)
        );
        await tx.wait();
      } catch (e) {
        alert(e);
      }
    }
    window.location.reload();
  }
}
