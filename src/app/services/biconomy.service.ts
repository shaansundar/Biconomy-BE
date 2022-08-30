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

const domainType = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'verifyingContract', type: 'address' },
  { name: 'salt', type: 'bytes32' },
];
const metaTransactionType = [
  { name: 'nonce', type: 'uint256' },
  { name: 'from', type: 'address' },
  { name: 'functionSignature', type: 'bytes' },
];

@Injectable({
  providedIn: 'root',
})
export class BiconomyService {
  public BiconomyObject: any;
  public BiconomyTimeLockInterface: any;
  public domainData = {
    name: 'TimeLock',
    version: 'V1',
    verifyingContract: addresses.TimeLockV2,
    salt: '0x' + (42).toString(16).padStart(64, '0'),
  };
  constructor(
    private walletInterface: WalletService,
    private contract: ContractService
  ) {
    //Uncomment the next 2 lines to use SDK instead
    this.initBiconomy();
  }

  async sendTransaction(voucher: any) {
    let contracts = await this.contract.getContract();
    let contractInstance = contracts[0];

    let userAddress = this.walletInterface.walletAddress;
    let ethersProvider = this.walletInterface.provider;

    let nonce = await contractInstance.getNonce(userAddress);
    const contractInterface = new ethers.utils.Interface(TimeLock.abi);
    console.log(contractInterface);
    let functionSignature;
    try {
      functionSignature = contractInterface.encodeFunctionData(
        'withdrawWithVoucher',
        [voucher]
      );
    } catch (e) {
      console.log(e);
    }
    let message = {
      nonce: parseInt(nonce),
      from: userAddress,
      functionSignature: functionSignature,
    };
    let dataToSign = JSON.stringify({
      types: {
        EIP712Domain: domainType,
        MetaTransaction: metaTransactionType,
      },
      domain: this.domainData,
      primaryType: 'MetaTransaction',
      message: message,
    });

    let signature = await ethersProvider.send('eth_signTypedData_v3', [
      userAddress,
      dataToSign,
    ]);

    if (!ethers.utils.isHexString(signature)) {
      throw new Error(
        'Given value "'.concat(signature, '" is not a valid hex string.')
      );
    }
    const r = signature.slice(0, 66);
    const s = '0x'.concat(signature.slice(66, 130));
    let v = '0x'.concat(signature.slice(130, 132));
    v = ethers.BigNumber.from(v).toString();
    if (![27, 28].includes(Number(v))) v += 27;

    const provider = await this.BiconomyObject.provider;
    let { data } =
      await contractInstance.populateTransaction.executeMetaTransaction(
        userAddress,
        functionSignature,
        r,
        s,
        v
      );

    let txParams = {
      data: data,
      to: addresses.TimeLockV2,
      from: userAddress,
      signatureType: 'EIP712_SIGN',
    };

    try {
      let Tx = await this.BiconomyObject.biconomyForwarder.provider.send('eth_sendTransaction', [txParams]);
      alert(Tx)
    } catch (error) {
      alert(error);
    }
  }

  async initBiconomy() {
    this.BiconomyObject = new Biconomy(window.ethereum, {
      apiKey: secrets.BICONOMY_SDK_API,
      debug: true,
      contractAddresses: [addresses.TimeLockV2], // list of contract address you want to enable gasless on
    });
    this.BiconomyTimeLockInterface = new ethers.Contract(
      addresses.TimeLockV2,
      TimeLock.abi,
      this.BiconomyObject.ethersProvider
    );
    await this.BiconomyObject.init();
    console.log(this.BiconomyObject);
    console.log(this.BiconomyObject.provider);
  }
}
