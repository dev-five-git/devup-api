export type Conditional<T> = keyof T extends undefined ? string : keyof T
