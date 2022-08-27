import { Component, OnInit } from '@angular/core';
import { ethers } from 'ethers';
import { BiconomyService } from '../services/biconomy.service';
import { ContractService } from '../services/contract.service';
import addresses from '../../../env/contractAddress.json';
import { WalletService } from '../services/wallet.service';

@Component({
  selector: 'app-withdraw-card',
  templateUrl: './withdraw-card.component.html',
  styleUrls: ['./withdraw-card.component.css'],
})
export class WithdrawCardComponent implements OnInit {
  public withdrawValue: any = '0';
  public chosenAsset: any = '1';
  constructor(
    public biconomyAPI: BiconomyService,
    public wallet: WalletService,
    public contract: ContractService,
  ) {}

  async gaslessTx() {
    let voucher = {
      user: await this.wallet.walletAddress,
      token: ethers.constants.AddressZero,
      amount: ethers.utils.parseEther(`${1}`),
    };
    let deployedContract = await this.contract.getContract();
    const hashedVoucher = await deployedContract[0].getVoucherHash({
      ...voucher,
      signature: 0,
    });
    const userSignature = await this.wallet.signer.signMessage(
      ethers.utils.arrayify(hashedVoucher)
    );
    let newVoucher = { ...voucher, signature: userSignature };
    await this.biconomyAPI.sendTransaction(
      newVoucher,
      addresses.TimeLock,
      this.wallet.walletAddress,
      userSignature,
      false
    );
    window.location.reload();
  }

  async gasTx() {
    let deployedContract = await this.contract.getContract();
    if (this.chosenAsset == '1') {
      try {
        let tx = await deployedContract[0].withdrawEtherDirect(
          ethers.utils.parseEther(`${this.withdrawValue}`)
        );
        await tx.wait()
      } catch (e) {
        alert(e);
      }
    } else if (this.chosenAsset == '2') {
      try {
        let tx = await deployedContract[0].withdrawERC20Direct(
          this.wallet.USDCAddress,
          ethers.utils.parseEther(`${this.withdrawValue}`)
        );
        await tx.wait();
      } catch (e) {
        alert(e);
      }
    }
    window.location.reload();
  }

  ngOnInit(): void {}
}
