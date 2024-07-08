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

message GrantRoleEvent {
    role: Int;
    account: Address;
}

message RevokeRoleEvent {
    role: Int;
    account: Address;
}

message RenounceRoleEvent {
    role: Int;
    account: Address;
}

struct RoleData {
    hasRole: map<Address, Bool>;
    adminRole: Int;
}

trait AccessControl {
    _roles: map<Int,RoleData>;

    const ADMIN_ROLE: Int = sha256("ADMIN_ROLE");

    fun _initRole(role: Int): Bool{
        let a: RoleData? = self._roles.get(role);
        if(a == null){
            self._roles.set(role,RoleData{
                hasRole : emptyMap(),
                adminRole : self.ADMIN_ROLE
            });
            return true;
        }
        return false;
    }

    fun _setRoleAdmin(role: Int, adminRole:Int) {
        let r:RoleData = self._roles.get(role)!!;
        r.adminRole = adminRole;
        self._roles.set(role,r);
    }

     fun _grantRole(role: Int, account: Address) {
        if (!self.hasRole(role,account)) {
            let currnetRole:RoleData = self._roles.get(role)!!;
            currnetRole.hasRole.set(account,true);
            self._roles.set(role,currnetRole);
            emit(GrantRoleEvent{role:role,account:account}.toCell());
        }
     }

    fun _revokeRole(role: Int, account: Address) {
        if (self.hasRole(role,account)) {
            let currnetRole:RoleData = self._roles.get(role)!!;
            currnetRole.hasRole.set(account,false);
            self._roles.set(role,currnetRole);
            emit(RevokeRoleEvent{role:role,account:account}.toCell());
        }
     }

    fun _checkRole(role:Int,account:Address) {
            nativeThrowUnless(132,self.hasRole(role,account));
    }

    fun _checkSenderRole(role:Int) {
        self._checkRole(role,sender());
    }


    virtual fun renounceRole(role: Int, account:Address) {
        nativeThrowUnless(777, account == context().sender);
        self._revokeRole(role,account);
    }

    virtual fun revokeRole(role: Int, account: Address) {
        self._checkSenderRole(self.getRoleAdmin(role));
        self._revokeRole(role,account);
    }

    virtual fun grantRole(role: Int, account: Address) {
        self._checkSenderRole(self.getRoleAdmin(role));
        self._grantRole(role,account);
    } 

    get fun hasRole(role:Int, account:Address): Bool{
        let r: RoleData? = self._roles.get(role);
        if(r == null){
            return false;
        }

        let a:Bool? = r!!.hasRole.get(account);

        if(a == null || a == false){
            return false;
        }
        return true;
    }

    get fun getRoleAdmin(role: Int): Int {
        let r: RoleData? = self._roles.get(role);
        if(r == null){
            nativeThrow(666);
        }
        return r!!.adminRole;
    }

    receive(msg: GrantRoleMessage){
        self.grantRole(msg.role,msg.account);
    }

    receive(msg: RevokeRoleMessage){
        self.revokeRole(msg.role,msg.account);
    }

    receive(msg: RenounceRoleMessage){
        self.renounceRole(msg.role,msg.account);
    }
}