trait JettonMaxSupply {
    maxSupply: Int;
    totalSupply: Int;

    fun requireMaxSupply(mintAmount: Int) {
        if(self.maxSupply >= (self.totalSupply + mintAmount)){
            throw(7878);
        }
    }

    fun checkMaxSupply(mintAmount: Int): Bool {
        return self.maxSupply >= (self.totalSupply + mintAmount);
    }

    get fun isMaxSupplyReached(): Bool {
        return self.maxSupply == self.totalSupply;
    }
}