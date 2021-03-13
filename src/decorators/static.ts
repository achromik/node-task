export function staticDecorator<T>() {
  return <U extends T>(constructor: U): void => {
    constructor;
  };
}
