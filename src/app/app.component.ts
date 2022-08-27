import { Component } from '@angular/core';
import { BiconomyService } from './services/biconomy.service';
import { ContractService } from './services/contract.service';
import { WalletService } from './services/wallet.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'TimeLocked Contract';
  constructor(public walletService : WalletService, public contract : ContractService,
    // public biconomy: BiconomyService
    ){}
  async ngOnInit(): Promise<void> {
    await this.walletService.connectWallet();
    console.log(this.walletService.walletAddress)
    this.walletService.walletAddress ? this.walletService.isWalletConnected=true : this.walletService.isWalletConnected=false
  }
}
