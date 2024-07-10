import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { beginCell, Cell, Dictionary, toNano } from '@ton/core';
import '@ton/test-utils';
import { buildOnchainMetadata } from './jettonHelper';
import { JettonBurn, JettonMasterImp, JettonTransfer } from '../../../build/Jetton/tact_JettonMasterImp';
import { JettonWalletImp } from '../../../build/Jetton/tact_JettonWalletImp';

export function shouldBehaveLikeBasicJetton(): void {
    let blockchain: Blockchain;
    let jettonMaster: SandboxContract<JettonMasterImp>;

    let owner: SandboxContract<TreasuryContract>;
    let bob: SandboxContract<TreasuryContract>;
    let sarah: SandboxContract<TreasuryContract>;

    const jettonParams = {
        name: 'Tonion',
        description: 'This is description of tonion Jetton Token in Tact-lang',
        symbol: 'TI',
        image: 'https://avatars.githubusercontent.com/u/173614477?s=96&v=4',
    };

    const jettonContent = buildOnchainMetadata(jettonParams);

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        owner = await blockchain.treasury('OWNER');
        bob = await blockchain.treasury('BOB');
        sarah = await blockchain.treasury('SARAH');

        const Jetton = await JettonMasterImp.fromInit(owner.address, jettonContent);
        jettonMaster = blockchain.openContract<JettonMasterImp>(Jetton);

        const deployResult = await jettonMaster.send(
            owner.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            },
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: owner.address,
            to: jettonMaster.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and nFTCollection are ready to use
    });

    it('should init correctly', async () => {
        const jettonData = await jettonMaster.getGetJettonData();
        const wallet = await JettonWalletImp.init(jettonMaster.address, bob.address);
        expect(jettonData.$$type).toBe('JettonData');
        expect(jettonData.mintable).toBe(true);
        expect(jettonData.total_supply).toBe(BigInt('0'));
        expect(jettonData.admin_address.toString()).toBe(owner.address.toString());
        expect(jettonData.jetton_wallet_code.toString()).toBe(wallet.code.toString());
    });

    it('should mint correctly', async () => {
        const mintMessage = await jettonMaster.send(
            owner.getSender(),
            { value: toNano('2') },
            {
                $$type: 'JettonMint',
                amount: toNano('1'),
                custom_payload: null,
                origin: owner.address,
                forward_ton_amount: toNano('0'),
                forward_payload: beginCell().endCell(),
                receiver: sarah.address,
            },
        );

        expect(mintMessage.transactions).toHaveTransaction({
            from: owner.address,
            to: jettonMaster.address,
            success: true,
        });

        const SarahWalletAddress = await jettonMaster.getGetWalletAddress(sarah.address);
        expect(mintMessage.transactions).toHaveTransaction({
            from: jettonMaster.address,
            to: SarahWalletAddress,
            success: true,
            deploy: true,
        });

        expect(mintMessage.transactions).toHaveTransaction({
            from: SarahWalletAddress,
            to: owner.address,
            success: true,
        });

        const aliceJettonContract = blockchain.openContract(await JettonWalletImp.fromAddress(SarahWalletAddress));
        const aliceBalanceAfter = (await aliceJettonContract.getGetWalletData()).balance;
        expect(aliceBalanceAfter).toEqual(0n + 1000000000n);
    });

    it('should close mint correctly', async () => {
        await jettonMaster.send(owner.getSender(), { value: toNano('0.015') }, 'Mint:Close');

        const jettonData = await jettonMaster.getGetJettonData();
        expect(jettonData.mintable).toBe(false);
    });

    it('should transfer correctly', async () => {
        // bob -> sarah

        await jettonMaster.send(
            owner.getSender(),
            { value: toNano('2') },
            {
                $$type: 'JettonMint',
                amount: toNano('100'),
                custom_payload: null,
                origin: owner.address,
                forward_ton_amount: toNano('0'),
                forward_payload: beginCell().endCell(),
                receiver: bob.address,
            },
        );

        let transferMessage: JettonTransfer = {
            $$type: 'JettonTransfer',
            query_id: 0n,
            amount: toNano('20'),
            destination: sarah.address,
            response_destination: sarah.address,
            custom_payload: null,
            forward_ton_amount: toNano('0'),
            forward_payload: beginCell().endCell(),
        };

        const bob_wallet = await jettonMaster.getGetWalletAddress(bob.address);
        const bobJettonWallet = blockchain.openContract(await JettonWalletImp.fromAddress(bob_wallet));
        await bobJettonWallet.send(bob.getSender(), { value: toNano('0.15') }, transferMessage);

        const sarah_wallet = await jettonMaster.getGetWalletAddress(sarah.address);
        const sarahJettonWallet = blockchain.openContract(await JettonWalletImp.fromAddress(sarah_wallet));

        let bobWalletData = await bobJettonWallet.getGetWalletData();

        expect(bobWalletData.balance.toString()).toBe(toNano('80').toString());
        expect(bobWalletData.owner.toString()).toBe(bob.address.toString());

        const sarahWalletData = await sarahJettonWallet.getGetWalletData();

        expect(sarahWalletData.balance.toString()).toBe(toNano('20').toString());
        expect(sarahWalletData.owner.toString()).toBe(sarah.address.toString());

        transferMessage = {
            $$type: 'JettonTransfer',
            query_id: 0n,
            amount: toNano('90'),
            destination: sarah.address,
            response_destination: sarah.address,
            custom_payload: null,
            forward_ton_amount: toNano('0.1'),
            forward_payload: beginCell().endCell(),
        };
        const messageResult = await bobJettonWallet.send(bob.getSender(), { value: toNano('0.15') }, transferMessage);
        expect(messageResult.transactions).toHaveTransaction({
            success: false,
            from: bob.address,
            to: bobJettonWallet.address,
        });

        bobWalletData = await bobJettonWallet.getGetWalletData();
        expect(bobWalletData.balance.toString()).toBe(toNano('80').toString());
    });

    it('should burn correctly', async () => {
        await jettonMaster.send(
            owner.getSender(),
            { value: toNano('2') },
            {
                $$type: 'JettonMint',
                amount: toNano('100'),
                custom_payload: null,
                origin: owner.address,
                forward_ton_amount: toNano('0'),
                forward_payload: beginCell().endCell(),
                receiver: bob.address,
            },
        );

        let burnMessage: JettonBurn = {
            $$type: 'JettonBurn',
            query_id: 0n,
            amount: toNano('20'),
            response_destination: bob.address,
            custom_payload: null,
        };

        const bob_wallet = await jettonMaster.getGetWalletAddress(bob.address);
        const bobJettonWallet = blockchain.openContract(await JettonWalletImp.fromAddress(bob_wallet));

        const aliceBalanceBefore = (await bobJettonWallet.getGetWalletData()).balance;

        const burnResult = await bobJettonWallet.send(bob.getSender(), { value: toNano('0.15') }, burnMessage);

        expect(burnResult.transactions).toHaveTransaction({
            from: bob.address,
            to: bobJettonWallet.address,
            success: true,
        });

        // Check that Alice's jetton wallet send JettonBurnNotification msg to JettonMaster
        expect(burnResult.transactions).toHaveTransaction({
            from: bobJettonWallet.address,
            to: jettonMaster.address,
            success: true,
        });

        // Check that JettonMaster send JettonExcesses msg to Alice
        expect(burnResult.transactions).toHaveTransaction({
            from: jettonMaster.address,
            to: bob.address,
            success: true,
        });

        // Check that Alice's jetton wallet balance is subtracted 1
        const aliceBalanceAfter = (await bobJettonWallet.getGetWalletData()).balance;
        expect(aliceBalanceAfter).toEqual(aliceBalanceBefore - toNano("20"));

    });
}
