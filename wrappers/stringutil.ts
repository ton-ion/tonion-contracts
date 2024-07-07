import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts\traits\string.tact', 
    options: {
        debug: true,
    },
};
