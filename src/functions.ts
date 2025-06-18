/**
 * If you have an object type w/ a call signature but also some extra properties
 * (e.g., `{ (): Promise<void>, restoreOriginal: () => void }`), this returns
 * just the call signature (`() => Promise<void>` in the example above).
 */
export type CallSignature<T extends (...args: any) => any> = (
  ...args: Parameters<T>
) => ReturnType<T>;

export type Bind1<
  F extends (arg0: A0, ...args: never[]) => unknown,
  A0 = never
> = F extends (arg0: A0, ...args: infer Args) => infer R
  ? (...args: Args) => R
  : never;

export type Bind2<
  F extends (arg0: A0, arg1: A1, ...args: never[]) => unknown,
  A0 = never,
  A1 = never
> = F extends (arg0: A0, arg1: A1, ...args: infer Args) => infer R
  ? (...args: Args) => R
  : never;

export type Bind3<
  F extends (arg0: A0, arg1: A1, arg2: A2, ...args: never[]) => unknown,
  A0 = never,
  A1 = never,
  A2 = never
> = F extends (arg0: A0, arg1: A1, arg2: A2, ...args: infer Args) => infer R
  ? (...args: Args) => R
  : never;

export type Bind4<
  F extends (
    arg0: A0,
    arg1: A1,
    arg2: A2,
    arg3: A3,
    ...args: never[]
  ) => unknown,
  A0 = never,
  A1 = never,
  A2 = never,
  A3 = never
> = F extends (
  arg0: A0,
  arg1: A1,
  arg2: A2,
  arg3: A3,
  ...args: infer Args
) => infer R
  ? (...args: Args) => R
  : never;
