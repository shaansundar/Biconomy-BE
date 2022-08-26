import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import TimeLock from '../../../blockchain/artifacts/blockchain/contracts/TimeLock.sol/TimeLock.json';
import addresses from '../../../env/contractAddress.json';
import secrets from '../../../env/secrets.json';
declare const window: any;

import {
  helperAttributes,
  getDomainSeperator,
  getDataToSignForPersonalSign,
  getDataToSignForEIP712,
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
  public walletProvider: any;
  walletSigner: any;
  constructor(private walletInterface: WalletService, private contract: ContractService) {
    // this.initBiconomy();
    this.walletProvider = walletInterface.provider;
    this.walletSigner = walletInterface.signer;
  }

  // async postTx(
  //   voucher: any,
  //   contract: any,
  //   networkId: string,
  //   fromAddress: string,
  //   apiId: string,
  //   params: any,
  //   toContractAddress: string
  // ) {
  //   let userAddress: string = this.walletInterface.walletAddress;
  //   let contractInterface = new ethers.utils.Interface(TimeLock.abi);
  //   let functionSignature = contractInterface.encodeFunctionData(
  //     'withdrawWithVoucher',
  //     [voucher]
  //   );
  //   let gasPrice = await this.walletProvider.getGasPrice();
  //   let gasLimit = await this.walletProvider.estimateGas({
  //     to: contract.address,
  //     from: userAddress,
  //     data: functionSignature,
  //   });
  //   let forwarder = await getBiconomyForwarderConfig(networkId);
  //   let forwarderContract = new ethers.Contract(
  //     forwarder.address,
  //     forwarder.abi,
  //     this.walletSigner
  //   );
  //   const batchNonce = await forwarderContract.getNonce(userAddress, 0);
  //   const batchId = await forwarderContract.getBatch(userAddress);
  //   const to = contract.address;
  //   const gasLimitNum = Number(gasLimit.toNumber().toString());
  //   const request = await buildForwardTxRequest({
  //     account: userAddress,
  //     to,
  //     gasLimitNum,
  //     batchId,
  //     batchNonce,
  //     data,
  //   });

  //   /* If you wish to use EIP712 Signature type */
  //   const domainSeparator = getDomainSeperator(networkId);
  //   const dataToSign = await getDataToSignForEIP712(request, networkId);

  //   let sig;
  //   // get the user's signature
  //   this.walletProvider
  //     .send('eth_signTypedData_v3', [userAddress, dataToSign])
  //     .then(function (sig:any) {
  //       console.log(sig);
  //     })
  //     .catch(function (error:any) {
  //       console.log(error);
  //     });
  // }

  async sendTransaction(
    voucher:any,
    contractAddress:any,
    userAddress:any,
    sig:any,
    domainSeparator:any
  ) {
    let params;
    let forwarder = await getBiconomyForwarderConfig(80001);
    let forwarderContract = new ethers.Contract(
      forwarder.address,
      forwarder.abi,
      this.walletSigner
    );
    const batchNonce = await forwarderContract.getNonce(userAddress,0);
    const batchId = await forwarderContract.getBatch(userAddress);
    let contractInterface = await this.contract.getContract()
    let functionSignature = contractInterface[0].encodeFunctionData("withdrawWithVoucher", [voucher]);
    let gasLimit = await this.walletProvider.estimateGas({
      to: contractAddress,
      from: userAddress,
      data: functionSignature
    });
    const request = await buildForwardTxRequest({account:userAddress,contractAddress,gasLimit,batchId,batchNonce,voucher});
    if (domainSeparator) {
      params = [request, domainSeparator, sig];
    } else {
      params = [request, sig];
    }
    try {
      fetch(`https://api.biconomy.io/api/v2/meta-tx/native`, {
        method: 'POST',
        headers: {
          'x-api-key': secrets.BICONOMY_SDK_API,
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({
          to: contractAddress,
          apiId: '9e2644f3-1213-49a4-8bd0-38e3ba4b87b1',
          params: params,
          from: userAddress,
        }),
      })
        .then((response) => response.json())
        .then(async function (result) {
          console.log(result);
          console.log(`Transaction sent by relayer with hash ${result.txHash}`);
        })
        .catch(function (error) {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  }

  // async initBiconomy(){
  //   this.BiconomyObject = new Biconomy(window.ethereum, {
  //     apiKey: secrets.BICONOMY_SDK_API,
  //     debug: true,
  //     contractAddresses: [addresses.TimeLock], // list of contract address you want to enable gasless on
  //   });
  //   this.BiconomyTimeLockInterface = new ethers.Contract(
  //     addresses.TimeLock,
  //     TimeLock.abi,
  //     this.BiconomyObject.ethersProvider
  //   );
  //   console.log(this.BiconomyTimeLockInterface)
  // }
}
