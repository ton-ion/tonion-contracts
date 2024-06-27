import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/mocks/utils/counterImp.tact',
    options: {
        debug: true,
    },
};
