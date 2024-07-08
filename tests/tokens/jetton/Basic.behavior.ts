import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { beginCell, Cell, Dictionary, toNano } from '@ton/core';
import '@ton/test-utils';
import { buildOnchainMetadata } from './jettonHelper';
import { JettonMasterImp, JettonTransfer } from '../../../build/BasicJetton/tact_JettonMasterImp';
import { JettonWalletImp } from '../../../build/BasicJetton/tact_JettonWalletImp';

export function shouldBehaveLikeBasicJetton(): void {
    let blockchain: Blockchain;
    let jettonMaster: SandboxContract<JettonMasterImp>;
    let bob_wallet: SandboxContract<JettonWalletImp>;
    let sarah_wallet: SandboxContract<JettonWalletImp>;
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
        const Jetton = await JettonMasterImp.fromInit(alice.address, jettonContent);
        jettonMaster = blockchain.openContract<JettonMasterImp>(Jetton);
        const Bob_wallet = await JettonWalletImp.fromInit(jettonMaster.address, bob.address);
        bob_wallet = blockchain.openContract<JettonWalletImp>(Bob_wallet);
        const Sarah_wallet = await JettonWalletImp.fromInit(jettonMaster.address, sarah.address);
        sarah_wallet = blockchain.openContract<JettonWalletImp>(Sarah_wallet);

        await jettonMaster.send(
            alice.getSender(),
            { value: toNano('1') },
            {
                $$type: 'JettonMint',
                amount: BigInt('10000000'),
                custom_payload: null,
                origin: alice.address,
                forward_ton_amount: 0n,
                forward_payload: beginCell().endCell(),
                receiver: bob.address,
            },
        );
    });

    it('should init correctly', async () => {
        const jettonData = await jettonMaster.getGetJettonData();
        const wallet = await JettonWalletImp.init(jettonMaster.address, bob.address);
        expect(jettonData.$$type).toBe('JettonData');
        expect(jettonData.mintable).toBe(true);
        expect(jettonData.total_supply).toBe(BigInt('10000000'));
        expect(jettonData.admin_address.toString()).toBe(alice.address.toString());
        expect(jettonData.jetton_wallet_code.toString()).toBe(wallet.code.toString());
    });

    it('should mint correctly', async () => {
        const walletData = await bob_wallet.getGetWalletData();

        expect(walletData.$$type).toBe('JettonWalletData');
        expect(walletData.balance.toString()).toBe(BigInt('10000000').toString());
        expect(walletData.jetton.toString()).toBe(jettonMaster.address.toString());
        expect(walletData.owner.toString()).toBe(bob.address.toString());
    });

    it('should close mint correctly', async () => {
        await jettonMaster.send(alice.getSender(), { value: toNano('0.015') }, 'Mint:Close');

        const jettonData = await jettonMaster.getGetJettonData();
        expect(jettonData.mintable).toBe(false);
    });

    it('should return wallet address correctly', async () => {
        const walletAddress = await jettonMaster.getGetWalletAddress(bob.address);
        expect(walletAddress.toString()).toBe(bob_wallet.address.toString());
    });

    it('should transfer correctly', async () => {
        // bob -> sarah

        let transferMessage: JettonTransfer = {
            $$type: 'JettonTransfer',
            query_id: 0n,
            amount: BigInt('50000'),
            destination: sarah.address,
            response_destination: sarah.address,
            custom_payload: null,
            forward_ton_amount: toNano('0.1'),
            forward_payload: beginCell().endCell(),
        };
        await bob_wallet.send(bob.getSender(), { value: toNano('0.15') }, transferMessage);

        let bobWalletData = await bob_wallet.getGetWalletData();

        expect(bobWalletData.balance.toString()).toBe(BigInt('9950000').toString());
        expect(bobWalletData.owner.toString()).toBe(bob.address.toString());

        const sarahWalletData = await sarah_wallet.getGetWalletData();

        expect(sarahWalletData.balance.toString()).toBe(BigInt('50000').toString());
        expect(sarahWalletData.owner.toString()).toBe(sarah.address.toString());

        transferMessage = {
            $$type: 'JettonTransfer',
            query_id: 0n,
            amount: BigInt('995000000'),
            destination: sarah.address,
            response_destination: sarah.address,
            custom_payload: null,
            forward_ton_amount: toNano('0.1'),
            forward_payload: beginCell().endCell(),
        };
        const messageResult = await bob_wallet.send(bob.getSender(), { value: toNano('0.15') }, transferMessage);
        expect(messageResult.transactions).toHaveTransaction({
            success: false,
            from: bob.address,
            to: bob_wallet.address,
        });

        bobWalletData = await bob_wallet.getGetWalletData();
        expect(bobWalletData.balance.toString()).toBe(BigInt('9950000').toString());
    });
}
