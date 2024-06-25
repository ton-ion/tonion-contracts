import { shouldBehaveLikeOwnableTransferable2Step } from './access/Counter.behavior';
import { shouldBehaveLikeCounter } from './utils/Counter.behavior';

describe('UnitTests', function () {
    describe('Utils', function () {
        shouldBehaveLikeCounter();
    });

    describe('Access', function () {
        shouldBehaveLikeOwnableTransferable2Step();
    });
});
