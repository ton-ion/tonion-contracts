
// TODO emit for grant, revoke, renounce
// TODO change Int to Bytes32(int256) for roles

struct RoleData {
    hasRole: map<Address, Bool>;
    adminRole: Int;
}

message GrantRoleMessage {
    role: Int;
    account: Address;
}

message RevokeRoleMessage {
    role: Int;
    account: Address;
}

message RenounceRoleMessage {
    role: Int;
    account: Address;
}

trait accessControl {
    roleData: RoleData;
    _roles: map<Int,RoleData>;


    get fun hasRole(role: Int,account:Address): Bool {
        let r: RoleData? = self._roles.get(role);

        if (r==null) {
            return false;
        }

        let a:Bool? = r!!.hasRole.get(account);
        if(a == null || a== false){
            return false;
        }

        return true;

    }

    fun _checkRole(role:Int,account:Address) {
            nativeThrowUnless(132,self.hasRole(role,account));
    }

    fun _checkSenderRole(role:Int) {
            self._checkRole(role,sender());
    }

    get fun getRoleAdmin(role: Int): Int {
        return self._roles.get(role)!!.adminRole;
    }

    fun _grantRole(role: Int, account: Address): Bool {
        self._checkSenderRole(self.getRoleAdmin(role));

        if (!self.hasRole(role,account)) {
            self._roles.get(role)!!.hasRole.set(account,true);
            return true;
        }
        
        return false;
    }

        fun _revokeRole(role: Int, account: Address): Bool {
        self._checkSenderRole(self.getRoleAdmin(role));

        if (self.hasRole(role,account)) {
            self._roles.get(role)!!.hasRole.set(account,false);
            return true;
        }
        
        return false;
    }

    fun _renounceRole(role: Int, account:Address) {
        nativeThrowUnless(132, account == context().sender);
        self._revokeRole(role,account);
    }

    fun _setRoleAdmin(role: Int, aRole:Int) {
        let a:RoleData = self._roles.get(role)!!;
        a.adminRole = aRole;
    }

    receive(msg: GrantRoleMessage){
        self._grantRole(msg.role,msg.account);
    }

    receive(msg: RevokeRoleMessage){
        self._revokeRole(msg.role,msg.account);
    }

    receive(msg: RenounceRoleMessage){
        self._revokeRole(msg.role,msg.account);
    }
}