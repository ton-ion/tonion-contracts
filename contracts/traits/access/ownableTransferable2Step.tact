import "@stdlib/ownable";

/**
 * @dev This extension of the {Ownable} contract includes a two-step mechanism to transfer
 * ownership, where the new owner must sned {AcceptOwnership2Step} message in order to replace the
 * old one. This can help prevent common mistakes, such as transfers of ownership to
 * incorrect accounts, or to contracts that are unable to interact with the
 * permission system.
 *
 * The initial owner is specified at deployment time for `Ownable`. This
 * can later be changed with {ChangeOwner2Step} and {AcceptOwnership2Step} message.
 */

message ChangeOwner2Step {
    queryId: Int as uint64;
    pendingOwner: Address;
}
message ChangeOwner2StepOk {
    queryId: Int as uint64;
    pendingOwner: Address;
}
message AcceptOwnership2StepOk {
    queryId: Int as uint64;
    newOwner: Address;
}
message AcceptOwnership2Step {
    queryId: Int as uint64;
}

//
trait OwnableTransferable2Step with Ownable {
    owner: Address;
    _pendingOwner: Address?;

    /**
     * @dev Starts the ownership transfer of the contract to a new account. Replaces the pending transfer if there is one.
     * Can only be called by the current owner.
     */
    receive(msg: ChangeOwner2Step){
        // Check if the sender is the owner
        self.requireOwner();
        // Update _pendingOwner
        self._pendingOwner = msg.pendingOwner;
        // Reply result
        self.reply(ChangeOwner2StepOk{queryId: msg.queryId, pendingOwner: msg.pendingOwner}.toCell());
    }

    /**
     * @dev The new owner accepts the ownership transfer.
     */
    receive(msg: AcceptOwnership2Step){
        // Check if the sender is the _pendingOwner
        self._requirePendingOwner();
        // Update owner and delete _pendingOwner
        self._transferOwnership(sender());
        // Reply result
        self.reply(AcceptOwnership2StepOk{queryId: msg.queryId, newOwner: self.owner}.toCell());
    }

    fun _requirePendingOwner() {
        nativeThrowUnless(132, sender() == self._pendingOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`) and deletes any pending owner.
     * Internal function without access restriction.
     */

    fun _transferOwnership(newOwner: Address) {
        self.owner = newOwner;
        self._pendingOwner = null;
    }

    /**
     * @dev Returns the address of the pending owner.
     */

    get fun pendingOwner(): Address? {
        return self._pendingOwner;
    }
}