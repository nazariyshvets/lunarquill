const stopEventPropagation =
  <T extends (...args: unknown[]) => unknown>(handler: T) =>
  (...args: Parameters<T>): ReturnType<T> => {
    const event = args[0] as Event;

    if (event && typeof event.stopPropagation === "function") {
      event.stopPropagation();
    }

    return handler(...args) as ReturnType<T>;
  };

export default stopEventPropagation;
