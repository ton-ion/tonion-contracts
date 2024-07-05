trait approveable {
    allowances: map<Address,Int>;

    fun approve(spender:Address, amount:Int) {
        self.allowances.set(spender,amount);
    }

    get fun allowance(spender:Address): Int {
        let allowance:Int? = self.allowances.get(spender);
        if(allowance == null){
            return 0;
        }

        return allowance!!;
    }

    fun spendAllowance(spender:Address, amount:Int) {
        let currentAllowance:Int = self.allowance(spender);
        if(currentAllowance < amount){
            nativeThrow(8080);
        }
        self.allowances.set(spender,(currentAllowance - amount));
    }
}