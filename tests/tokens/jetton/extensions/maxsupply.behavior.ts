import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { beginCell, Cell, Dictionary, toNano } from '@ton/core';
import '@ton/test-utils';
import { MaxSupplyImp } from '../../../../build/MaxSupply/tact_MaxSupplyImp';
import { buildOnchainMetadata } from '../jettonHelper';

export function shouldBehaveLikeMaxSupply(): void {
    let blockchain: Blockchain;
    let maxSupply: SandboxContract<MaxSupplyImp>;

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

        const Jetton = await MaxSupplyImp.fromInit(owner.address, jettonContent);
        maxSupply = blockchain.openContract<MaxSupplyImp>(Jetton);

        const deployResult = await maxSupply.send(
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
            to: maxSupply.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
    });

    it('should init correctly', async () => {
        const ms = await maxSupply.getMaxSupply();
        expect(ms).toBe(toNano('1000'));
    });

    it('should reach max supply correctly', async () => {
        await maxSupply.send(
            owner.getSender(),
            { value: toNano('2') },
            {
                $$type: 'JettonMint',
                amount: toNano('800'),
                custom_payload: null,
                origin: owner.address,
                forward_ton_amount: toNano('0'),
                forward_payload: beginCell().endCell(),
                receiver: sarah.address,
            },
        );

        let maxSupplyStatus = await maxSupply.getIsMaxSupplyReached();
        expect(maxSupplyStatus).toBe(false);

        await maxSupply.send(
            owner.getSender(),
            { value: toNano('2') },
            {
                $$type: 'JettonMint',
                amount: toNano('200'),
                custom_payload: null,
                origin: owner.address,
                forward_ton_amount: toNano('0'),
                forward_payload: beginCell().endCell(),
                receiver: sarah.address,
            },
        );
        maxSupplyStatus = await maxSupply.getIsMaxSupplyReached();
        expect(maxSupplyStatus).toBe(true);
    });

    it('should check max supply correctly', async () => {
        await maxSupply.send(
            owner.getSender(),
            { value: toNano('2') },
            {
                $$type: 'JettonMint',
                amount: toNano('800'),
                custom_payload: null,
                origin: owner.address,
                forward_ton_amount: toNano('0'),
                forward_payload: beginCell().endCell(),
                receiver: sarah.address,
            },
        );

        let maxSupplyStatus = await maxSupply.getIsMaxSupplyReached();
        expect(maxSupplyStatus).toBe(false);

        const checkMessage = await maxSupply.send(
            owner.getSender(),
            { value: toNano('2') },
            {
                $$type: 'JettonMint',
                amount: toNano('300'),
                custom_payload: null,
                origin: owner.address,
                forward_ton_amount: toNano('0'),
                forward_payload: beginCell().endCell(),
                receiver: sarah.address,
            },
        );

        expect(checkMessage.transactions).toHaveTransaction({
            from: owner.address,
            to: maxSupply.address,
            success: false,
            exitCode: 7878,
        });

        maxSupplyStatus = await maxSupply.getIsMaxSupplyReached();
        expect(maxSupplyStatus).toBe(false);
    });
}
