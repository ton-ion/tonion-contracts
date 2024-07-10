import "../../traits/access/OwnableTransferable2Step.tact";

contract OwnableTransferable2StepImp with OwnableTransferable2Step {
    owner:Address;
    _pendingOwner: Address?;

    init(){
        self.owner = sender();
    }
}