import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import '@ton/test-utils';
import {
    OwnableTransferable2StepImp,
} from '../../build/Ownable2Step/tact_OwnableTransferable2StepImp';

export function shouldBehaveLikeOwnableTransferable2Step(): void {
    let blockchain: Blockchain;
    let ownableTransferable2Step: SandboxContract<OwnableTransferable2StepImp>;

    let alice: SandboxContract<TreasuryContract>;
    let bob: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        alice = await blockchain.treasury('ALICE');
        bob = await blockchain.treasury('BOB');
        const OwnableTransferable2Step = await OwnableTransferable2StepImp.fromInit();
        ownableTransferable2Step = blockchain.openContract<OwnableTransferable2StepImp>(OwnableTransferable2Step);
    });

    it('should ChangeOwner2Step correctly', async () => {
        const sendChangeOwner2StepResult = await ownableTransferable2Step.send(
            alice.getSender(),
            { value: toNano('0.05') },
            { $$type: 'ChangeOwner2Step', pendingOwner: bob.address, queryId: BigInt(2) },
        );

        expect(sendChangeOwner2StepResult.transactions).toHaveTransaction({
            from: alice.address,
            to: ownableTransferable2Step.address,
            success: true,
        });

        const currentOwner = await ownableTransferable2Step.getOwner();
        expect(currentOwner.toString()).toBe(alice.address.toString());

        const currentPendingOwner = await ownableTransferable2Step.getPendingOwner();
        expect(currentPendingOwner?.toString()).toBe(bob.address.toString());

        // TODO test reply messages
    });

    it('should AcceptOwnership2Step correctly', async () => {
        await ownableTransferable2Step.send(
            alice.getSender(),
            { value: toNano('0.05') },
            { $$type: 'ChangeOwner2Step', pendingOwner: bob.address, queryId: BigInt(2) },
        );

        const sendAcceptOwnership2StepResult = await ownableTransferable2Step.send(
            bob.getSender(),
            { value: toNano('0.05') },
            { $$type: 'AcceptOwnership2Step', queryId: BigInt(2) },
        );

        expect(sendAcceptOwnership2StepResult.transactions).toHaveTransaction({
            from: bob.address,
            to: ownableTransferable2Step.address,
            success: true,
        });

        const currentOwner = await ownableTransferable2Step.getOwner();
        expect(currentOwner.toString()).toBe(bob.address.toString());

        const currentPendingOwner = await ownableTransferable2Step.getPendingOwner();
        expect(currentPendingOwner).toBe(null);
    });

    // TODO test reply messages
}
