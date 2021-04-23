export type PropOr<
  T,
  P extends string | symbol | number,
  D = undefined
> = T extends Partial<Record<P, unknown>> ? T[P] : D

export type UnionKeys<T> = T extends unknown ? keyof T : never

type U2I<U> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never

type IfDefined<T, P extends PropertyKey> = PropOr<T, P> extends undefined
  ? never
  : P

export type Deunionize<T> = {
  [P in keyof U2I<T> as IfDefined<T, P>]: Extract<
    U2I<NonNullable<PropOr<T, P>>>,
    object
  > extends never
    ? PropOr<T, P>
    : Deunionize<NonNullable<PropOr<T, P>>> | Extract<PropOr<T, P>, undefined>
}

/**
 * Expose properties from all union variants.
 * @see https://github.com/telegraf/telegraf/issues/1388#issuecomment-791573609
 * @deprecated
 */
export function deunionize<T extends object | undefined>(t: T) {
  return t as Deunionize<T>
}
