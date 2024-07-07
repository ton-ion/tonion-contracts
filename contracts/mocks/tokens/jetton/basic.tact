import "../../../traits/tokens/jetton/basic/master.tact";
import "../../../traits/tokens/jetton/basic/wallet.tact";
message Mint {
    amount: Int;
    receiver: Address;
}

contract SampleJettonImp with Jetton {
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
        return initOf JettonSampleWalletImp(myAddress(), address);
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

contract JettonSampleWalletImp with JettonDefaultWallet {
    balance: Int;
    owner: Address;
    master: Address;
    init(_master: Address, _owner: Address){
        self.balance = 0;
        self.master = _master;
        self.owner = _owner;
    }

    receive(msg: TokenTransfer){
        let init: StateInit = initOf JettonSampleWalletImp(self.master, msg.destination);
        self.tokenTransfer(msg, init);
    }

    receive(msg: TokenBurn){
        self.tokenBurn(msg);
    }

    receive(msg: TokenTransferInternal){
        // 0x178d4519
        let sinit: StateInit = initOf JettonSampleWalletImp(self.master, msg.from);
        self.tokenTransferInternal(msg, sinit);
    }

    get fun get_wallet_data(): JettonWalletData {
        let sinit: Cell = initOf JettonSampleWalletImp(self.master, self.owner).code;
        return self.get_wallet_data_handler(sinit);
    }
}