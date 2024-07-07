import "../../../traits/tokens/jetton/basic/master.tact";
import "../../../traits/tokens/jetton/basic/wallet.tact";
import "../../../traits/tokens/jetton/extensions/approveable.tact";
message Mint {
    amount: Int;
    receiver: Address;
}

contract MaxSupplyJettonImp with Jetton {
    totalSupply: Int as coins;
    owner: Address;
    content: Cell;
    mintable: Bool;
    init(owner: Address, content: Cell){
        self.totalSupply = 0;
        self.owner = owner;
        self.mintable = true;
        self.content = content;
    }

    receive(msg: Mint){
        let ctx: Context = context();
        require(ctx.sender == self.owner, "Not Owner");
        require(self.mintable, "Can't Mint Anymore");
        let toWinit: StateInit = self.getJettonWalletInit(msg.receiver); // Create message
        self.mint(msg.receiver, msg.amount, self.owner, toWinit); // (to, amount, response_destination)
    }

    receive("Owner: MintClose"){
        let ctx: Context = context();
        require(ctx.sender == self.owner, "Not Owner");
        self.mintable = false;
    }

    receive(msg: TokenBurnNotification){
        let toWinit: StateInit = self.getJettonWalletInit(msg.owner); // Create message
        self.tokenBurnNotification(msg, toWinit);
    }

    fun getJettonWalletInit(address: Address): StateInit {
        return initOf JettonApproveableWalletImp(myAddress(), address);
    }

    get fun get_jetton_data(): JettonData {
        let winit: StateInit = self.getJettonWalletInit(myAddress());
        return self.get_jetton_data_handler(winit);
    }

    get fun get_wallet_address(owner: Address): Address {
        let winit: StateInit = self.getJettonWalletInit(owner);
        return self.get_wallet_address_handler(winit);
    }
}

contract JettonApproveableWalletImp with JettonDefaultWallet, approveableWallet {
    balance: Int;
    owner: Address;
    master: Address;
    allowances: map<Address, Int>;
    init(_master: Address, _owner: Address){
        self.balance = 0;
        self.master = _master;
        self.owner = _owner;
    }

    receive(msg: TokenTransfer){
        let init: StateInit = initOf JettonApproveableWalletImp(self.master, msg.destination);
        self.tokenTransfer(msg, init);
    }

    receive(msg: TokenBurn){
        self.tokenBurn(msg);
    }

    receive(msg: TokenTransferInternal){
        // 0x178d4519
        let sinit: StateInit = initOf JettonApproveableWalletImp(self.master, msg.from);
        self.tokenTransferInternal(msg, sinit);
    }

    receive(msg: TokenApprove){
        let ctx: Context = context(); // Check sender
        require(ctx.sender == self.owner, "Invalid sender");
        self.approve(msg.spender,msg.amount);
    }

    // TODO : fix me
    // receive(msg: TokenSpend){
    //     let ctx: Context = context();
    //     self.spendAllowance(ctx.sender, msg.amount);
    //     let init: StateInit = initOf JettonApproveableWalletImp(self.master, msg.destination);
    //     self._tokenTransfer(TokenTransfer{
    //             queryId: msg.queryId,
    //             amount: msg.amount,
    //             destination: msg.destination,
    //             response_destination: msg.response_destination,
    //             custom_payload: msg.custom_payload,
    //             forward_ton_amount: msg.forward_ton_amount,
    //             forward_payload: msg.forward_payload
    //         },
    //         init
    //     );
    // }

    get fun get_wallet_data(): JettonWalletData {
        let sinit: Cell = initOf JettonApproveableWalletImp(self.master, self.owner).code;
        return self.get_wallet_data_handler(sinit);
    }
}