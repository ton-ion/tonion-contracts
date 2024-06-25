import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { CounterImp } from '../../build/Counter/tact_CounterImp';
import { toNano } from '@ton/core';
import '@ton/test-utils';

export function shouldBehaveLikeCounter():void {
        let blockchain: Blockchain;
        let counter: SandboxContract<CounterImp>;
        let alice: SandboxContract<TreasuryContract>;

        beforeEach(async () => {
            blockchain = await Blockchain.create();
            alice = await blockchain.treasury('ALICE');
            const Counter = await CounterImp.fromInit();
            counter = blockchain.openContract<CounterImp>(Counter);
        });

        it('should increment correctly', async () => {
            const sendIncrementResult = await counter.send(alice.getSender(), { value: toNano('0.05') }, 'increment');

            expect(sendIncrementResult.transactions).toHaveTransaction({
                from: alice.address,
                to: counter.address,
                success: true,
            });

            const current = await counter.getCurrent();
            expect(current.toString()).toBe('1');
        });

        it('should decrement correctly', async () => {
            const sendDecrementResult = await counter.send(alice.getSender(), { value: toNano('0.05') }, 'decrement');

            expect(sendDecrementResult.transactions).toHaveTransaction({
                from: alice.address,
                to: counter.address,
                success: true,
            });

            const current = await counter.getCurrent();
            expect(current.toString()).toBe('-1');
        });

        it('should get current correctly', async () => {
            for (let i = 0; i < 4; i++) {
                await counter.send(alice.getSender(), { value: toNano('0.05') }, 'increment')
            }

            let current = await counter.getCurrent();
            expect(current.toString()).toBe('4');

            await counter.send(alice.getSender(), { value: toNano('0.05') }, 'decrement')

            current = await counter.getCurrent();
            expect(current.toString()).toBe('3');

        });
}
