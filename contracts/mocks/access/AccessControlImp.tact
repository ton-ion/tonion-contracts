import "../../traits/access/accessControl.tact";

message GrantAdminRoleMessage{
    role:Int;
    adminRole:Int;
}

contract AccessControlImp with AccessControl {
    _roles: map<Int,RoleData>;

    const INCREMENT_ROLE: Int = sha256("INCREMENT_ROLE");
    const DECREMENT_ROLE: Int = sha256("DECREMENT_ROLE");
    const INVALID_ROLE: Int = sha256("INVALID_ROLE");

    init(){
        self._initRole(self.ADMIN_ROLE);
        self._initRole(self.INCREMENT_ROLE);
        self._initRole(self.DECREMENT_ROLE);
        self._grantRole(self.ADMIN_ROLE,sender());
    }

    fun grantAdminRole(role:Int,adminRole:Int) {
        self._setRoleAdmin(role,adminRole);
    }

    receive(msg: GrantAdminRoleMessage){
        self.grantAdminRole(msg.role, msg.adminRole);
    }
}