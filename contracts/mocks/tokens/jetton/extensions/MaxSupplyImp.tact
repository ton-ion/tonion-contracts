import "@stdlib/deploy";
import "../../../../traits/tokens/jetton/JettonMaster.tact";
import "../../../../traits/tokens/jetton/JettonWallet.tact";
import "../../../../traits/tokens/jetton/extensions/MaxSupply.tact";

contract MaxSupplyImp with JettonMaster, MaxSupply, Deployable {
    total_supply: Int as coins;
    max_supply: Int as coins;
    owner: Address;
    jetton_content: Cell;
    mintable: Bool;
    
    init(owner: Address, content: Cell){
        self.total_supply = 0;
        self.max_supply = ton("1000");
        self.owner = owner;
        self.mintable = true;
        self.jetton_content = content;
    }

    override inline fun calculate_jetton_wallet_init(owner_address: Address): StateInit {
        return initOf JettonWalletImp(owner_address, myAddress());
    }

    override inline fun _mint_validate(ctx: Context, msg: JettonMint) {
        require(ctx.sender == self.owner, "JettonMaster: Sender is not a Jetton owner");
        require(self.mintable, "JettonMaster: Jetton is not mintable");
        self.requireMaxSupply(msg.amount);
    }

    receive("Mint:Close"){
        let ctx: Context = context();
        require(ctx.sender == self.owner, "JettonMaster: Sender is not a Jetton owner");
        self.mintable = false;
    }

}

contract JettonWalletImp with JettonWallet, Deployable {
    balance: Int as coins = 0;
    owner: Address;
    jetton_master: Address;

    init(owner: Address, jetton_master: Address) {
        self.owner = owner;
        self.jetton_master = jetton_master;
    }

    override inline fun calculate_jetton_wallet_init(owner_address: Address): StateInit {
        return initOf JettonWalletImp(owner_address, self.jetton_master);
    }
}