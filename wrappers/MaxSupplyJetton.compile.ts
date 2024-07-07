import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/mocks/tokens/jetton/maxSupply.tact',
    options: {
        debug: true,
    },
};
