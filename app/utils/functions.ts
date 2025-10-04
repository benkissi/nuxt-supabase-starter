export const getInitials = (name: string): string => {
  if (!name) return "";
  const parts = name.split(" ");
  if (parts.length === 1) {
    return parts[0]?.charAt(0).toUpperCase() ?? "";
  }
  return (
    (parts[0]?.charAt(0).toUpperCase() ?? "") +
    (parts[1]?.charAt(0).toUpperCase() ?? "")
  );
};

export const promisify = <T>(value: T, delay = 0): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), delay);
  });
};