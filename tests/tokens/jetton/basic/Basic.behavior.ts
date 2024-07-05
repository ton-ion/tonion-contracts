import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { beginCell, Cell, Dictionary, toNano } from '@ton/core';
import '@ton/test-utils';
import { SampleJettonImp } from '../../../../build/BasicJetton/tact_SampleJettonImp';
import { buildOnchainMetadata } from '../jettonHelper';
import { JettonSampleWalletImp, TokenTransfer } from '../../../../build/BasicJetton/tact_JettonSampleWalletImp';

export function shouldBehaveLikeBasicJetton(): void {
    let blockchain: Blockchain;
    let jetton: SandboxContract<SampleJettonImp>;
    let bob_wallet: SandboxContract<JettonSampleWalletImp>;
    let sarah_wallet: SandboxContract<JettonSampleWalletImp>;
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
        const Bob_wallet = await JettonSampleWalletImp.fromInit(jetton.address, bob.address);
        bob_wallet = blockchain.openContract<JettonSampleWalletImp>(Bob_wallet);
        const Sarah_wallet = await JettonSampleWalletImp.fromInit(jetton.address,sarah.address);
        sarah_wallet = blockchain.openContract<JettonSampleWalletImp>(Sarah_wallet);

        await jetton.send(
            alice.getSender(),
            { value: toNano('1') },
            { $$type: 'Mint', amount: BigInt('10000000'), receiver: bob.address },
        );
    });

    it('should init correctly', async () => {
        const owner = await jetton.getOwner();
        expect(owner.toString()).toBe(alice.address.toString());

        const jettonData = await jetton.getGetJettonData();
        const wallet = await JettonSampleWalletImp.init(jetton.address, bob.address);
        expect(jettonData.$$type).toBe('JettonData');
        expect(jettonData.mintable).toBe(true);
        expect(jettonData.totalSupply).toBe(BigInt('10000000'));
        expect(jettonData.owner.toString()).toBe(alice.address.toString());
        expect(jettonData.walletCode.toString()).toBe(wallet.code.toString());
    });

    it('should mint correctly', async () => {
        const walletData = await bob_wallet.getGetWalletData();

        expect(walletData.$$type).toBe('JettonWalletData');
        expect(walletData.balance.toString()).toBe(BigInt('10000000').toString());
        expect(walletData.master.toString()).toBe(jetton.address.toString());
        expect(walletData.owner.toString()).toBe(bob.address.toString());
    });

    it('should close mint correctly', async () => {
        await jetton.send(alice.getSender(), { value: toNano('0.015') }, 'Owner: MintClose');

        const jettonData = await jetton.getGetJettonData();
        expect(jettonData.mintable).toBe(false);
    });

    it('should return wallet address correctly', async () => {
        const walletAddress = await jetton.getGetWalletAddress(bob.address);
        expect(walletAddress.toString()).toBe(bob_wallet.address.toString());
    });

    it("should transfer correctly", async()=>{
        // bob -> sarah

        let transferMessage: TokenTransfer = {
            $$type: "TokenTransfer",
            queryId: 0n,
            amount: BigInt("50000"),
            destination: sarah.address,
            response_destination: sarah.address,
            custom_payload: null,
            forward_ton_amount: toNano("0.1"),
            forward_payload: beginCell().endCell(),
        };
        await bob_wallet.send(bob.getSender(),{value:toNano("0.15")},transferMessage)

        let bobWalletData = await bob_wallet.getGetWalletData();

        expect(bobWalletData.balance.toString()).toBe(BigInt('9950000').toString());
        expect(bobWalletData.owner.toString()).toBe(bob.address.toString());

        const sarahWalletData = await sarah_wallet.getGetWalletData();

        expect(sarahWalletData.balance.toString()).toBe(BigInt('50000').toString());
        expect(sarahWalletData.owner.toString()).toBe(sarah.address.toString());

        transferMessage = {
            $$type: "TokenTransfer",
            queryId: 0n,
            amount: BigInt("995000000"),
            destination: sarah.address,
            response_destination: sarah.address,
            custom_payload: null,
            forward_ton_amount: toNano("0.1"),
            forward_payload: beginCell().endCell(),
        };
        const messageResult = await bob_wallet.send(bob.getSender(),{value:toNano("0.15")},transferMessage)
        expect(messageResult.transactions).toHaveTransaction({
            success:false,
            from:bob.address,
            to:bob_wallet.address
        })

        bobWalletData = await bob_wallet.getGetWalletData();
        expect(bobWalletData.balance.toString()).toBe(BigInt('9950000').toString());

    })
}
