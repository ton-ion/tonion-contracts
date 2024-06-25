import { toNano } from '@ton/core';
import { TestContract } from '../wrappers/TestContract';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const testContract = provider.open(await TestContract.fromInit(BigInt(Math.floor(Math.random() * 10000))));

    await testContract.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(testContract.address);

    console.log('ID', await testContract.getId());
}
