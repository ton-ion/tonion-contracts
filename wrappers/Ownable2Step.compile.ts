import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/mocks/access/ownable2StepImp.tact',
    options: {
        debug: true,
    },
};