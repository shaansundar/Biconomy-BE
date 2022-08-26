import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import addresses from '../../../env/contractAddress.json';
declare const window: any;

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  public signer: any;
  public provider: any;
  public walletAddress: any;
  public balance: Number | undefined;
  public slicedBalance: Number | undefined;
  public isWalletConnected: boolean = false;

  public USDCAddress: String = addresses.USDC_MATIC
  public ContractAddress: String = addresses.TimeLock

  constructor() {}
  public async connectWallet() {
    if (window.ethereum) {
      window.ethereum.enable();
      if (typeof window.ethereum == 'undefined') {
        alert('MetaMask is not installed!');
      }

      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();
      if(await this.signer.getChainId() !== 80001){
        alert("Please Change your network to Mumbai testnet! RPC: https://rpc-mumbai.maticvigil.com, ChainID: 80001");
      }else{
      this.walletAddress = await this.signer.getAddress();
      this.balance = await this.signer.getBalance();
      this.slicedBalance = Number(
        String((await this.signer.getBalance()) / 10 ** 18).slice(0, 6)
      );
      this.isWalletConnected = true;
      }
    } else {
      alert('Please install Metamask!');
    }
  }
}