struct JettonWalletData {
    balance: Int;
    owner: Address;
    master: Address;
    walletCode: Cell;
}
message(0xf8a7ea5) TokenTransfer {
    queryId: Int as uint64;
    amount: Int as coins;
    destination: Address;
    response_destination: Address;
    custom_payload: Cell?;
    forward_ton_amount: Int as coins;
    forward_payload: Slice as remaining; // Comment Text message when Transfer the jetton
}
message(0x178d4519) TokenTransferInternal {
    queryId: Int as uint64;
    amount: Int as coins;
    from: Address;
    response_destination: Address;
    forward_ton_amount: Int as coins;
    forward_payload: Slice as remaining; // Comment Text message when Transfer the jetton
}
message(0x595f07bc) TokenBurn {
    queryId: Int as uint64;
    amount: Int as coins;
    owner: Address;
    response_destination: Address;
}
// ============================================================ //
trait JettonDefaultWallet {
    const minTonsForStorage: Int = ton("0.01");
    const gasConsumption: Int = ton("0.01");
    balance: Int;
    owner: Address;
    master: Address;

    fun tokenTransfer(msg: TokenTransfer, init: StateInit) {
        // 0xf8a7ea5
        let ctx: Context = context(); // Check sender
        require(ctx.sender == self.owner, "Invalid sender");
        // Gas checks
        let fwdFee: Int = (ctx.readForwardFee() + ctx.readForwardFee());
        let final: Int = ((2 * self.gasConsumption + self.minTonsForStorage) + fwdFee);
        require(ctx.value > min(final, ton("0.01")), "Invalid value!!");
        // Update balance
        self.balance = (self.balance - msg.amount);
        require(self.balance >= 0, "Invalid balance");
        let walletAddress: Address = contractAddress(init);
        send(SendParameters{
                to: walletAddress,
                value: 0,
                mode: SendRemainingValue,
                bounce: false,
                body: TokenTransferInternal{
                    queryId: msg.queryId,
                    amount: msg.amount,
                    from: self.owner,
                    response_destination: msg.response_destination,
                    forward_ton_amount: msg.forward_ton_amount,
                    forward_payload: msg.forward_payload
                }.toCell(),
                code: init.code,
                data: init.data
            }
        );
    }

    fun tokenTransferInternal(msg: TokenTransferInternal, sInit: StateInit) {
        let ctx: Context = context();
        if (ctx.sender != self.master) {
            require(contractAddress(sInit) == ctx.sender, "Invalid sender!");
        }
        // Update balance
        self.balance = (self.balance + msg.amount);
        require(self.balance >= 0, "Invalid balance");
        // Get value for gas
        let msgValue: Int = self.msgValue(ctx.value);
        let fwdFee: Int = ctx.readForwardFee();
        msgValue = ((msgValue - msg.forward_ton_amount) - fwdFee);
        // 0x7362d09c - notify the new owner of JettonToken that the transfer is complete
        if (msg.forward_ton_amount > 0) {
            send(SendParameters{
                    to: self.owner,
                    value: msg.forward_ton_amount,
                    mode: (SendPayGasSeparately + SendIgnoreErrors),
                    bounce: false,
                    body: TokenNotification{
                        queryId: msg.queryId,
                        amount: msg.amount,
                        from: msg.from,
                        forward_payload: msg.forward_payload
                    }.toCell()
                }
            );
        }
        // 0xd53276db -- Cashback to the original Sender
        if (msg.response_destination != null) {
            send(SendParameters{
                    to: msg.response_destination,
                    value: msgValue,
                    bounce: false,
                    body: TokenExcesses{queryId: msg.queryId}.toCell(),
                    mode: SendIgnoreErrors
                }
            );
        }
    }

    fun tokenBurn(msg: TokenBurn) {
                let ctx: Context = context();
        require(ctx.sender == self.owner, "Invalid sender"); // Check sender

        self.balance = (self.balance - msg.amount); // Update balance
        require(self.balance >= 0, "Invalid balance");
        let fwdFee: Int = ctx.readForwardFee(); // Gas checks
        require(ctx.value > ((fwdFee + 2 * self.gasConsumption) + self.minTonsForStorage), "Invalid value - Burn");
        // Burn tokens
        send(SendParameters{
                to: self.master,
                value: 0,
                mode: SendRemainingValue,
                bounce: true,
                body: TokenBurnNotification{
                    queryId: msg.queryId,
                    amount: msg.amount,
                    owner: self.owner,
                    response_destination: self.owner
                }.toCell()
            }
        );
    }

    get fun msgValue(value: Int): Int {
        let msgValue: Int = value;
        let tonBalanceBeforeMsg: Int = (myBalance() - msgValue);
        let storageFee: Int = (self.minTonsForStorage - min(tonBalanceBeforeMsg, self.minTonsForStorage));
        msgValue = (msgValue - (storageFee + self.gasConsumption));
        return msgValue;
    }

    bounced(src: bounced<TokenTransferInternal>){
        self.balance = (self.balance + src.amount);
    }

    bounced(src: bounced<TokenBurnNotification>){
        self.balance = (self.balance + src.amount);
    }

    fun get_wallet_data_handler(walletCode: Cell): JettonWalletData {
        return
            JettonWalletData{
                balance: self.balance,
                owner: self.owner,
                master: self.master,
                walletCode: walletCode
            };
    }
}