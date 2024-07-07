trait PaymentSplitter {
    _totalShares: Int;
    _totalReleased: Int;
    _shares: map<Address, Int>;
    _released: map<Address, Int>;

    fun _addPayee(account: Address, shares_: Int) {
        require(shares_ > 0, "PaymentSplitter: shares are 0");
        require(self._shares.get(account) == null || self._shares.get(account) == 0,
            "PaymentSplitter: account already has shares"
        );
        self._shares.set(account, shares_);
        self._totalShares += shares_;
    }

    fun _release(account: Address) {
        require(self._shares.get(account) != null || self._shares.get(account) != 0,
            "PaymentSplitter: account has no shares"
        );
        let shares: Int = self._shares.get(account)!!;
        let released: Int = 0;

        let a: Int? = self._released.get(account);
        if (a != null) {
            released = self._released.get(account)!!;
        }

        let totalReceived: Int = (myBalance() + self._totalReleased);
        let payment: Int = (totalReceived * shares / self._totalShares - released);

        send(SendParameters{to: account, bounce: true, value: payment, mode: (SendRemainingValue + SendIgnoreErrors)});
        
        self._released.set(account, (released + payment));
        self._totalReleased = (self._totalReleased + payment);
    }

    get fun released(account: Address): Int? {
        return self._released.get(account);
    }

    get fun shares(account: Address): Int? {
        return self._shares.get(account);
    }

    get fun totalReleased(): Int {
        return self._totalReleased;
    }

    get fun totalShares(): Int {
        return self._totalShares;
    }
}