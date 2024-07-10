trait MaxSupply {
    max_supply: Int;
    total_supply: Int;

    fun requireMaxSupply(mintAmount: Int) {
        if(self.max_supply < (self.total_supply + mintAmount)){
            throw(7878);
        }
    }

    fun checkMaxSupply(mintAmount: Int): Bool {
        return self.max_supply >= (self.total_supply + mintAmount);
    }

    get fun isMaxSupplyReached(): Bool {
        return self.max_supply == self.total_supply;
    }

    get fun maxSupply(): Int {
        return self.max_supply;
    }
}