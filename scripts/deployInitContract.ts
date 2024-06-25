import { toNano } from '@ton/core';
import { InitContract } from '../wrappers/utils/InitContract';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const initContract = provider.open(await InitContract.fromInit());

    await initContract.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(initContract.address);

    // run methods on `initContract`
}
