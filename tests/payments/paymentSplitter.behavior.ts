import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import '@ton/test-utils';
import { PaymentSplitterImp } from '../../build/PaymentSplitter/tact_PaymentSplitterImp';

export function shouldBehaveLikePaymentSplitter(): void {
    let blockchain: Blockchain;
    let paymentSplitter: SandboxContract<PaymentSplitterImp>;
    let alice: SandboxContract<TreasuryContract>;
    let bob: SandboxContract<TreasuryContract>;
    let sarah: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        alice = await blockchain.treasury('ALICE');
        bob = await blockchain.treasury('bob');
        sarah = await blockchain.treasury('SARAH');
        const PaymentSplitter = await PaymentSplitterImp.fromInit(alice.address);
        paymentSplitter = blockchain.openContract<PaymentSplitterImp>(PaymentSplitter);
    });

    it('should add payee correctly', async () => {
        const addPayeeMessage = await paymentSplitter.send(
            alice.getSender(),
            { value: toNano('0.1') },
            { $$type: 'AddPayee', payee: bob.address, shares: BigInt('7') },
        );

        expect(addPayeeMessage.transactions).toHaveTransaction({
            from: alice.address,
            to: paymentSplitter.address,
            success: true,
        });
    });

    it('should shares be correct', async () => {
        await paymentSplitter.send(
            alice.getSender(),
            { value: toNano('0.1') },
            { $$type: 'AddPayee', payee: bob.address, shares: BigInt('7') },
        );

        await paymentSplitter.send(
            alice.getSender(),
            { value: toNano('0.1') },
            { $$type: 'AddPayee', payee: sarah.address, shares: BigInt('3') },
        );

        const totalShares = await paymentSplitter.getTotalShares();
        expect(totalShares.toString()).toBe('10');

        const bobShares = await paymentSplitter.getShares(bob.address);
        expect(bobShares?.toString()).toBe('7');

        const sarahShares = await paymentSplitter.getShares(sarah.address);
        expect(sarahShares?.toString()).toBe('3');
    });

    it('should release be correct', async () => {
        await paymentSplitter.send(
            alice.getSender(),
            { value: toNano('0.01') },
            { $$type: 'AddPayee', payee: bob.address, shares: BigInt('7') },
        );

        await paymentSplitter.send(
            alice.getSender(),
            { value: toNano('0.01') },
            { $$type: 'AddPayee', payee: sarah.address, shares: BigInt('3') },
        );

        let totalRelease = await paymentSplitter.getTotalReleased();
        expect(totalRelease.toString()).toBe('0');

        await paymentSplitter.send(alice.getSender(), { value: toNano('10') }, null);

        let releaseMessage = await paymentSplitter.send(bob.getSender(),{value:toNano("0.01")},'release')
        expect(releaseMessage.transactions).toHaveTransaction({
            success:true,
            from:bob.address,
            to:paymentSplitter.address
        })

        totalRelease = await paymentSplitter.getTotalReleased();
        expect(totalRelease.toString()).toBe('7005823720'); // ~

        let bobRelease = await paymentSplitter.getReleased(bob.address)
        expect(bobRelease?.toString()).toBe('7005823720'); // ~

        let sarahRelease = await paymentSplitter.getReleased(sarah.address)
        expect(sarahRelease?.toString()).toBeFalsy()

        releaseMessage = await paymentSplitter.send(sarah.getSender(),{value:toNano("0.01")},'release')
        expect(releaseMessage.transactions).toHaveTransaction({
            success:true,
            from:sarah.address,
            to:paymentSplitter.address
        })

        totalRelease = await paymentSplitter.getTotalReleased();
        expect(totalRelease.toString()).toBe('10008319600'); // ~

        bobRelease = await paymentSplitter.getReleased(bob.address)
        expect(bobRelease?.toString()).toBe('7005823720'); // ~

        sarahRelease = await paymentSplitter.getReleased(sarah.address)
        expect(sarahRelease?.toString()).toBe('3002495880') // ~
    });
}
