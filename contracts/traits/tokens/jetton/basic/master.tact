import "@stdlib/ownable";
import "./wallet.tact";

message(0x7362d09c) TokenNotification {
    queryId: Int as uint64;
    amount: Int as coins;
    from: Address;
    forward_payload: Slice as remaining; // Comment Text message when Transfer the jetton
}
message(0x7bdd97de) TokenBurnNotification {
    queryId: Int as uint64;
    amount: Int as coins;
    owner: Address;
    response_destination: Address?;
}
message(0xd53276db) TokenExcesses {
    queryId: Int as uint64;
}

struct JettonData {
    totalSupply: Int;
    mintable: Bool;
    owner: Address;
    content: Cell;
    walletCode: Cell;
}
// ============================================================ //
trait Jetton with Ownable {
    totalSupply: Int; // Already set initially
    mintable: Bool;
    owner: Address;
    content: Cell;
    //! max_supply: Int; // This is not in the TEP-74 interface

    fun tokenBurnNotification(msg: TokenBurnNotification, winit:StateInit) {
        self.requireWallet(msg.owner, winit); // Check wallet
        self.totalSupply = (self.totalSupply - msg.amount); // Update supply

        if (msg.response_destination != null) {
            // Cashback
            send(SendParameters{
                    to: msg.response_destination!!,
                    value: 0,
                    bounce: false,
                    mode: (SendRemainingValue + SendIgnoreErrors),
                    body: TokenExcesses{queryId: msg.queryId}.toCell()
                }
            );
        }
    }

    // @to The Address receive the Jetton token after minting
    // @amount The amount of Jetton token being minted
    // @response_destination The previous owner address
    fun mint(to: Address, amount: Int, response_destination: Address, toWinit: StateInit) {
        self.totalSupply = (self.totalSupply + amount); // Update total supply
        send(SendParameters{
                to: contractAddress(toWinit),
                value: 0,
                bounce: false,
                mode: SendRemainingValue,
                body: TokenTransferInternal{
                    queryId: 0,
                    amount: amount,
                    from: myAddress(),
                    response_destination: response_destination,
                    forward_ton_amount: 0,
                    forward_payload: emptySlice()
                }.toCell(),
                code: toWinit.code,
                data: toWinit.data
            }
        );
    }

    fun requireWallet(owner: Address, winit: StateInit) {
        let ctx: Context = context();
        require(contractAddress(winit) == ctx.sender, "Invalid sender");
    }


    // ====== Get Methods ====== //

    fun get_jetton_data_handler(winit: StateInit): JettonData {
        let code: Cell = winit.code;
        return
            JettonData{
                totalSupply: self.totalSupply,
                mintable: self.mintable,
                owner: self.owner,
                content: self.content,
                walletCode: code
            };
    }

    get fun get_wallet_address_handler(winit: StateInit): Address {
        return contractAddress(winit);
    }
}