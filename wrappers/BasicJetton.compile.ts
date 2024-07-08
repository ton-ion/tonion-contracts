import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/mocks/tokens/jetton/Jetton.tact',
    options: {
        debug: true,
    },
};
