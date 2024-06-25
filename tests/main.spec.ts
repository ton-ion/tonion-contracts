import { shouldBehaveLikeOwnableTransferable2Step } from './access/Counter.behavior';
import { shouldBehaveLikeCounter } from './utils/Counter.behavior';

describe('OpenGem-contract UnitTests', function () {
    describe('Utils', function () {
        shouldBehaveLikeCounter();
    });

    describe('Access', function () {
        shouldBehaveLikeOwnableTransferable2Step();
    });
});
