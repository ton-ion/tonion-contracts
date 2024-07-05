import { shouldBehaveLikeAccessControl } from './access/AccessControl.behavior';
import { shouldBehaveLikeOwnableTransferable2Step } from './access/OwnableTransferable2Step';
import { shouldBehaveLikeBasicJetton } from './tokens/jetton/basic/Basic.behavior';
import { shouldBehaveLikeApproveableJetton } from './tokens/jetton/extensions/approveable.behavior';
import { shouldBehaveLikeMaxSupplyJetton } from './tokens/jetton/extensions/maxsupply.behavior';
import { shouldBehaveLikeCounter } from './utils/Counter.behavior';

describe('OpenGem-contract UnitTests', function () {
    describe('Utils', function () {
        describe('Counter', function () {
            shouldBehaveLikeCounter();
        });
    });

    describe('Access', function () {
        describe('Ownable Transferable 2 Step', function () {
            shouldBehaveLikeOwnableTransferable2Step();
        });
        describe('Access Control', function () {
            shouldBehaveLikeAccessControl();
        });
    });

    describe('Tokens', function () {
        describe('Jetton', function () {
            describe('Basic', function () {
                shouldBehaveLikeBasicJetton();
            });
            describe('extensions', function () {
                describe('maxSupply', function () {
                    shouldBehaveLikeMaxSupplyJetton();
                });
                describe('approveable', function () {
                    // shouldBehaveLikeApproveableJetton();
                });
            });
        });
    });
});
