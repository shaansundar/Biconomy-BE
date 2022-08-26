import { Injectable } from '@angular/core';
import { Biconomy } from '@biconomy/mexa';
import { ethers } from 'ethers';
import TimeLock from '../../../blockchain/artifacts/blockchain/contracts/TimeLock.sol/TimeLock.json';
import addresses from '../../../env/contractAddress.json';
import secrets from '../../../env/secrets.json'
declare const window: any;


@Injectable({
  providedIn: 'root'
})

export class BiconomyService {

  public BiconomyObject: any;
  public BiconomyTimeLockInterface: any;
  constructor() { 
    this.initBiconomy();
  }

  async initBiconomy(){
    this.BiconomyObject = new Biconomy(window.ethereum, {
      apiKey: secrets.BICONOMY_SDK_API,
      debug: true,
      contractAddresses: [addresses.TimeLock], // list of contract address you want to enable gasless on
    });
    this.BiconomyTimeLockInterface = new ethers.Contract(
      addresses.TimeLock,
      TimeLock.abi,
      this.BiconomyObject.ethersProvider
    );
    console.log(this.BiconomyTimeLockInterface)
  }




}
