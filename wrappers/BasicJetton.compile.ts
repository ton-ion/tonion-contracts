import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/mocks/tokens/jetton/basic.tact',
    options: {
        debug: true,
    },
};
