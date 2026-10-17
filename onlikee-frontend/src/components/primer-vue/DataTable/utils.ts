export type IsAny<T> = 0 extends 1 & T ? true : false
type ArrayOfLength<
  Length extends number,
  Result extends unknown[] = [],
> = Result['length'] extends Length ? Result : ArrayOfLength<Length, [...Result, Result['length']]>
type MaxLength = ArrayOfLength<10>[number]
type ArrayIndex<A extends readonly unknown[], Keys extends number = never> = A extends readonly []
  ? Keys
  : A extends readonly [unknown, ...infer Tail]
    ? ArrayIndex<Tail, Keys | Tail['length']>
    : Keys
type ArrayWithinBounds<T> = T extends readonly unknown[] & { length: infer Length }
  ? Length extends MaxLength
    ? T
    : never
  : never

export type ObjectPaths<T> = T extends readonly unknown[] & ArrayWithinBounds<T>
  ? `${ArrayIndex<T>}` | PrefixPath<T, ArrayIndex<T>>
  : T extends readonly unknown[]
    ? never
    : T extends Date
      ? never
      : T extends object
        ? Extract<keyof T, string | number> | PrefixPath<T, Extract<keyof T, string | number>>
        : never

type PrefixPath<T, Prefix> =
  Prefix extends Extract<keyof T, number | string>
    ? `${Prefix}.${IsAny<T[Prefix]> extends true ? string : ObjectPaths<T[Prefix]>}`
    : never

export function getValueByPath(object: object, path: string | number): unknown {
  return String(path)
    .split('.')
    .reduce<unknown>((value, key) => {
      return value == null ? undefined : (value as Record<string, unknown>)[key]
    }, object)
}
