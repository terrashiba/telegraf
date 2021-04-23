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

export type Deunionize<T, R extends PropertyKey = 'reply_to_message'> = {
  [P in keyof U2I<T>]: P extends R
    ? Deunionize<NonNullable<PropOr<T, P>>, R>
    : PropOr<T, P>
}

/**
 * Expose properties from all union variants.
 * @see https://github.com/telegraf/telegraf/issues/1388#issuecomment-791573609
 * @deprecated
 */
export function deunionize<T extends object | undefined>(t: T) {
  return t as Deunionize<T, never>
}
