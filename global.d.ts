// definition types for express-subdomain
// by mademanix (https://github.com/mademanix/)
// todo: code improvement

type SubdomainCallback = (
    callback: (err: Error | null, allow?: boolean) => void
) => void;

type SubdomainPromise = (
    callback: (req: any, res: any, next: any) => void
) => void;


declare module 'express-subdomain' {
    import {Router} from "express";

    function subdomain(
        prefix: string | undefined,
        callbackFn: Router
    ): SubdomainPromise;
    export = subdomain
}