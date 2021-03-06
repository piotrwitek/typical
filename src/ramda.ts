import { the, If, List, Obj } from './util';
import { TupleHasIndex } from './array';
import { Overwrite, HasKey } from './object';
import { Inc } from './number';

// Ramda functions listed in #12512 redone with iteration:

export type PathFn<T, R extends List<string|number>, I extends number = 0> =
  { 1: PathFn<T[R[I]], R, Inc[I]>, 0: T }[TupleHasIndex<R, I>];
the<'e', PathFn<{ a: { b: ['c', { d: 'e' }] } }, ['a', 'b', 1, 'd']>>();

export declare function path<T, R extends List<string|number>>(obj: T, path: R): PathFn<T, R>;
let par1: { a: { b: ['c', { d: 'e' }] } } = { a: { b: ['c', { d: 'e' }] } };
let par2: ['a', 'b', 1, 'd'] = ['a', 'b', 1, 'd'];
const pathTest = path(par1, par2);
// fails :(, should also yield "e"

export type PathOrFn<T, Def, R extends List<string|number>, I extends number = 0> =
  { 1: If<HasKey<T, R[I]>, PathOrFn<T[R[I]], Def, R, Inc[I]>, Def>, 0: T }[TupleHasIndex<R, I>];
the<'e', PathOrFn<{ a: { b: ['c', { d: 'e' }] } }, "oh", ['a', 'b', 1, 'd']>>();
// ^ error: 'oh'
// ^ regression in recent TS?
the<'oh', PathOrFn<{ a: { b: ['c', { d: 'e' }] } }, "oh", ['a', 'b', 4]>>();

export type MergeAllFn<R extends List<Obj<any>>, I extends number = 0, T = {}> =
  { 1: MergeAllFn<R, Inc[I], Overwrite<T, R[I]>>, 0: T }[TupleHasIndex<R, I>];
the<{ a: 1, b: 3, c: 4, d: 5 }, MergeAllFn<[{ a: 1, b: 2 }, { b: 3, c: 4 }, { d: 5 }]>>();

export type FromPairsFn<R extends List<[string|number, any]>, I extends number = 0, T = {}> =
  { 1: FromPairsFn<R, Inc[I], Overwrite<T, { [P in R[I][0]]: R[I][1] }>>, 0: T }[TupleHasIndex<R, I>];
the<{ a: 5, b: 2, c: 3 }, FromPairsFn<[['a', 1], ['b', 2], ['c', 3], ['a', 5]]>>();

export type ZipObjectFn<R extends List<string>, R2 extends List<any>, I extends number = 0, T = {}> =
  { 1: ZipObjectFn<R, R2, Inc[I], Overwrite<T, { [P in R[I]]: R2[I] }>>, 0: T }[TupleHasIndex<R, I>];
the<{ a: 1, b: 2, c: 3 }, ZipObjectFn<['a', 'b', 'c'], [1, 2, 3]>>();

// `reduce`: needs `ReturnType` (#6606) for its dynamic reducer functions. see #12512 for Ramda functions that need this.

// type MapFn<
//     F extends (v: T) => any,
//     Tpl extends T[],
//     T,
//     // if empty tuple allowed:
//     // I extends number = 0,
//     // Acc = []
//     // otherwise:
//     I extends number = 1,
//     Acc = [F(Tpl[0])]
// > = { 1: MapFn<F, Tpl, T, Inc[I], [...Acc, F(Tpl[I])]>; 0: Acc; }[TupleHasIndex<Tpl, Int>];
// // ^ needs #5453
// declare function mapTuple<F extends (v: T) => any, Tpl extends T[], T>(f: F, tpl: Tpl): MapFn<F, Tpl, T>;
// // ^ needs #6606

// #12838
declare function inc(n: number): number; // +1
declare function identity<T>(a: T): T;
declare function compose<V0, T1>(fn0: (x0: V0) => T1): (x0: V0) => T1;
declare function compose<V0, T1, T2>(fn1: (x: T1) => T2, fn0: (x: V0) => T1): (x: V0) => T2;
declare function pipe   <V0, T1>(fn0: (x0: V0) => T1): (x0: V0) => T1;                           // arity 1: same as compose
declare function pipe   <V0, T1, T2>(fn0: (x: V0) => T1, fn1: (x: T1) => T2): (x: V0) => T2;     // arity 2: params swapped
// don't use generics if it can't resolve them right away:
compose(identity) // generics lost, now {} => {}
pipe   (identity) // ditto
// argument order apparently matters too:
pipe   (inc, identity); // ok, number -> number
compose(identity, inc); // nope, number => {}
// also no reasoning backward:
compose(inc, identity); // {} => number
pipe   (identity, inc); // {} => number
