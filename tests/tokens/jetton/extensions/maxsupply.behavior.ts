import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { beginCell, Cell, Dictionary, toNano } from '@ton/core';
import '@ton/test-utils';
import { buildOnchainMetadata } from '../jettonHelper';
import { JettonSampleWalletImp, TokenTransfer } from '../../../../build/BasicJetton/tact_JettonSampleWalletImp';
import { MaxSupplyJettonImp } from '../../../../build/MaxSupplyJetton/tact_MaxSupplyJettonImp';

export function shouldBehaveLikeBasicJetton(): void {
    let blockchain: Blockchain;
    let jetton: SandboxContract<MaxSupplyJettonImp>;
    let alice: SandboxContract<TreasuryContract>;
    let bob: SandboxContract<TreasuryContract>;

    const jettonParams = {
        name: 'open gem max supply',
        description: 'This is description of open gem Jetton Token in Tact-lang',
        symbol: 'OG',
        image: 'https://avatars.githubusercontent.com/u/173614477?s=96&v=4',
    };

    const jettonContent = buildOnchainMetadata(jettonParams);

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        alice = await blockchain.treasury('ALICE');
        bob = await blockchain.treasury('BOB');
        const Jetton = await MaxSupplyJettonImp.fromInit(alice.address, jettonContent, BigInt('1000000000'));
        jetton = blockchain.openContract<MaxSupplyJettonImp>(Jetton);

        await jetton.send(
            alice.getSender(),
            { value: toNano('1') },
            { $$type: 'Mint', amount: BigInt('1000000000'), receiver: bob.address },
        );
    });

    it('should init correctly', async () => {
        const owner = await jetton.getOwner();
        expect(owner.toString()).toBe(alice.address.toString());

        const jettonData = await jetton.getGetJettonData();
        const wallet = await JettonSampleWalletImp.init(jetton.address, bob.address);
        expect(jettonData.$$type).toBe('JettonData');
        expect(jettonData.mintable).toBe(true);
        expect(jettonData.totalSupply).toBe(BigInt('1000000000'));
        expect(jettonData.owner.toString()).toBe(alice.address.toString());
        expect(jettonData.walletCode.toString()).toBe(wallet.code.toString());
    });

    it('should revert for mint more jetton correctly', async () => {
        const mintMessage = await jetton.send(
            alice.getSender(),
            { value: toNano('1') },
            { $$type: 'Mint', amount: BigInt('1'), receiver: bob.address },
        );

        expect(mintMessage.transactions).toHaveTransaction({
            success: false,
            from: alice.address,
            to: jetton.address,
            exitCode: 7878,
        });
    });

    it('should check maxSupply correctly', async () => {
        // TODO
    });

    it('should return is reached maxSupply correctly', async () => {
        const isReachedMaxSupply = await jetton.getIsMaxSupplyReached();
        expect(isReachedMaxSupply).toBe(true);
    });
}
