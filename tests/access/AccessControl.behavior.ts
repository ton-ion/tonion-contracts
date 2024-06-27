import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import '@ton/test-utils';
import { AccessControlImp } from '../../build/AccessControl/tact_AccessControlImp';
import * as crypto from 'crypto';

function sha256ToBigInt(input: string): bigint {
    const hash = crypto.createHash('sha256').update(input).digest('hex');
    const bigIntValue = BigInt(`0x${hash}`);

    return bigIntValue;
}

export function shouldBehaveLikeAccessControl(): void {
    let blockchain: Blockchain;
    let accessControl: SandboxContract<AccessControlImp>;

    let alice: SandboxContract<TreasuryContract>;
    let bob: SandboxContract<TreasuryContract>;
    let sarah: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        alice = await blockchain.treasury('ALICE');
        bob = await blockchain.treasury('BOB');
        sarah = await blockchain.treasury('SARAH');

        const AccessControl = await AccessControlImp.fromInit();
        accessControl = blockchain.openContract<AccessControlImp>(AccessControl);

        await accessControl.send(
            alice.getSender(),
            { value: toNano('1') },
            {
                $$type: 'GrantAdminRoleMessage',
                role: sha256ToBigInt('ADMIN_ROLE'),
                adminRole: sha256ToBigInt('ADMIN_ROLE'),
            },
        );
    });

    it('should init correctly', async () => {
        const grantAdminRoleResponse = await accessControl.send(
            alice.getSender(),
            { value: toNano('1') },
            {
                $$type: 'GrantAdminRoleMessage',
                role: sha256ToBigInt('ADMIN_ROLE'),
                adminRole: sha256ToBigInt('ADMIN_ROLE'),
            },
        );

        expect(grantAdminRoleResponse.transactions).toHaveTransaction({
            from: alice.address,
            to: accessControl.address,
            success: true,
        });

        const checkRole = await accessControl.getHasRole(sha256ToBigInt('ADMIN_ROLE'), alice.address);
        expect(checkRole).toBe(true);
    });

    it('should grantRole correctly', async () => {
        await accessControl.send(
            alice.getSender(),
            { value: toNano('1') },
            { $$type: 'GrantRoleMessage', role: sha256ToBigInt('INCREMENT_ROLE'), account: bob.address },
        );

        let checkRole = await accessControl.getHasRole(sha256ToBigInt('INCREMENT_ROLE'), bob.address);
        expect(checkRole).toBe(true);

        await accessControl.send(
            alice.getSender(),
            { value: toNano('1') },
            { $$type: 'GrantRoleMessage', role: sha256ToBigInt('INCREMENT_ROLE'), account: alice.address },
        );

        checkRole = await accessControl.getHasRole(sha256ToBigInt('INCREMENT_ROLE'), alice.address);
        expect(checkRole).toBe(true);

        const invalidGrantRoleMessage = await accessControl.send(
            bob.getSender(),
            { value: toNano('1') },
            { $$type: 'GrantRoleMessage', role: sha256ToBigInt('INCREMENT_ROLE'), account: sarah.address },
        );

        expect(invalidGrantRoleMessage.transactions).toHaveTransaction({
            exitCode: 132,
        });

        checkRole = await accessControl.getHasRole(sha256ToBigInt('INCREMENT_ROLE'), sarah.address);
        expect(checkRole).toBe(false);

        const grantInvalidRoleMessage = await accessControl.send(
            alice.getSender(),
            { value: toNano('1') },
            { $$type: 'GrantRoleMessage', role: sha256ToBigInt('INVALID_ROLE'), account: bob.address },
        );

        expect(grantInvalidRoleMessage.transactions).toHaveTransaction({
            exitCode: 666,
        });

        let aa = await accessControl.getHasRole(sha256ToBigInt('INVALID_ROLE'), bob.address);
        expect(aa).toBe(false);
    });

    it('should revokeRole correctly', async () => {
        await accessControl.send(
            alice.getSender(),
            { value: toNano('1') },
            { $$type: 'GrantRoleMessage', role: sha256ToBigInt('INCREMENT_ROLE'), account: bob.address },
        );

        await accessControl.send(
            alice.getSender(),
            { value: toNano('1') },
            { $$type: 'GrantRoleMessage', role: sha256ToBigInt('DECREMENT_ROLE'), account: bob.address },
        );

        await accessControl.send(
            alice.getSender(),
            { value: toNano('1') },
            { $$type: 'RevokeRoleMessage', role: sha256ToBigInt('INCREMENT_ROLE'), account: bob.address },
        );

        let checkRole = await accessControl.getHasRole(sha256ToBigInt('INCREMENT_ROLE'), bob.address);
        expect(checkRole).toBe(false);

        checkRole = await accessControl.getHasRole(sha256ToBigInt('DECREMENT_ROLE'), bob.address);
        expect(checkRole).toBe(true);

        await accessControl.send(
            alice.getSender(),
            { value: toNano('1') },
            { $$type: 'RevokeRoleMessage', role: sha256ToBigInt('INCREMENT_ROLE'), account: sarah.address },
        );

        checkRole = await accessControl.getHasRole(sha256ToBigInt('INCREMENT_ROLE'), sarah.address);
        expect(checkRole).toBe(false);
    });

    it('should only roleAdmin be able to grant/revoke role', async () => {
        await accessControl.send(
            alice.getSender(),
            { value: toNano('1') },
            {
                $$type: 'GrantAdminRoleMessage',
                role: sha256ToBigInt('INCREMENT_ROLE'),
                adminRole: sha256ToBigInt('DECREMENT_ROLE'),
            },
        );

        await accessControl.send(
            alice.getSender(),
            { value: toNano('1') },
            { $$type: 'GrantRoleMessage', role: sha256ToBigInt('INCREMENT_ROLE'), account: bob.address },
        );

        let checkRole = await accessControl.getHasRole(sha256ToBigInt('INCREMENT_ROLE'), bob.address);
        expect(checkRole).toBe(false);

        await accessControl.send(
            alice.getSender(),
            { value: toNano('1') },
            { $$type: 'GrantRoleMessage', role: sha256ToBigInt('DECREMENT_ROLE'), account: alice.address },
        );

        await accessControl.send(
            alice.getSender(),
            { value: toNano('1') },
            { $$type: 'GrantRoleMessage', role: sha256ToBigInt('INCREMENT_ROLE'), account: bob.address },
        );

        checkRole = await accessControl.getHasRole(sha256ToBigInt('INCREMENT_ROLE'), bob.address);
        expect(checkRole).toBe(true);

        //revoke

        await accessControl.send(
            alice.getSender(),
            { value: toNano('1') },
            { $$type: 'RevokeRoleMessage', role: sha256ToBigInt('DECREMENT_ROLE'), account: alice.address },
        );

        await accessControl.send(
            alice.getSender(),
            { value: toNano('1') },
            { $$type: 'RevokeRoleMessage', role: sha256ToBigInt('INCREMENT_ROLE'), account: bob.address },
        );

        checkRole = await accessControl.getHasRole(sha256ToBigInt('INCREMENT_ROLE'), bob.address);
        expect(checkRole).toBe(true);
    });

    it('should renounceRole correctly', async () => {
        await accessControl.send(
            alice.getSender(),
            { value: toNano('1') },
            { $$type: 'GrantRoleMessage', role: sha256ToBigInt('INCREMENT_ROLE'), account: bob.address },
        );

        let checkRole = await accessControl.getHasRole(sha256ToBigInt('INCREMENT_ROLE'), bob.address);
        expect(checkRole).toBe(true);

        const invalidRenounceMessage = await accessControl.send(
            alice.getSender(),
            { value: toNano('1') },
            { $$type: 'RenounceRoleMessage', role: sha256ToBigInt('INCREMENT_ROLE'), account: bob.address },
        );

        expect(invalidRenounceMessage.transactions).toHaveTransaction({
            exitCode: 777,
        });

        checkRole = await accessControl.getHasRole(sha256ToBigInt('INCREMENT_ROLE'), bob.address);
        expect(checkRole).toBe(true);

        await accessControl.send(
            bob.getSender(),
            { value: toNano('1') },
            { $$type: 'RenounceRoleMessage', role: sha256ToBigInt('INCREMENT_ROLE'), account: bob.address },
        );

        checkRole = await accessControl.getHasRole(sha256ToBigInt('INCREMENT_ROLE'), bob.address);
        expect(checkRole).toBe(false);
    });
}
