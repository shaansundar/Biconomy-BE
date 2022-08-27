import { Injectable } from '@angular/core';
import { Biconomy } from '@biconomy/mexa';
import { Console } from 'console';
import { ethers } from 'ethers';
import TimeLock from '../../../blockchain/artifacts/blockchain/contracts/TimeLock.sol/TimeLock.json';
import addresses from '../../../env/contractAddress.json';
import secrets from '../../../env/secrets.json';
declare const window: any;

import {
  buildForwardTxRequest,
  getBiconomyForwarderConfig,
} from './biconomyForwarderHelpers';
import { ContractService } from './contract.service';
import { WalletService } from './wallet.service';

@Injectable({
  providedIn: 'root',
})
export class BiconomyService {
  public BiconomyObject: any;
  public BiconomyTimeLockInterface: any;
  constructor(private walletInterface: WalletService, private contract: ContractService) {

    //Uncomment the next 2 lines to use SDK instead
    // initBiconomy()
    // await BiconomyObject.init();

  }
  async sendTransaction(
    voucher:any,
    contractAddress:any,
    userAddress:any,
    sig:any,
    domainSeparator:any
  ) {
    alert("WORK IN PROGRESS")
    // let params;
    // let forwarder = await getBiconomyForwarderConfig(80001);
    // let forwarderContract = new ethers.Contract(
    //   forwarder.address,
    //   forwarder.abi,
    //   this.walletInterface.signer
    //   );
    // const batchNonce = await forwarderContract.getNonce(userAddress,0);
    // const batchId = await forwarderContract.getBatch(userAddress);
    // // const batchId = 0
    // let contractInterface:any = new ethers.utils.Interface(TimeLock.abi)
    // let functionSignature = contractInterface[0].encodeFunctionData("withdrawWithVoucher", [voucher]);
    // let gasLimit = await this.walletInterface.provider.estimateGas({
    //   to: contractAddress,
    //   from: userAddress,
    //   data: functionSignature
    // });
    // console.log("REACHED")
    // const request = await buildForwardTxRequest({account:userAddress,contractAddress,gasLimit,batchId,batchNonce,voucher});
    // if (domainSeparator) {
    //   params = [request, domainSeparator, sig];
    // } else {
    //   params = [request, sig];
    // }
    // try {
    //   console.log(contractAddress,'9e2644f3-1213-49a4-8bd0-38e3ba4b87b1',params,userAddress)
    //   fetch(`https://api.biconomy.io/api/v2/meta-tx/native`, {
    //     method: 'POST',
    //     headers: {
    //       'x-api-key': secrets.BICONOMY_SDK_API,
    //       'Content-Type': 'application/json;charset=utf-8',
    //     },
    //     body: JSON.stringify({
    //       to: contractAddress,
    //       apiId: '9e2644f3-1213-49a4-8bd0-38e3ba4b87b1',
    //       params: params,
    //       from: userAddress,
    //     }),
    //   })
    //     .then((response) => response.json())
    //     .then(async function (result) {
    //       console.log(result);
    //       console.log(`Transaction sent by relayer with hash ${result.txHash}`);
    //     })
    //     .catch(function (error) {
    //       console.log(error);
    //     });
    // } catch (error) {
    //   console.log(error);
    // }
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
  }
}
