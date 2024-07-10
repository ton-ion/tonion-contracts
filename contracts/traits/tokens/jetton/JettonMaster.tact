import "./JettonWallet.tact";
message JettonMint {
    origin: Address;
    receiver: Address;
    amount: Int;
    custom_payload: Cell?;
    forward_ton_amount: Int as coins;
    forward_payload: Slice as remaining;
}
struct JettonData {
    total_supply: Int;
    mintable: Bool;
    admin_address: Address;
    jetton_content: Cell;
    jetton_wallet_code: Cell;
}
// ============================================================ //
trait JettonMaster {
    total_supply: Int;
    mintable: Bool;
    owner: Address;
    jetton_content: Cell;

    receive(msg: JettonMint){
        let ctx: Context = context();
        dump(0);
        self._mint_validate(ctx, msg);
        dump(1);
        self._mint(ctx, msg);
        dump(2);
    }

    receive(msg: JettonBurnNotification){
        let ctx: Context = context();
        self._burn_notification_validate(ctx, msg);
        self._burn_notification(ctx, msg);
    }

    abstract inline fun calculate_jetton_wallet_init(owner_address: Address): StateInit;

    virtual inline fun _mint_validate(ctx: Context, msg: JettonMint) {
        dump(3);
        require(ctx.sender == self.owner, "JettonMaster: Sender is not a Jetton owner");
        dump(4);
        require(self.mintable, "JettonMaster: Jetton is not mintable");
        dump(5);
    }

    virtual inline fun _burn_notification_validate(ctx: Context, msg: JettonBurnNotification) {
        let initCode: StateInit = self.calculate_jetton_wallet_init(msg.sender);
        require(ctx.sender == contractAddress(initCode), "Sender is not a Jetton wallet");
    }

    virtual inline fun _mint(ctx: Context, msg: JettonMint) {
        dump(6);
        let initCode: StateInit = self.calculate_jetton_wallet_init(msg.receiver);
        self.total_supply = (self.total_supply + msg.amount);
        dump(7);
        send(SendParameters{
                to: contractAddress(initCode),
                value: 0,
                bounce: true,
                mode: SendRemainingValue,
                body: JettonInternalTransfer{
                    query_id: 0,
                    amount: msg.amount,
                    response_address: msg.origin,
                    from: myAddress(),
                    forward_ton_amount: msg.forward_ton_amount,
                    forward_payload: msg.forward_payload
                }.toCell(),
                code: initCode.code,
                data: initCode.data
            }
        );
        dump(8);
    }

    inline fun _burn_notification(ctx: Context, msg: JettonBurnNotification) {
        self.total_supply = (self.total_supply - msg.amount);
        if (msg.response_destination != null) {
            send(SendParameters{
                    to: msg.response_destination,
                    value: 0,
                    bounce: false,
                    mode: (SendRemainingValue + SendIgnoreErrors)
                }
            );
        }
    }

    // ====== Get Methods ====== //

    get fun get_jetton_data(): JettonData {
        return
            JettonData{
                total_supply: self.total_supply,
                mintable: self.mintable,
                admin_address: self.owner,
                jetton_content: self.jetton_content,
                jetton_wallet_code: self.calculate_jetton_wallet_init(myAddress()).code
            };
    }

    get fun get_wallet_address(owner_address: Address): Address {
        let initCode: StateInit = self.calculate_jetton_wallet_init(owner_address);
        return contractAddress(initCode);
    }
}