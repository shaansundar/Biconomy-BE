import { Injectable } from '@angular/core';
import { WalletService } from './wallet.service';
import addresses from '../../../env/contractAddress.json';
import TimeLock from '../../../blockchain/artifacts/blockchain/contracts/TimeLock.sol/TimeLock.json';
import erc20 from '../../../blockchain/artifacts/blockchain/contracts/TestERC20.sol/TestERC20.json';
import { ethers } from 'ethers';
@Injectable({
  providedIn: 'root',
})
export class ContractService {
  public TimeLockInterface: any; ERC20: any;
  constructor(private walletService: WalletService) {
  }

  async getContract() {
    this.TimeLockInterface = new ethers.Contract(
      addresses.TimeLockV2,
      TimeLock.abi,
      this.walletService.signer
    );
    this.ERC20 = new ethers.Contract(
      addresses.USDC_MATIC,
      erc20.abi,
      this.walletService.signer
    );
    return [this.TimeLockInterface, this.ERC20];
  }

}
