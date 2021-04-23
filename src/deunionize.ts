export type PropOr<
  T,
  P extends string | symbol | number,
  D = undefined
> = T extends Partial<Record<P, unknown>> ? T[P] : D

export type UnionKeys<T> = T extends unknown ? keyof T : never

export type Deunionize<T, R extends PropertyKey = 'reply_to_message'> = {
  [P in UnionKeys<T>]: P extends R ? Deunionize<PropOr<T, P>, R> : PropOr<T, P>
}

/**
 * Expose properties from all union variants.
 * @see https://github.com/telegraf/telegraf/issues/1388#issuecomment-791573609
 * @deprecated
 */
export function deunionize<T extends object | undefined>(t: T) {
  return t as Deunionize<T, never>
}
