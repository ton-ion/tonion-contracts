import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, Dictionary, toNano } from '@ton/core';
import '@ton/test-utils';
import { SampleJettonImp } from '../../../../build/BasicJetton/tact_SampleJettonImp';
import { buildOnchainMetadata } from '../jettonHelper';
import { JettonSampleWalletImp } from '../../../../build/BasicJetton/tact_JettonSampleWalletImp';

export function shouldBehaveLikeBasicJetton(): void {
    let blockchain: Blockchain;
    let jetton: SandboxContract<SampleJettonImp>;
    let wallet: SandboxContract<JettonSampleWalletImp>;
    let alice: SandboxContract<TreasuryContract>;
    let bob: SandboxContract<TreasuryContract>;

    const jettonParams = {
        name: "open gem",
        description: "This is description of open gem Jetton Token in Tact-lang",
        symbol: "OG",
        image: "https://avatars.githubusercontent.com/u/173614477?s=96&v=4",
    };

    const jettonContent = buildOnchainMetadata(jettonParams)

    
    beforeEach(async () => {
        blockchain = await Blockchain.create();
        alice = await blockchain.treasury('ALICE');
        bob = await blockchain.treasury('BOB');
        const Jetton = await SampleJettonImp.fromInit(alice.address,jettonContent);
        jetton = blockchain.openContract<SampleJettonImp>(Jetton);

        await jetton.send(
            alice.getSender(),
            { value: toNano('1') },
            { $$type: 'Mint', amount: BigInt('1'), receiver: bob.address },
        );
    });

    it('should init correctly', async () => {
        const owner = await jetton.getOwner()
        expect(owner.toString()).toBe(alice.address.toString());

        const jettonData = await jetton.getGetJettonData()
        const wallet = await JettonSampleWalletImp.init(jetton.address,bob.address)
        expect(jettonData.$$type).toBe("JettonData")
        expect(jettonData.mintable).toBe(true)
        expect(jettonData.totalSupply).toBe(BigInt("1"))
        expect(jettonData.owner.toString()).toBe(alice.address.toString())
        expect(jettonData.walletCode.toString()).toBe(wallet.code.toString())

    });
}