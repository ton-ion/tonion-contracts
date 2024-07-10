import "@stdlib/ownable";
import "../../traits/payments/PaymentSplitter.tact";


message AddPayee {
    payee:Address;
    shares: Int;
}


contract PaymentSplitterImp with PaymentSplitter, Ownable {
    owner: Address;
    _totalShares: Int;
    _totalReleased: Int as coins;
    _shares: map<Address, Int>;
    _released: map<Address, Int>;

    init(owner: Address){
        self.owner = owner;
        self._totalReleased = 0;
        self._totalShares = 0;
    }

    receive(msg: AddPayee){
        self.requireOwner();
        self._addPayee(msg.payee, msg.shares);
        self.reply("refund".asComment());
    }

    receive("release"){
        let ctx: Context = context();
        self._release(ctx.sender);
        self.reply("refund".asComment());
    }

    receive() {
    }
}