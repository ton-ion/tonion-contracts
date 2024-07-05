import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { beginCell, Cell, Dictionary, toNano } from '@ton/core';
import '@ton/test-utils';
import { SampleJettonImp } from '../../../../build/BasicJetton/tact_SampleJettonImp';
import { buildOnchainMetadata } from '../jettonHelper';
import { JettonApproveableWalletImp, TokenSpend } from '../../../../build/approveableJetton/tact_JettonApproveableWalletImp';

export function shouldBehaveLikeApproveableJetton(): void {
    let blockchain: Blockchain;
    let jetton: SandboxContract<SampleJettonImp>;
    let bob_wallet: SandboxContract<JettonApproveableWalletImp>;
    let sarah_wallet: SandboxContract<JettonApproveableWalletImp>;
    let alice: SandboxContract<TreasuryContract>;
    let bob: SandboxContract<TreasuryContract>;
    let sarah: SandboxContract<TreasuryContract>;

    const jettonParams = {
        name: 'open gem',
        description: 'This is description of open gem Jetton Token in Tact-lang',
        symbol: 'OG',
        image: 'https://avatars.githubusercontent.com/u/173614477?s=96&v=4',
    };

    const jettonContent = buildOnchainMetadata(jettonParams);

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        alice = await blockchain.treasury('ALICE');
        bob = await blockchain.treasury('BOB');
        sarah = await blockchain.treasury('SARAH');
        const Jetton = await SampleJettonImp.fromInit(alice.address, jettonContent);
        jetton = blockchain.openContract<SampleJettonImp>(Jetton);
        const Bob_wallet = await JettonApproveableWalletImp.fromInit(jetton.address, bob.address);
        bob_wallet = blockchain.openContract<JettonApproveableWalletImp>(Bob_wallet);
        const Sarah_wallet = await JettonApproveableWalletImp.fromInit(jetton.address, sarah.address);
        sarah_wallet = blockchain.openContract<JettonApproveableWalletImp>(Sarah_wallet);

        await jetton.send(
            alice.getSender(),
            { value: toNano('1') },
            { $$type: 'Mint', amount: BigInt('10000000'), receiver: bob.address },
        );
    });

    it('should approve correctly', async () => {
        await bob_wallet.send(
            bob.getSender(),
            { value: toNano('0.15') },
            { $$type: 'TokenApprove', amount: BigInt('55555'), spender: sarah.address },
        );

        let allowance = await bob_wallet.getAllowance(sarah.address)
        expect(allowance.toString()).toBe("55555")

        await bob_wallet.send(
            bob.getSender(),
            { value: toNano('0.15') },
            { $$type: 'TokenApprove', amount: BigInt('777777'), spender: sarah.address },
        );

        allowance = await bob_wallet.getAllowance(sarah.address)
        expect(allowance.toString()).toBe("777777")
    });

    it("should spend correctly", async()=>{

        await bob_wallet.send(
            bob.getSender(),
            { value: toNano('0.15') },
            { $$type: 'TokenApprove', amount: BigInt('9999'), spender: bob.address },
        );


        // let spendMessage: TokenSpend = {
        //     $$type: "TokenSpend",
        //     queryId: 0n,
        //     amount: BigInt("500"),
        //     destination: sarah.address,
        //     response_destination: sarah.address,
        //     custom_payload: null,
        //     forward_ton_amount: toNano("0.1"),
        //     forward_payload: beginCell().endCell(),
        // };

        // await bob_wallet.send(
        //     bob.getSender(),
        //     { value: toNano('10') },
        //     spendMessage
        // );

        // expect(a.transactions).toHaveTransaction({success:true,from:sarah.address,to:bob_wallet.address})

        // let currentAllowance = await bob_wallet.getAllowance(sarah.address)
        // expect(currentAllowance.toString()).toBe("0")
    })
}
