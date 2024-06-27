import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/mocks/access/accessControl.tact',
    options: {
        debug: true,
    },
};
